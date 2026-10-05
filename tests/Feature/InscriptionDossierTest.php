<?php

use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Inscription;
use App\Models\SiteContent;
use App\Models\User;
use App\Notifications\InscriptionDossierSubmitted;
use App\Role;
use App\StatutInscription;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

function anneeUniversitaireCourante(): string
{
    $existing = SiteContent::firstWhere('content_key', 'inscription_annee_universitaire');
    if ($existing) {
        return $existing->content_value_fr;
    }

    return SiteContent::factory()->create([
        'content_key' => 'inscription_annee_universitaire',
        'content_value_fr' => '2025-2026',
    ])->content_value_fr;
}

it('forbids a guest from viewing the réinscription form', function () {
    $this->get('/reinscription')->assertRedirect('/login');
});

it('forbids a non-étudiant from viewing the réinscription form', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/reinscription')->assertForbidden();
});

it('creates a Brouillon dossier on first visit and reuses it on the next', function () {
    $etudiant = Etudiant::factory()->create();
    anneeUniversitaireCourante();

    $this->actingAs($etudiant->user)->get('/reinscription')->assertInertia(fn ($page) => $page
        ->component('Inscription/Dossier')
        ->where('inscription.statut', 'brouillon')
    );

    expect(Inscription::where('etudiant_id', $etudiant->id)->count())->toBe(1);

    $this->actingAs($etudiant->user)->get('/reinscription');
    expect(Inscription::where('etudiant_id', $etudiant->id)->count())->toBe(1);
});

it('saves a draft without requiring the files', function () {
    $etudiant = Etudiant::factory()->create();
    $filiere = Filiere::factory()->create();
    $this->actingAs($etudiant->user)->get('/reinscription');
    $inscription = Inscription::firstWhere('etudiant_id', $etudiant->id);

    $this->actingAs($etudiant->user)->patch("/reinscription/{$inscription->id}/brouillon", [
        'type' => 'reinscription',
        'filiere_id' => $filiere->id,
    ])->assertRedirect();

    $inscription->refresh();
    expect($inscription->statut)->toBe(StatutInscription::Brouillon);
    expect($inscription->type->value)->toBe('reinscription');
});

it("forbids another étudiant from touching someone else's dossier", function () {
    $etudiant = Etudiant::factory()->create();
    $this->actingAs($etudiant->user)->get('/reinscription');
    $inscription = Inscription::firstWhere('etudiant_id', $etudiant->id);

    $intruder = Etudiant::factory()->create();
    $this->actingAs($intruder->user)
        ->patch("/reinscription/{$inscription->id}/brouillon", ['type' => 'redoublement'])
        ->assertForbidden();
});

it('submits a complete réinscription dossier, generates a dossier number, and notifies the scolarité', function () {
    Storage::fake('public');
    Notification::fake();
    $etudiant = Etudiant::factory()->create();
    $filiere = Filiere::factory()->create(['niveaux' => 'L1,L2,L3']);
    $scolarite = User::factory()->role(Role::Admin)->create();

    $this->actingAs($etudiant->user)->get('/reinscription');
    $inscription = Inscription::firstWhere('etudiant_id', $etudiant->id);

    $this->actingAs($etudiant->user)->post("/reinscription/{$inscription->id}/soumettre", [
        'type' => 'reinscription',
        'filiere_id' => $filiere->id,
        'niveau_souhaite' => 'L2',
        'releve_notes' => UploadedFile::fake()->image('releve.jpg'),
    ])->assertRedirect();

    $inscription->refresh();
    expect($inscription->statut)->toBe(StatutInscription::EnAttente);
    expect($inscription->numero_dossier)->toMatch('/^REI-\d{4}-\d{5}$/');
    expect($inscription->submitted_at)->not->toBeNull();
    Storage::disk('public')->assertExists($inscription->releve_notes_path);

    Notification::assertSentTo($scolarite, InscriptionDossierSubmitted::class, function ($notification) use ($inscription) {
        return $notification->inscription->is($inscription);
    });
});

it('generates a RED- dossier number for a redoublement', function () {
    Storage::fake('public');
    $etudiant = Etudiant::factory()->create();
    $filiere = Filiere::factory()->create(['niveaux' => 'L1,L2,L3']);

    $this->actingAs($etudiant->user)->get('/reinscription');
    $inscription = Inscription::firstWhere('etudiant_id', $etudiant->id);

    $this->actingAs($etudiant->user)->post("/reinscription/{$inscription->id}/soumettre", [
        'type' => 'redoublement',
        'filiere_id' => $filiere->id,
        'niveau_souhaite' => 'L2',
        'releve_notes' => UploadedFile::fake()->image('releve.jpg'),
    ]);

    expect($inscription->fresh()->numero_dossier)->toMatch('/^RED-\d{4}-\d{5}$/');
});

it('rejects a submission missing the type or the relevé de notes', function () {
    $etudiant = Etudiant::factory()->create();
    $this->actingAs($etudiant->user)->get('/reinscription');
    $inscription = Inscription::firstWhere('etudiant_id', $etudiant->id);

    $this->actingAs($etudiant->user)
        ->post("/reinscription/{$inscription->id}/soumettre", [])
        ->assertSessionHasErrors(['type', 'filiere_id', 'niveau_souhaite', 'releve_notes']);
});

it("doesn't require re-uploading a relevé already saved by an earlier draft", function () {
    Storage::fake('public');
    $etudiant = Etudiant::factory()->create();
    $filiere = Filiere::factory()->create(['niveaux' => 'L1,L2']);
    $this->actingAs($etudiant->user)->get('/reinscription');
    $inscription = Inscription::firstWhere('etudiant_id', $etudiant->id);

    $this->actingAs($etudiant->user)->patch("/reinscription/{$inscription->id}/brouillon", [
        'releve_notes' => UploadedFile::fake()->image('releve.jpg'),
    ]);

    $this->actingAs($etudiant->user)->post("/reinscription/{$inscription->id}/soumettre", [
        'type' => 'reinscription',
        'filiere_id' => $filiere->id,
        'niveau_souhaite' => 'L2',
    ])->assertRedirect();

    expect($inscription->fresh()->statut)->toBe(StatutInscription::EnAttente);
});

it('refuses a duplicate dossier for the same étudiant and année', function () {
    $etudiant = Etudiant::factory()->create();
    $annee = anneeUniversitaireCourante();
    Inscription::factory()->create(['etudiant_id' => $etudiant->id, 'annee' => $annee]);

    $this->actingAs($etudiant->user)->get('/reinscription');

    expect(Inscription::where('etudiant_id', $etudiant->id)->where('annee', $annee)->count())->toBe(1);
});
