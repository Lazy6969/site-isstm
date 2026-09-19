<?php

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\Models\User;
use App\Role;
use App\StatutInscription;

it('forbids a non-admin from listing inscriptions', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/inscriptions')->assertForbidden();
});

it('lets an admin enroll an étudiant in a classe', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $classe = Classe::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/inscriptions', [
        'etudiant_id' => $etudiant->id,
        'classe_id' => $classe->id,
        'annee' => '2025',
    ])->assertRedirect();

    expect(Inscription::where('etudiant_id', $etudiant->id)->where('annee', '2025')->exists())->toBeTrue();
});

it('refuses a second inscription for the same étudiant and année', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $classe = Classe::factory()->create();
    Inscription::factory()->create(['etudiant_id' => $etudiant->id, 'annee' => '2025']);

    $this->actingAs($admin)->post('/console/scolarite/inscriptions', [
        'etudiant_id' => $etudiant->id,
        'classe_id' => $classe->id,
        'annee' => '2025',
    ])->assertSessionHasErrors('annee');
});

it('lets an admin validate an inscription', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create(['statut' => StatutInscription::EnAttente]);

    $this->actingAs($admin)->put("/console/scolarite/inscriptions/{$inscription->id}", [
        'statut' => StatutInscription::Validee->value,
    ])->assertRedirect();

    expect($inscription->refresh()->statut)->toBe(StatutInscription::Validee);
});

it('lets an admin delete an inscription', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create();

    $this->actingAs($admin)->delete("/console/scolarite/inscriptions/{$inscription->id}")->assertRedirect();

    expect(Inscription::find($inscription->id))->toBeNull();
});
