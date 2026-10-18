<?php

use App\MaterielMouvementType;
use App\MaterielStatut;
use App\Models\Materiel;
use App\Models\MaterielEmprunt;
use App\Models\MaterielIntervention;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function materielManager(): User
{
    $user = User::factory()->create();
    $user->assignRole('responsable-materiel');

    return $user;
}

function lendingData(array $overrides = []): array
{
    return array_merge([
        'emprunteur_nom' => 'Jean Rakoto',
        'emprunteur_type' => 'etudiant',
        'emprunteur_reference' => 'ISSTM-2026-00001',
        'emprunteur_contact' => '0340000000',
        'motif' => 'Exposé de groupe',
        'date_sortie' => now()->toDateString(),
        'date_retour_prevue' => now()->addDays(3)->toDateString(),
    ], $overrides);
}

it('lands a matériel account on its own workspace after login', function () {
    $user = materielManager();

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('materiel.dashboard'));
});

it('keeps the matériel workspace to accounts holding its permissions', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->get('/materiel')->assertRedirect('/login');
    $this->actingAs($student)->get('/materiel')->assertForbidden();
    $this->actingAs(materielManager())->get('/materiel')->assertInertia(fn ($page) => $page->component('Materiel/Dashboard'));
});

it('adds equipment to the inventory with a generated code and a history entry', function () {
    Storage::fake('public');
    $user = materielManager();

    $this->actingAs($user)->post('/materiel/inventaire', [
        'nom' => 'Vidéoprojecteur Epson',
        'categorie' => 'audiovisuel',
        'localisation' => 'Salle 3',
        'valeur' => 1200000,
        'photo' => UploadedFile::fake()->image('projo.jpg'),
    ])->assertRedirect()->assertSessionHasNoErrors();

    $materiel = Materiel::firstOrFail();
    expect($materiel->code)->toMatch('/^MAT-\d{4}-00001$/')
        ->and($materiel->statut)->toBe(MaterielStatut::Disponible)
        ->and($materiel->mouvements()->first()->type)->toBe(MaterielMouvementType::Creation);
    Storage::disk('public')->assertExists(str($materiel->photo_path)->after('storage/')->toString());
});

it('moves equipment and records where it came from and where it went', function () {
    $materiel = Materiel::factory()->create(['localisation' => 'Magasin']);

    $this->actingAs(materielManager())->post("/materiel/inventaire/{$materiel->id}/deplacer", ['vers' => 'Salle 5', 'note' => 'Pour le cours'])->assertSessionHasNoErrors();

    $mouvement = $materiel->fresh()->mouvements()->first();
    expect($materiel->fresh()->localisation)->toBe('Salle 5')
        ->and($mouvement->type)->toBe(MaterielMouvementType::Deplacement)
        ->and($mouvement->de)->toBe('Magasin')
        ->and($mouvement->vers)->toBe('Salle 5');
});

it('refuses to move to the same place or to move a lent item', function () {
    $user = materielManager();
    $here = Materiel::factory()->create(['localisation' => 'Salle 1']);
    $lent = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$here->id}/deplacer", ['vers' => 'Salle 1'])->assertSessionHasErrors('action');
    $this->actingAs($user)->post("/materiel/inventaire/{$lent->id}/deplacer", ['vers' => 'Salle 9'])->assertSessionHasErrors('action');
});

it('lends available equipment, tracks the borrower and the dates, then takes it back', function () {
    $user = materielManager();
    $materiel = Materiel::factory()->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$materiel->id}/preter", lendingData())->assertSessionHasNoErrors();

    $emprunt = $materiel->fresh()->empruntEnCours;
    expect($materiel->fresh()->statut)->toBe(MaterielStatut::Emprunte)
        ->and($emprunt->emprunteur_nom)->toBe('Jean Rakoto')
        ->and($emprunt->prete_par)->toBe($user->id);

    $this->actingAs($user)->post("/materiel/emprunts/{$emprunt->id}/retour", ['etat_au_retour' => 'bon'])->assertSessionHasNoErrors();

    expect($materiel->fresh()->statut)->toBe(MaterielStatut::Disponible)
        ->and($emprunt->fresh()->date_retour_effective)->not->toBeNull()
        ->and($materiel->fresh()->mouvements->pluck('type')->map->value->all())->toContain('emprunt', 'retour');
});

