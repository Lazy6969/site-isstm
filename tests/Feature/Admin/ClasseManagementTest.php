<?php

use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\User;
use App\PreinscriptionStatus;
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

it('lists enrolled students and pending candidates together on the niveaux page, each in its niveau', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['nom_fr' => 'Informatique']);
    $classe = Classe::factory()->create(['filiere_id' => $filiere->id, 'niveau' => 'L1']);
    $etudiant = Etudiant::factory()->create(['classe_id' => $classe->id]);
    Candidat::factory()->create(['nom' => 'ENATTENTE', 'prenoms' => 'Paul', 'status' => PreinscriptionStatus::Soumis, 'filiere_id' => $filiere->id, 'niveau' => 'L2']);
    Candidat::factory()->create(['nom' => 'BROUILLON', 'status' => PreinscriptionStatus::Brouillon, 'niveau' => 'L2']);
    Candidat::factory()->create(['nom' => 'REFUSE', 'status' => PreinscriptionStatus::Refuse, 'niveau' => 'L2']);

    $this->actingAs($admin)->get('/console/scolarite/classes')->assertInertia(fn ($page) => $page
        ->component('Admin/Scolarite/Classes/Index')
        ->has('membres', 2)
        ->where('membres.0.type', fn ($type) => in_array($type, ['etudiant', 'preinscrit'], true))
        ->where('membres', fn ($membres) => collect($membres)->contains(fn ($m) => $m['type'] === 'etudiant' && $m['niveau'] === 'L1' && $m['reference'] === $etudiant->matricule)
            && collect($membres)->contains(fn ($m) => $m['type'] === 'preinscrit' && $m['niveau'] === 'L2' && $m['nom'] === 'ENATTENTE Paul'))
    );
});

it('lists an accepted candidate once, as a student, not again as a pending candidate', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $candidat = Candidat::factory()->create(['status' => PreinscriptionStatus::Soumis, 'niveau' => 'L1']);
    Etudiant::factory()->create(['candidat_id' => $candidat->id, 'classe_id' => null]);

    $this->actingAs($admin)->get('/console/scolarite/classes')->assertInertia(fn ($page) => $page
        ->has('membres', 1)
        ->where('membres.0.type', 'etudiant')
        ->where('membres.0.niveau', 'L1')
    );
});

it('shows the niveau list when opening a student dossier', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $classe = Classe::factory()->create(['niveau' => 'L3']);
    $etudiant = Etudiant::factory()->create(['classe_id' => $classe->id]);

    $this->actingAs($admin)->get("/console/scolarite/etudiants/{$etudiant->id}")->assertInertia(fn ($page) => $page
        ->component('Admin/Scolarite/Etudiants/Show')
        ->where('classes', fn ($classes) => collect($classes)->contains(fn ($c) => $c['id'] === $classe->id && $c['niveau'] === 'L3'))
    );
});
