<?php

use App\MaterielDeplacementStatut;
use App\MaterielEtat;
use App\Models\Materiel;
use App\Models\MaterielDeplacement;
use App\Models\User;
use App\Role;

it('forbids a student from listing the matériel', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/materiel')->assertForbidden();
});

it('lets the responsable-materiel role list the matériel on its standalone page', function () {
    $responsable = User::factory()->role(Role::Materiel)->create();
    Materiel::factory()->create(['lieu' => 'Bureau de Direction', 'nom' => 'Table de bureau']);

    $this->actingAs($responsable)->get('/materiel')->assertInertia(fn ($page) => $page
        ->component('Materiel/Index')
        ->where('embedded', false)
        ->has('materiels', 1)
        ->where('materiels.0.nom', 'Table de bureau')
    );
});

it('lets an admin reach the same page embedded in the console', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Materiel::factory()->create(['lieu' => 'Bureau de Direction', 'nom' => 'Table de bureau']);

    $this->actingAs($admin)->get('/console/materiel')->assertInertia(fn ($page) => $page
        ->component('Materiel/Index')
        ->where('embedded', true)
        ->has('materiels', 1)
    );
});

it('forbids a student from the console-embedded matériel page too', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/materiel')->assertForbidden();
});

it('lets an admin create a matériel', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/materiel', [
        'lieu' => 'Salle R2',
        'nom' => 'Vidéoprojecteur',
        'quantite' => 2,
        'etat' => 'bon_etat',
        'observation' => 'Neuf',
    ])->assertRedirect();

    expect(Materiel::where('nom', 'Vidéoprojecteur')->exists())->toBeTrue();
});

it('updates every field through the full edit form', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['lieu' => 'Salle R2', 'nom' => 'Chaise', 'quantite' => 3, 'etat' => 'bon_etat']);

    $this->actingAs($admin)->put("/materiel/{$materiel->id}", [
        'lieu' => 'Labo GT',
        'nom' => 'Chaise pivotante',
        'quantite' => 5,
        'etat' => 'en_panne',
        'observation' => 'Pied cassé',
    ])->assertRedirect();

    $materiel->refresh();
    expect($materiel->lieu)->toBe('Labo GT');
    expect($materiel->nom)->toBe('Chaise pivotante');
    expect($materiel->quantite)->toBe(5);
    expect($materiel->etat)->toBe(MaterielEtat::EnPanne);
    expect($materiel->observation)->toBe('Pied cassé');
});

it('allows a quick inline edit of a single field without the others', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['lieu' => 'Salle R2', 'nom' => 'Chaise', 'quantite' => 3, 'etat' => 'bon_etat']);

    $this->actingAs($admin)->put("/materiel/{$materiel->id}", [
        'quantite' => 7,
    ])->assertRedirect();

    $materiel->refresh();
    expect($materiel->quantite)->toBe(7);
    expect($materiel->lieu)->toBe('Salle R2');
    expect($materiel->nom)->toBe('Chaise');
});

it('deletes a matériel and cascades to its déplacements and maintenances', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create();
    $materiel->maintenances()->create(['description' => 'Nettoyage']);
    $materiel->deplacements()->create([
        'lieu_origine' => $materiel->lieu,
        'lieu_destination' => 'Autre lieu',
        'emprunteur' => 'Jean',
        'quantite' => 1,
    ]);

    $this->actingAs($admin)->delete("/materiel/{$materiel->id}")->assertRedirect();

    expect(Materiel::find($materiel->id))->toBeNull();
    expect(MaterielDeplacement::where('materiel_id', $materiel->id)->exists())->toBeFalse();
});

it('logs a maintenance entry and updates the état when one is given', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['etat' => 'bon_etat']);

    $this->actingAs($admin)->post("/materiel/{$materiel->id}/maintenance", [
        'description' => 'Réparation moteur',
        'etat_apres' => 'en_panne',
    ])->assertRedirect();

    expect($materiel->maintenances()->count())->toBe(1);
    expect($materiel->refresh()->etat)->toBe(MaterielEtat::EnPanne);
});

it('does not change the état when the maintenance entry leaves it unspecified', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['etat' => 'bon_etat']);

    $this->actingAs($admin)->post("/materiel/{$materiel->id}/maintenance", [
        'description' => 'Dépoussiérage',
    ])->assertRedirect();

    expect($materiel->refresh()->etat)->toBe(MaterielEtat::BonEtat);
});

