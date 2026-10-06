<?php

use App\ArchiveVault;
use App\Models\ActionArchive;
use App\Models\Partenaire;
use App\Models\Setting;
use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

it('archives a console change with who, what and old → new values', function () {
    $admin = User::factory()->role(Role::Admin)->create(['name' => 'Rija Admin']);
    $partenaire = Partenaire::factory()->create(['nom' => 'Ancien nom']);

    $this->actingAs($admin)
        ->put("/console/partenaires/{$partenaire->id}", ['nom' => 'Nouveau nom', 'site_url' => 'https://exemple.mg'])
        ->assertRedirect();

    $archive = ActionArchive::query()->latest('id')->first();

    expect($archive)->not->toBeNull()
        ->and($archive->user_name)->toBe('Rija Admin')
        ->and($archive->method)->toBe('PUT')
        ->and($archive->module)->toBe('partenaires')
        ->and($archive->action)->toBe('update')
        ->and($archive->outcome)->toBe('success')
        ->and($archive->subject_label)->toBe('Nouveau nom')
        ->and($archive->changesList()[0]['fields']['nom'])->toBe(['Ancien nom', 'Nouveau nom']);
});

it('does not archive read-only requests', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/partenaires')->assertOk();

    expect(ActionArchive::count())->toBe(0);
});

it('archives a refused action as failed', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    $partenaire = Partenaire::factory()->create();

    $this->actingAs($etudiant)->put("/console/partenaires/{$partenaire->id}", ['nom' => 'Piraté'])->assertForbidden();

    $archive = ActionArchive::query()->latest('id')->first();

    expect($archive->outcome)->toBe('failed')
        ->and($archive->status_code)->toBe(403)
        ->and($partenaire->fresh()->nom)->not->toBe('Piraté');
});

it('locks entries: they cannot be edited or deleted', function () {
    $archive = ActionArchive::record([
        'user_name' => 'Test',
        'method' => 'POST',
        'path' => '/console/test',
        'outcome' => 'success',
    ]);

    expect(fn () => $archive->update(['user_name' => 'Autre']))->toThrow(LogicException::class)
        ->and(fn () => $archive->delete())->toThrow(LogicException::class)
        ->and(ActionArchive::count())->toBe(1);
});

it('chains entries and detects tampering', function () {
    foreach (['a', 'b', 'c'] as $letter) {
        ActionArchive::record(['user_name' => $letter, 'method' => 'POST', 'path' => "/console/{$letter}", 'outcome' => 'success']);
    }

    expect(ActionArchive::verifyChain())->toMatchArray(['ok' => true, 'checked' => 3, 'broken_id' => null]);

    $second = ActionArchive::query()->orderBy('id')->skip(1)->first();
    DB::table('action_archives')->where('id', $second->id)->update(['user_name' => 'Falsifié']);

    expect(ActionArchive::verifyChain())->toMatchArray(['ok' => false, 'broken_id' => $second->id]);
});

it('shows the archive only to users allowed to see the activity log', function () {
    $this->actingAs(User::factory()->role(Role::Etudiant)->create())->get('/console/archives')->assertForbidden();

    $this->actingAs(User::factory()->role(Role::Admin)->create())
        ->get('/console/archives')
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Archives/Index')
            ->has('archives.data')
            ->has('stats')
            ->has('options'));
});

it('filters the archive and verifies the chain over HTTP', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    ActionArchive::record(['user_name' => 'Alice', 'method' => 'POST', 'path' => '/console/a', 'module' => 'news', 'action' => 'store', 'outcome' => 'success']);
    ActionArchive::record(['user_name' => 'Bob', 'method' => 'DELETE', 'path' => '/console/b', 'module' => 'gallery', 'action' => 'destroy', 'outcome' => 'success']);

    $this->actingAs($admin)->get('/console/archives?user=Alice')
        ->assertInertia(fn ($page) => $page->has('archives.data', 1)->where('archives.data.0.user_name', 'Alice'));

    $this->actingAs($admin)->getJson('/console/archives/verify')->assertOk()->assertJson(['ok' => true, 'checked' => 2]);
});

