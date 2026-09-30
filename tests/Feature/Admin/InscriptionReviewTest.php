<?php

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Inscription;
use App\Models\User;
use App\Notifications\InscriptionApproved;
use App\Notifications\InscriptionCorrectionRequested;
use App\Notifications\InscriptionRefused;
use App\Role;
use App\StatutInscription;
use App\TypeInscription;
use Illuminate\Support\Facades\Notification;

it('shows a self-service dossier and marks it as under review on first open', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create(['type' => TypeInscription::Reinscription, 'statut' => StatutInscription::EnAttente]);

    expect($inscription->reviewed_at)->toBeNull();

    $this->actingAs($admin)->get("/console/scolarite/inscriptions/{$inscription->id}")
        ->assertInertia(fn ($page) => $page->component('Admin/Scolarite/Inscriptions/Show'));

    $inscription->refresh();
    expect($inscription->statut)->toBe(StatutInscription::EnExamen);
    expect($inscription->reviewed_at)->not->toBeNull();
});

it('requests a correction and notifies the étudiant', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create(['type' => TypeInscription::Reinscription, 'statut' => StatutInscription::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/scolarite/inscriptions/{$inscription->id}/demander-correction", ['commentaire_correction' => 'Relevé illisible'])
        ->assertRedirect();

    $inscription->refresh();
    expect($inscription->statut)->toBe(StatutInscription::ACompleter);
    expect($inscription->commentaire_correction)->toBe('Relevé illisible');

    Notification::assertSentTo($inscription->etudiant->user, InscriptionCorrectionRequested::class);
});

it('approves a dossier, assigns a classe, and notifies the étudiant', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create(['type' => TypeInscription::Redoublement, 'statut' => StatutInscription::EnAttente, 'classe_id' => null]);
    $classe = Classe::factory()->create();

    $this->actingAs($admin)
        ->post("/console/scolarite/inscriptions/{$inscription->id}/approuver", ['classe_id' => $classe->id])
        ->assertRedirect();

    $inscription->refresh();
    expect($inscription->statut)->toBe(StatutInscription::Validee);
    expect($inscription->classe_id)->toBe($classe->id);

    Notification::assertSentTo($inscription->etudiant->user, InscriptionApproved::class);
});

it('refuses a dossier with an optional motif and notifies the étudiant', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create(['type' => TypeInscription::Reinscription, 'statut' => StatutInscription::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/scolarite/inscriptions/{$inscription->id}/refuser", ['motif_refus' => 'Dossier incomplet'])
        ->assertRedirect();

    $inscription->refresh();
    expect($inscription->statut)->toBe(StatutInscription::Annulee);
    expect($inscription->motif_refus)->toBe('Dossier incomplet');

    Notification::assertSentTo($inscription->etudiant->user, InscriptionRefused::class);
});

it('refuses to decide an already-decided dossier twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $inscription = Inscription::factory()->create(['statut' => StatutInscription::Validee]);

    $this->actingAs($admin)
        ->post("/console/scolarite/inscriptions/{$inscription->id}/refuser", [])
        ->assertStatus(409);
});

it('does not notify anyone for a manually created inscription that has no type', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = Etudiant::factory()->create();
    $inscription = Inscription::factory()->create(['etudiant_id' => $etudiant->id, 'type' => null, 'statut' => StatutInscription::EnAttente]);
    $classe = Classe::factory()->create();

    $this->actingAs($admin)
        ->post("/console/scolarite/inscriptions/{$inscription->id}/approuver", ['classe_id' => $classe->id])
        ->assertRedirect();

    Notification::assertNothingSent();
});

it('exports inscriptions to CSV', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Inscription::factory()->create();

    $this->actingAs($admin)->get('/console/scolarite/inscriptions/export')
        ->assertOk()
        ->assertHeader('content-disposition', 'attachment; filename=inscriptions.csv');
});