it('emprunte un matériel vers un autre lieu and decrements its quantité', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['lieu' => 'Bureau de Direction', 'quantite' => 5]);

    $this->actingAs($admin)->post("/materiel/{$materiel->id}/emprunter", [
        'lieu_destination' => 'Salle R2',
        'emprunteur' => 'Jean Rakoto',
        'quantite_emprunt' => 2,
        'motif' => 'Réunion',
    ])->assertRedirect();

    expect($materiel->refresh()->quantite)->toBe(3);
    $deplacement = $materiel->deplacements()->first();
    expect($deplacement->lieu_origine)->toBe('Bureau de Direction');
    expect($deplacement->lieu_destination)->toBe('Salle R2');
    expect($deplacement->statut)->toBe(MaterielDeplacementStatut::EnCours);
});

it('rejects an emprunt toward the same lieu the matériel is already in', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['lieu' => 'Bureau de Direction', 'quantite' => 5]);

    $this->actingAs($admin)->post("/materiel/{$materiel->id}/emprunter", [
        'lieu_destination' => 'Bureau de Direction',
        'emprunteur' => 'Jean',
        'quantite_emprunt' => 1,
    ])->assertStatus(422);

    expect($materiel->refresh()->quantite)->toBe(5);
});

it('clamps an emprunt quantité to what is actually available', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['lieu' => 'Bureau de Direction', 'quantite' => 2]);

    $this->actingAs($admin)->post("/materiel/{$materiel->id}/emprunter", [
        'lieu_destination' => 'Salle R2',
        'emprunteur' => 'Jean',
        'quantite_emprunt' => 10,
    ])->assertRedirect();

    expect($materiel->refresh()->quantite)->toBe(0);
    expect($materiel->deplacements()->first()->quantite)->toBe(2);
});

it('returns an emprunt and restitutes its quantité to the matériel', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['quantite' => 3]);
    $deplacement = $materiel->deplacements()->create([
        'lieu_origine' => $materiel->lieu,
        'lieu_destination' => 'Salle R2',
        'emprunteur' => 'Jean',
        'quantite' => 2,
        'statut' => 'en_cours',
    ]);

    $this->actingAs($admin)->post("/materiel/deplacements/{$deplacement->id}/retourner")->assertRedirect();

    expect($materiel->refresh()->quantite)->toBe(5);
    expect($deplacement->refresh()->statut)->toBe(MaterielDeplacementStatut::Retourne);
    expect($deplacement->date_retour)->not->toBeNull();
});

it('refuses to return an emprunt that was already returned', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['quantite' => 3]);
    $deplacement = $materiel->deplacements()->create([
        'lieu_origine' => $materiel->lieu,
        'lieu_destination' => 'Salle R2',
        'emprunteur' => 'Jean',
        'quantite' => 2,
        'statut' => 'retourne',
        'date_retour' => now(),
    ]);

    $this->actingAs($admin)->post("/materiel/deplacements/{$deplacement->id}/retourner")->assertStatus(409);

    expect($materiel->refresh()->quantite)->toBe(3);
});

it('restitutes the quantité when deleting a still-active déplacement', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['quantite' => 1]);
    $deplacement = $materiel->deplacements()->create([
        'lieu_origine' => $materiel->lieu,
        'lieu_destination' => 'Salle R2',
        'emprunteur' => 'Jean',
        'quantite' => 2,
        'statut' => 'en_cours',
    ]);

    $this->actingAs($admin)->delete("/materiel/deplacements/{$deplacement->id}")->assertRedirect();

    expect($materiel->refresh()->quantite)->toBe(3);
    expect(MaterielDeplacement::find($deplacement->id))->toBeNull();
});

it('does not restitute quantité when deleting an already-returned déplacement', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create(['quantite' => 1]);
    $deplacement = $materiel->deplacements()->create([
        'lieu_origine' => $materiel->lieu,
        'lieu_destination' => 'Salle R2',
        'emprunteur' => 'Jean',
        'quantite' => 2,
        'statut' => 'retourne',
        'date_retour' => now(),
    ]);

    $this->actingAs($admin)->delete("/materiel/deplacements/{$deplacement->id}")->assertRedirect();

    expect($materiel->refresh()->quantite)->toBe(1);
});

it('clears the whole historique and restitutes every still-active emprunt first', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materielA = Materiel::factory()->create(['quantite' => 1]);
    $materielB = Materiel::factory()->create(['quantite' => 4]);
    $materielA->deplacements()->create(['lieu_origine' => $materielA->lieu, 'lieu_destination' => 'X', 'emprunteur' => 'Jean', 'quantite' => 2, 'statut' => 'en_cours']);
    $materielB->deplacements()->create(['lieu_origine' => $materielB->lieu, 'lieu_destination' => 'X', 'emprunteur' => 'Paul', 'quantite' => 1, 'statut' => 'retourne', 'date_retour' => now()]);

    $this->actingAs($admin)->delete('/materiel/historique')->assertRedirect();

    expect($materielA->refresh()->quantite)->toBe(3);
    expect($materielB->refresh()->quantite)->toBe(4);
    expect(MaterielDeplacement::count())->toBe(0);
});
