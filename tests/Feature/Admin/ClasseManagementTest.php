<?php

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\User;
use App\Role;

it('forbids a non-admin from listing classes', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/classes')->assertForbidden();
});

it('lets an admin create a classe', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/classes', [
        'nom' => 'L1 Info A',
        'filiere_id' => $filiere->id,
        'niveau' => 'L1',
        'annee' => '2025',
        'effectif_max' => 40,
    ])->assertRedirect();

    expect(Classe::where('nom', 'L1 Info A')->exists())->toBeTrue();
});

it('lets an admin update a classe', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $classe = Classe::factory()->create(['nom' => 'L1 Info A']);

    $this->actingAs($admin)->put("/console/scolarite/classes/{$classe->id}", [
        'nom' => 'L1 Info B',
        'filiere_id' => $classe->filiere_id,
        'niveau' => $classe->niveau,
        'annee' => $classe->annee,
        'effectif_max' => 50,
    ])->assertRedirect();

    expect($classe->refresh()->nom)->toBe('L1 Info B');
});

it('refuses to delete a classe that still has étudiants', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $classe = Classe::factory()->create();
    Etudiant::factory()->create(['classe_id' => $classe->id]);

    $this->actingAs($admin)->delete("/console/scolarite/classes/{$classe->id}")->assertStatus(409);

    expect(Classe::find($classe->id))->not->toBeNull();
});
