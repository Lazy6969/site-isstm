<?php

use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Inscription;
use App\Models\Preinscription;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;
use App\StatutInscription;

it('forbids a non-admin from viewing the dashboard', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/dashboard')->assertForbidden();
});

it('shows aggregate stats to an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $classe = Classe::factory()->create();
    $etudiants = Etudiant::factory()->count(2)->create(['classe_id' => $classe->id]);
    Preinscription::factory()->create(['status' => PreinscriptionStatus::EnAttente]);
    Inscription::factory()->create([
        'etudiant_id' => $etudiants->first()->id,
        'classe_id' => $classe->id,
        'statut' => StatutInscription::Validee,
    ]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->where('stats.etudiants', 2)
        ->where('stats.classes', 1)
        ->where('stats.preinscriptions_en_attente', 1)
        ->where('stats.inscriptions_validees', 1)
    );
});

it('aggregates chart and activity data for an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['nom_fr' => 'Informatique']);
    $classe = Classe::factory()->create(['filiere_id' => $filiere->id, 'niveau' => 'L1']);
    $etudiant = Etudiant::factory()->create(['classe_id' => $classe->id, 'created_at' => now()->subMinutes(10)]);
    Preinscription::factory()->create(['created_at' => now()]);

    $this->actingAs($admin)->get('/console/dashboard')->assertInertia(fn ($page) => $page
        ->component('Admin/Dashboard')
        ->has('preinscriptionsParMois', 6)
        ->where('preinscriptionsParMois.5.total', 1)
        ->where('etudiantsParNiveau.0', ['niveau' => 'L1', 'total' => 1])
        ->where('etudiantsParFiliere.0', ['filiere' => 'Informatique', 'total' => 1])
        ->has('activiteRecente', 2)
        ->where('activiteRecente.0.type', 'preinscription')
        ->where('activiteRecente.1.type', 'etudiant')
        ->where('activiteRecente.1.subject', $etudiant->user->name)
    );
});