describe('archive key', function () {
    beforeEach(function () {
        $this->vault = app(ArchiveVault::class);
        $this->vault->setKey('S445566F!');
        $this->admin = User::factory()->role(Role::Admin)->create(['name' => 'Rija Admin']);
        $this->unlocked = [ArchiveVault::SESSION_KEY => now()->timestamp];
    });

    it('shows the lock screen until the right key is entered', function () {
        $this->actingAs($this->admin)->get('/console/archives')
            ->assertInertia(fn ($page) => $page->component('Admin/Archives/Locked'));

        $this->actingAs($this->admin)->post('/console/archives/unlock', ['password' => 'mauvaise'])
            ->assertSessionHasErrors('password');

        $this->actingAs($this->admin)->post('/console/archives/unlock', ['password' => 'S445566F!'])
            ->assertRedirect('/console/archives');

        $this->actingAs($this->admin)->get('/console/archives')
            ->assertInertia(fn ($page) => $page->component('Admin/Archives/Index'));
    });

    it('never stores the key in clear text', function () {
        $stored = Setting::get('archives.password_hash');

        expect($stored)->not->toContain('S445566F!')
            ->and(Hash::check('S445566F!', $stored))->toBeTrue();
    });

    it('blocks every archive endpoint while locked', function () {
        $this->actingAs($this->admin)->getJson('/console/archives/verify')->assertStatus(423);
        $this->actingAs($this->admin)->get('/console/archives/export')->assertRedirect('/console/archives');
    });

    it('throttles wrong keys', function () {
        foreach (range(1, 5) as $attempt) {
            $this->actingAs($this->admin)->post('/console/archives/unlock', ['password' => 'x'.$attempt]);
        }

        $this->actingAs($this->admin)->post('/console/archives/unlock', ['password' => 'S445566F!'])
            ->assertSessionHasErrors('password');
    });

    it('records failed unlock attempts in the archive without the typed key', function () {
        $this->actingAs($this->admin)->post('/console/archives/unlock', ['password' => 'devine']);

        $entry = ActionArchive::query()->latest('id')->first();

        expect($entry->action)->toBe('unlock')
            ->and($entry->outcome)->toBe('failed')
            ->and(json_encode($entry->inputData()))->not->toContain('devine');
    });

    it('restores an updated record with the key', function () {
        $partenaire = Partenaire::factory()->create(['nom' => 'Avant']);
        $this->actingAs($this->admin)->put("/console/partenaires/{$partenaire->id}", ['nom' => 'Après', 'site_url' => 'https://a.mg']);
        $update = ActionArchive::query()->where('action', 'update')->latest('id')->first();

        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post("/console/archives/{$update->id}/restore", ['password' => 'mauvaise', 'change' => 0])
            ->assertSessionHasErrors('password');
        expect($partenaire->fresh()->nom)->toBe('Après');

        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post("/console/archives/{$update->id}/restore", ['password' => 'S445566F!', 'change' => 0])
            ->assertSessionHasNoErrors();

        $restore = ActionArchive::query()->latest('id')->first();
        expect($partenaire->fresh()->nom)->toBe('Avant')
            ->and($restore->action)->toBe('restore')
            ->and($restore->target_id)->toBe($update->id)
            ->and($restore->changesList()[0]['fields']['nom'])->toBe(['Après', 'Avant']);

        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post("/console/archives/{$update->id}/restore", ['password' => 'S445566F!', 'change' => 0])
            ->assertSessionHasErrors('restore');
    });

    it('restores a deleted record', function () {
        $partenaire = Partenaire::factory()->create(['nom' => 'Supprimé']);
        $this->actingAs($this->admin)->delete("/console/partenaires/{$partenaire->id}");
        $deletion = ActionArchive::query()->where('action', 'destroy')->latest('id')->first();

        expect(Partenaire::find($partenaire->id))->toBeNull();

        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post("/console/archives/{$deletion->id}/restore", ['password' => 'S445566F!', 'change' => 0])
            ->assertSessionHasNoErrors();

        expect(Partenaire::find($partenaire->id)?->nom)->toBe('Supprimé');
    });

    it('adds notes without altering the original entry', function () {
        $original = ActionArchive::record(['user_name' => 'Alice', 'method' => 'POST', 'path' => '/console/x', 'outcome' => 'success']);

        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post("/console/archives/{$original->id}/note", ['note' => 'Vérifié avec la direction'])
            ->assertSessionHasNoErrors();

        $note = ActionArchive::query()->latest('id')->first();

        expect($note->action)->toBe('note')
            ->and($note->target_id)->toBe($original->id)
            ->and($note->inputData()['note'])->toBe('Vérifié avec la direction')
            ->and($original->fresh()->user_name)->toBe('Alice')
            ->and(ActionArchive::verifyChain()['ok'])->toBeTrue();
    });

    it('makes the archive public and protected again only with the key', function () {
        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post('/console/archives/visibility', ['password' => 'faux', 'protected' => false])
            ->assertSessionHasErrors('password');
        expect($this->vault->isProtected())->toBeTrue();

        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post('/console/archives/visibility', ['password' => 'S445566F!', 'protected' => false]);
        expect($this->vault->isProtected())->toBeFalse();

        $this->actingAs($this->admin)->get('/console/archives')
            ->assertInertia(fn ($page) => $page->component('Admin/Archives/Index'));
    });

    it('changes the key and locks the session', function () {
        $this->actingAs($this->admin)->withSession($this->unlocked)
            ->post('/console/archives/password', [
                'current_password' => 'S445566F!',
                'password' => 'NouvelleCle2026',
                'password_confirmation' => 'NouvelleCle2026',
            ])->assertRedirect('/console/archives');

        expect($this->vault->checkKey('NouvelleCle2026'))->toBeTrue()
            ->and($this->vault->checkKey('S445566F!'))->toBeFalse();
    });
});
