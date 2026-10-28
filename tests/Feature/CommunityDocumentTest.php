<?php

use App\CommunityDocumentStatus;
use App\Models\CommunityDocument;
use App\Models\Filiere;
use App\Models\User;
use App\Notifications\CommunityDocumentSubmitted;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

it('forbids a user without a community role from the Leçons/Sujets pages', function () {
    $user = User::factory()->role(Role::Materiel)->create();

    $this->actingAs($user)->get('/communaute-fichiers/lecons')->assertForbidden();
    $this->actingAs($user)->post('/communaute-fichiers', ['category' => 'lecon', 'title' => 'Chimie', 'file' => UploadedFile::fake()->create('chimie.pdf', 100)])->assertForbidden();
});

it('lets a student upload a leçon that lands pending, not auto-published', function () {
    Storage::fake('public');
    $student = User::factory()->role(Role::Etudiant)->create();

    $response = $this->actingAs($student)->post('/communaute-fichiers', [
        'category' => 'lecon',
        'title' => 'Chimie organique',
        'file' => UploadedFile::fake()->create('chimie.pdf', 500),
    ]);

    $response->assertRedirect();
    $document = CommunityDocument::first();
    expect($document->user_id)->toBe($student->id)
        ->and($document->category)->toBe('lecon')
        ->and($document->status)->toBe(CommunityDocumentStatus::EnAttente)
        ->and($document->validated_by)->toBeNull();
    Storage::disk('public')->assertExists(Str::after($document->file_path, 'storage/'));
});

it('auto-approves an upload from a moderator', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/communaute-fichiers', [
        'category' => 'sujet',
        'title' => 'Examen 2026',
        'file' => UploadedFile::fake()->image('examen.jpg'),
    ])->assertRedirect();

    $document = CommunityDocument::first();
    expect($document->status)->toBe(CommunityDocumentStatus::Valide)
        ->and($document->validated_by)->toBe($admin->id);
});

it('accepts a PDF or an image but rejects any other file type', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)
        ->post('/communaute-fichiers', ['category' => 'lecon', 'title' => 'Notes', 'file' => UploadedFile::fake()->create('notes.exe', 10)])
        ->assertSessionHasErrors('file');
});

it('only shows a pending document to its own author, not to other students', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    $document = CommunityDocument::factory()->for($student)->create(['category' => 'lecon', 'status' => CommunityDocumentStatus::EnAttente]);

    $this->actingAs($student)->get('/communaute-fichiers/lecons')
        ->assertInertia(fn ($page) => $page->has('documents', 1));

    $this->actingAs($other)->get('/communaute-fichiers/lecons')
        ->assertInertia(fn ($page) => $page->has('documents', 0));
});

it('shows every pending document to a moderator', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $admin = User::factory()->role(Role::Admin)->create();
    CommunityDocument::factory()->for($student)->create(['category' => 'sujet', 'status' => CommunityDocumentStatus::EnAttente]);

    $this->actingAs($admin)->get('/communaute-fichiers/sujets')
        ->assertInertia(fn ($page) => $page->has('documents', 1)->where('canModerate', true));
});

it('lets a moderator approve a pending document', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $document = CommunityDocument::factory()->create(['status' => CommunityDocumentStatus::EnAttente]);

    $this->actingAs($admin)->post("/communaute-fichiers/{$document->id}/approuver")->assertRedirect();

    expect($document->fresh()->status)->toBe(CommunityDocumentStatus::Valide);
    expect($document->fresh()->validated_by)->toBe($admin->id);
});

it('lets a moderator reject a pending document with a reason', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $document = CommunityDocument::factory()->create(['status' => CommunityDocumentStatus::EnAttente]);

    $this->actingAs($admin)
        ->post("/communaute-fichiers/{$document->id}/rejeter", ['rejection_reason' => 'Fichier illisible'])
        ->assertRedirect();

    expect($document->fresh()->status)->toBe(CommunityDocumentStatus::Rejete)
        ->and($document->fresh()->rejection_reason)->toBe('Fichier illisible');
});

it('forbids a non-moderator from approving or rejecting', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $document = CommunityDocument::factory()->create(['status' => CommunityDocumentStatus::EnAttente]);

    $this->actingAs($student)->post("/communaute-fichiers/{$document->id}/approuver")->assertForbidden();
    $this->actingAs($student)->post("/communaute-fichiers/{$document->id}/rejeter")->assertForbidden();
});

it('refuses to approve or reject a document that is not pending', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $document = CommunityDocument::factory()->create(['status' => CommunityDocumentStatus::Valide]);

    $this->actingAs($admin)->post("/communaute-fichiers/{$document->id}/approuver")->assertStatus(409);
});

it('lets the author edit their own document, which sends it back to pending', function () {
    Storage::fake('public');
    $student = User::factory()->role(Role::Etudiant)->create();
    $document = CommunityDocument::factory()->for($student)->create(['status' => CommunityDocumentStatus::Valide, 'title' => 'Ancien titre']);

    $this->actingAs($student)->put("/communaute-fichiers/{$document->id}", ['title' => 'Nouveau titre'])->assertRedirect();

    $document->refresh();
    expect($document->title)->toBe('Nouveau titre')
        ->and($document->status)->toBe(CommunityDocumentStatus::EnAttente);
});