it('only lends equipment that is available, and with a return date that is not before the exit', function () {
    $user = materielManager();
    $broken = Materiel::factory()->statut(MaterielStatut::EnPanne)->create();
    $ok = Materiel::factory()->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$broken->id}/preter", lendingData())->assertSessionHasErrors('action');
    $this->actingAs($user)->post("/materiel/inventaire/{$ok->id}/preter", lendingData(['date_retour_prevue' => now()->subDay()->toDateString()]))->assertSessionHasErrors('date_retour_prevue');

    expect($ok->fresh()->statut)->toBe(MaterielStatut::Disponible);
});

it('opens a breakdown when equipment comes back damaged', function () {
    $user = materielManager();
    $materiel = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();
    $emprunt = MaterielEmprunt::factory()->create(['materiel_id' => $materiel->id]);

    $this->actingAs($user)->post("/materiel/emprunts/{$emprunt->id}/retour", ['etat_au_retour' => 'endommage', 'note_retour' => 'Écran fissuré'])->assertSessionHasNoErrors();

    expect($materiel->fresh()->statut)->toBe(MaterielStatut::EnPanne)
        ->and($materiel->fresh()->interventionOuverte->type)->toBe('panne');
});

it('refuses a second return and a prolongation of a closed loan', function () {
    $user = materielManager();
    $emprunt = MaterielEmprunt::factory()->create(['date_retour_effective' => now()->toDateString()]);

    $this->actingAs($user)->post("/materiel/emprunts/{$emprunt->id}/retour", ['etat_au_retour' => 'bon'])->assertSessionHasErrors('action');
    $this->actingAs($user)->post("/materiel/emprunts/{$emprunt->id}/prolonger", ['date_retour_prevue' => now()->addMonth()->toDateString()])->assertStatus(409);
});

it('prolongs an open loan only to a later date', function () {
    $emprunt = MaterielEmprunt::factory()->create();

    $this->actingAs(materielManager())->post("/materiel/emprunts/{$emprunt->id}/prolonger", ['date_retour_prevue' => now()->subDay()->toDateString()])->assertSessionHasErrors('date_retour_prevue');

    $later = now()->addDays(20)->toDateString();
    $this->actingAs(materielManager())->post("/materiel/emprunts/{$emprunt->id}/prolonger", ['date_retour_prevue' => $later])->assertSessionHasNoErrors();
    expect($emprunt->fresh()->date_retour_prevue->toDateString())->toBe($later);
});

it('follows a breakdown through repair and back into service', function () {
    $user = materielManager();
    $materiel = Materiel::factory()->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$materiel->id}/panne", ['titre' => 'Ne s\'allume plus', 'description' => 'Plus de signal'])->assertSessionHasNoErrors();
    expect($materiel->fresh()->statut)->toBe(MaterielStatut::EnPanne);

    $this->actingAs($user)->post("/materiel/inventaire/{$materiel->id}/maintenance", ['type' => 'reparation', 'titre' => 'Remplacement de l\'alimentation', 'prestataire' => 'Atelier Tana'])->assertSessionHasNoErrors();
    $intervention = $materiel->fresh()->interventionOuverte;
    expect($materiel->fresh()->statut)->toBe(MaterielStatut::EnMaintenance)
        ->and($intervention->type)->toBe('reparation')
        ->and(MaterielIntervention::count())->toBe(1);

    $this->actingAs($user)->post("/materiel/interventions/{$intervention->id}/terminer", ['resolution' => 'Alimentation changée', 'cout' => 85000])->assertSessionHasNoErrors();

    expect($materiel->fresh()->statut)->toBe(MaterielStatut::Disponible)
        ->and($intervention->fresh()->date_fin)->not->toBeNull()
        ->and($intervention->fresh()->cout)->toBe(85000)
        ->and($materiel->fresh()->mouvements->pluck('type')->map->value->all())->toContain('panne', 'reparation', 'remise_en_service');
});

