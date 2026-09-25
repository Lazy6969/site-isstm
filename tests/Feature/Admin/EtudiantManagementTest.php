<?php

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\Models\User;
use App\Role;
use App\StatutEtudiant;

it('forbids a non-admin from listing étudiants', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/scolarite/etudiants')->assertForbidden();
});

it('lets an admin create a dossier étudiant for a student user', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $studentUser = User::factory()->role(Role::Etudiant)->create();
    $classe = Classe::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/etudiants', [
        'user_id' => $studentUser->id,
        'classe_id' => $classe->id,
        'matricule' => 'ISSTM-2025-001',
    ])->assertRedirect();

    expect(Etudiant::where('user_id', $studentUser->id)->exists())->toBeTrue();
});

it('refuses to create a dossier for a user who is not an étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $teacherUser = User::factory()->role(Role::Enseignant)->create();

    $this->actingAs($admin)->post('/console/scolarite/etudiants', [
        'user_id' => $teacherUser->id,
        'matricule' => 'ISSTM-2025-002',
    ])->assertSessionHasErrors('user_id');
});

it('refuses to create a second dossier for the same user', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();

    $this->actingAs($admin)->post('/console/scolarite/etudiants', [
        'user_id' => $etudiant->user_id,
        'matricule' => 'ISSTM-2025-003',
    ])->assertSessionHasErrors('user_id');
});

it('shows the full dossier of an étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();

    $this->actingAs($admin)->get("/console/scolarite/etudiants/{$etudiant->id}")
        ->assertInertia(fn ($page) => $page->where('etudiant.id', $etudiant->id));
});

it('lets an admin update a dossier étudiant', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $nouvelleClasse = Classe::factory()->create();

    $this->actingAs($admin)->put("/console/scolarite/etudiants/{$etudiant->id}", [
        'classe_id' => $nouvelleClasse->id,
        'matricule' => $etudiant->matricule,
        'statut' => StatutEtudiant::Suspendu->value,
    ])->assertRedirect();

    $etudiant->refresh();
    expect($etudiant->classe_id)->toBe($nouvelleClasse->id);
    expect($etudiant->statut)->toBe(StatutEtudiant::Suspendu);
});

it('lets an admin delete a student account entirely, wiping the dossier and its inscriptions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $inscription = Inscription::factory()->for($etudiant)->create();
    $userId = $etudiant->user_id;

    $this->actingAs($admin)->delete("/console/scolarite/etudiants/{$etudiant->id}")
        ->assertRedirect('/console/scolarite/etudiants');

    expect(User::find($userId))->toBeNull();
    expect(Etudiant::find($etudiant->id))->toBeNull();
    expect(Inscription::find($inscription->id))->toBeNull();
});

it('blocks login once a student account has been deleted', function () {
    $etudiant = Etudiant::factory()->create();
    $email = $etudiant->user->email;

    $etudiant->user->delete();

    $this->post('/login', ['email' => $email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('forbids a non-admin from deleting a dossier étudiant', function () {
    $etudiant = Etudiant::factory()->create();
    $other = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($other)->delete("/console/scolarite/etudiants/{$etudiant->id}")->assertForbidden();

    expect(Etudiant::find($etudiant->id))->not->toBeNull();
});
