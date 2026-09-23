<?php

use App\EvenementStatus;
use App\Models\Evenement;
use App\Models\User;
use App\Role;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * No seeded role currently holds content-create permissions without also
 * holding evenements.publish — this ad-hoc role exercises the "editor" side
 * of the workflow without deciding which real role should get it.
 */
function createEvenementEditor(): User
{
    SpatieRole::findOrCreate('evenements-editor-test', 'web')
        ->syncPermissions(['evenements.view', 'evenements.create', 'evenements.edit']);

    $editor = User::factory()->create();
    $editor->assignRole('evenements-editor-test');

    return $editor;
}

it('downgrades a non-publisher\'s event straight to en_attente', function () {
    $editor = createEvenementEditor();

    $this->actingAs($editor)->post('/console/evenements', [
        'titre' => 'Événement soumis',
        'date_debut' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'categorie' => 'general',
        'status' => 'publie',
    ])->assertRedirect();

    $evenement = Evenement::latest('id')->first();
    expect($evenement->status)->toBe(EvenementStatus::EnAttente);
});

it('defaults an omitted status to publie for a publisher, preserving legacy behaviour', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/evenements', [
        'titre' => 'Sans statut',
        'date_debut' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'categorie' => 'general',
    ])->assertRedirect();

    expect(Evenement::latest('id')->first()->status)->toBe(EvenementStatus::Publie);
});

it('lets a non-publisher save a plain draft event', function () {
    $editor = createEvenementEditor();

    $this->actingAs($editor)->post('/console/evenements', [
        'titre' => 'Brouillon simple',
        'date_debut' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'categorie' => 'general',
        'status' => 'brouillon',
    ])->assertRedirect();

    expect(Evenement::latest('id')->first()->status)->toBe(EvenementStatus::Brouillon);
});

it('lets a publisher approve a pending event', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $evenement = Evenement::factory()->create(['status' => EvenementStatus::EnAttente]);

    $this->actingAs($admin)->post("/console/evenements/{$evenement->id}/approve")->assertRedirect();

    $evenement->refresh();
    expect($evenement->status)->toBe(EvenementStatus::Publie);
    expect($evenement->validated_by)->toBe($admin->id);
});

it('lets a publisher reject a pending event with a reason', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $evenement = Evenement::factory()->create(['status' => EvenementStatus::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/evenements/{$evenement->id}/reject", ['rejection_reason' => 'Date incorrecte'])
        ->assertRedirect();

    $evenement->refresh();
    expect($evenement->status)->toBe(EvenementStatus::Rejete);
    expect($evenement->rejection_reason)->toBe('Date incorrecte');
});

it('forbids approving or rejecting an event without evenements.publish', function () {
    $editor = createEvenementEditor();
    $evenement = Evenement::factory()->create(['status' => EvenementStatus::EnAttente]);

    $this->actingAs($editor)->post("/console/evenements/{$evenement->id}/approve")->assertForbidden();
    $this->actingAs($editor)->post("/console/evenements/{$evenement->id}/reject", ['rejection_reason' => 'x'])->assertForbidden();
});

it('refuses to approve an event that is not pending', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $evenement = Evenement::factory()->create(['status' => EvenementStatus::Publie]);

    $this->actingAs($admin)->post("/console/evenements/{$evenement->id}/approve")->assertStatus(409);
});

it('never exposes a pending or rejected event on the public site', function () {
    Evenement::factory()->create(['status' => EvenementStatus::EnAttente, 'date_debut' => now()->addDays(3)]);
    Evenement::factory()->create(['status' => EvenementStatus::Rejete, 'date_debut' => now()->addDays(3)]);
    Evenement::factory()->create(['status' => EvenementStatus::Publie, 'date_debut' => now()->addDays(3)]);

    $this->get('/evenements')->assertInertia(fn ($page) => $page->component('Evenements/Index')->has('evenements', 1));
});