it('puts available equipment in planned maintenance but not equipment that is lent', function () {
    $user = materielManager();
    $free = Materiel::factory()->create();
    $lent = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$free->id}/maintenance", ['type' => 'maintenance', 'titre' => 'Nettoyage annuel'])->assertSessionHasNoErrors();
    $this->actingAs($user)->post("/materiel/inventaire/{$lent->id}/maintenance", ['type' => 'maintenance', 'titre' => 'Nettoyage annuel'])->assertSessionHasErrors('action');

    expect($free->fresh()->statut)->toBe(MaterielStatut::EnMaintenance)->and($lent->fresh()->statut)->toBe(MaterielStatut::Emprunte);
});

it('only declares a breakdown on available equipment', function () {
    $lent = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();

    $this->actingAs(materielManager())->post("/materiel/inventaire/{$lent->id}/panne", ['titre' => 'Panne'])->assertSessionHasErrors('action');
});

it('retires equipment, closing its open repair, and refuses to retire lent equipment', function () {
    $user = materielManager();
    $broken = Materiel::factory()->statut(MaterielStatut::EnPanne)->create();
    $broken->interventions()->create(['type' => 'panne', 'titre' => 'HS', 'date_debut' => now()->toDateString()]);
    $lent = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$broken->id}/reformer", ['note' => 'Irréparable'])->assertSessionHasNoErrors();
    $this->actingAs($user)->post("/materiel/inventaire/{$lent->id}/reformer")->assertSessionHasErrors('action');

    expect($broken->fresh()->statut)->toBe(MaterielStatut::Reforme)
        ->and($broken->fresh()->interventionOuverte)->toBeNull();
});

it('puts deleted equipment in the corbeille and restores it from there, but not while it is lent', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $materiel = Materiel::factory()->create();
    $lent = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();

    $this->actingAs(materielManager())->delete("/materiel/inventaire/{$lent->id}")->assertStatus(409);
    $this->actingAs(materielManager())->delete("/materiel/inventaire/{$materiel->id}")->assertRedirect();

    expect(Materiel::find($materiel->id))->toBeNull();

    $this->actingAs($admin)->post("/console/corbeille/materiel/{$materiel->id}/restaurer")->assertRedirect();
    expect(Materiel::find($materiel->id))->not->toBeNull();
});

it('exposes the figures of the dashboard: statuses, late loans and open repairs', function () {
    $user = materielManager();
    Materiel::factory()->count(3)->create();
    $late = Materiel::factory()->statut(MaterielStatut::Emprunte)->create();
    MaterielEmprunt::factory()->enRetard()->create(['materiel_id' => $late->id]);
    $broken = Materiel::factory()->statut(MaterielStatut::EnPanne)->create();
    $broken->interventions()->create(['type' => 'panne', 'titre' => 'HS', 'date_debut' => now()->toDateString()]);

    $this->actingAs($user)->get('/materiel')->assertInertia(fn ($page) => $page
        ->where('stats.total', 5)
        ->where('stats.disponible', 3)
        ->where('stats.emprunte', 1)
        ->where('stats.en_panne', 1)
        ->where('stats.retards', 1)
        ->has('retards', 1)
        ->has('interventionsOuvertes', 1)
    );
});

it('serves the inventory, loans, repairs and history pages', function () {
    $user = materielManager();
    $materiel = Materiel::factory()->create();

    $this->actingAs($user)->get('/materiel/inventaire')->assertInertia(fn ($page) => $page->component('Materiel/Inventaire/Index')->has('materiels', 1));
    $this->actingAs($user)->get("/materiel/inventaire/{$materiel->id}")->assertInertia(fn ($page) => $page->component('Materiel/Inventaire/Show')->where('materiel.id', $materiel->id));
    $this->actingAs($user)->get('/materiel/emprunts')->assertInertia(fn ($page) => $page->component('Materiel/Emprunts/Index'));
    $this->actingAs($user)->get('/materiel/interventions')->assertInertia(fn ($page) => $page->component('Materiel/Interventions/Index'));
    $this->actingAs($user)->get('/materiel/historique')->assertInertia(fn ($page) => $page->component('Materiel/Historique/Index'));
    $this->actingAs($user)->get('/materiel/inventaire/export')->assertOk();
});

it('removes an action from an account whose role lost the permission', function () {
    $user = materielManager();
    $user->roles->first()->revokePermissionTo('materiel.loan');
    $materiel = Materiel::factory()->create();

    $this->actingAs($user)->post("/materiel/inventaire/{$materiel->id}/preter", lendingData())->assertForbidden();
});