it('forbids a student from editing or deleting someone else\'s document', function () {
    $author = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    $document = CommunityDocument::factory()->for($author)->create();

    $this->actingAs($other)->put("/communaute-fichiers/{$document->id}", ['title' => 'Piraté'])->assertForbidden();
    $this->actingAs($other)->delete("/communaute-fichiers/{$document->id}")->assertForbidden();
});

it('lets the author delete their own document', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $document = CommunityDocument::factory()->for($student)->create();

    $this->actingAs($student)->delete("/communaute-fichiers/{$document->id}")->assertRedirect();

    expect(CommunityDocument::find($document->id))->toBeNull();
    expect(CommunityDocument::onlyTrashed()->find($document->id))->not->toBeNull();
});

it('lists and permanently deletes a leçon/sujet from the admin Corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('lecons-sujets/old.pdf', 'fake');
    $document = CommunityDocument::factory()->create(['file_path' => 'storage/lecons-sujets/old.pdf']);
    $document->delete();

    $this->actingAs($admin)->get('/console/corbeille')
        ->assertInertia(fn ($page) => $page->where('items.0.type', 'lecons-sujets'));

    $this->actingAs($admin)->delete("/console/corbeille/lecons-sujets/{$document->id}")->assertRedirect();

    expect(CommunityDocument::onlyTrashed()->find($document->id))->toBeNull();
    Storage::disk('public')->assertMissing('lecons-sujets/old.pdf');
});

it('stores the filière, niveau and année tagged on upload', function () {
    Storage::fake('public');
    $student = User::factory()->role(Role::Etudiant)->create();
    $filiere = Filiere::factory()->create();

    $this->actingAs($student)->post('/communaute-fichiers', [
        'category' => 'sujet',
        'title' => 'Examen blanc',
        'filiere_ids' => [$filiere->id],
        'niveaux' => ['L2'],
        'annee' => '2026',
        'file' => UploadedFile::fake()->image('examen.jpg'),
    ])->assertRedirect();

    $document = CommunityDocument::first();
    expect($document->filieres->pluck('id')->all())->toBe([$filiere->id])
        ->and($document->niveaux)->toBe(['L2'])
        ->and($document->annee)->toBe('2026');
});

it('lets an upload target several filières and several niveaux at once', function () {
    Storage::fake('public');
    $student = User::factory()->role(Role::Etudiant)->create();
    $filiereA = Filiere::factory()->create();
    $filiereB = Filiere::factory()->create();

    $this->actingAs($student)->post('/communaute-fichiers', [
        'category' => 'lecon',
        'title' => 'Algèbre',
        'filiere_ids' => [$filiereA->id, $filiereB->id],
        'niveaux' => ['L1', 'L2'],
        'file' => UploadedFile::fake()->create('algebre.pdf', 100),
    ])->assertRedirect();

    $document = CommunityDocument::first();
    expect($document->filieres->pluck('id')->sort()->values()->all())->toBe(collect([$filiereA->id, $filiereB->id])->sort()->values()->all())
        ->and($document->niveaux)->toBe(['L1', 'L2']);
});

it("lets the author change a document's filières and niveaux when editing it", function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $filiereA = Filiere::factory()->create();
    $filiereB = Filiere::factory()->create();
    $document = CommunityDocument::factory()->for($student)->create(['niveaux' => ['L1']]);
    $document->filieres()->sync([$filiereA->id]);

    $this->actingAs($student)->put("/communaute-fichiers/{$document->id}", [
        'title' => $document->title,
        'filiere_ids' => [$filiereB->id],
        'niveaux' => ['M1', 'M2'],
    ])->assertRedirect();

    $document->refresh();
    expect($document->filieres->pluck('id')->all())->toBe([$filiereB->id])
        ->and($document->niveaux)->toBe(['M1', 'M2']);
});

it('passes the three most recent academic years to the Leçons/Sujets page', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->get('/communaute-fichiers/lecons')
        ->assertInertia(fn ($page) => $page->has('annees', 3));
});

it('notifies every moderator when a non-moderator submits a file', function () {
    Notification::fake();
    $student = User::factory()->role(Role::Etudiant)->create();
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($student)->post('/communaute-fichiers', [
        'category' => 'lecon',
        'title' => 'Chimie organique',
        'file' => UploadedFile::fake()->create('chimie.pdf', 100),
    ]);

    Notification::assertSentTo($admin, CommunityDocumentSubmitted::class);
});

it('does not notify anyone when a moderator auto-approves their own upload', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/communaute-fichiers', [
        'category' => 'lecon',
        'title' => 'Chimie organique',
        'file' => UploadedFile::fake()->create('chimie.pdf', 100),
    ]);

    Notification::assertNothingSent();
});

it('passes the filière list and the conversation list to the Leçons/Sujets page', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    Filiere::factory()->create(['nom_fr' => 'Informatique']);

    $this->actingAs($student)->get('/communaute-fichiers/lecons')->assertInertia(fn ($page) => $page
        ->has('filieres', 1)
        ->where('filieres.0.nom_fr', 'Informatique')
        ->has('conversations'));
});
