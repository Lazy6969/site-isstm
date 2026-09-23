<?php

use App\EvenementStatus;
use App\GalleryStatus;
use App\Models\Etudiant;
use App\Models\Evenement;
use App\Models\GalleryAlbum;
use App\Models\NewsArticle;
use App\Models\User;
use App\NewsStatus;
use App\Role;
use App\StatutEtudiant;

it('forbids a non-privileged user from viewing statistics', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/statistiques')->assertForbidden();
});

it('lets the super admin view statistics', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/statistiques')->assertInertia(fn ($page) => $page
        ->component('Admin/Statistiques/Index')
        ->has('usersByRole')
        ->has('contentByStatus', 3)
        ->has('etudiantsByStatut')
        ->has('inscriptionsByStatut')
        ->has('preinscriptionsByStatut')
        ->has('activiteParJour', 14)
    );
});

it('aggregates content counts per module and status correctly', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    NewsArticle::factory()->count(2)->create(['status' => NewsStatus::Publie]);
    NewsArticle::factory()->create(['status' => NewsStatus::Brouillon]);
    GalleryAlbum::factory()->create(['status' => GalleryStatus::EnAttente]);
    Evenement::factory()->create(['status' => EvenementStatus::Rejete]);

    $response = $this->actingAs($admin)->get('/console/statistiques');

    $contentByStatus = collect($response->viewData('page')['props']['contentByStatus']);
    $actualites = $contentByStatus->firstWhere('module', 'Actualités');
    $galerie = $contentByStatus->firstWhere('module', 'Galerie');
    $evenements = $contentByStatus->firstWhere('module', 'Événements');

    expect($actualites['publie'])->toBe(2);
    expect($actualites['brouillon'])->toBe(1);
    expect($galerie['en_attente'])->toBe(1);
    expect($evenements['rejete'])->toBe(1);
});

it('aggregates student counts by statut', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Etudiant::factory()->count(2)->create(['statut' => StatutEtudiant::Actif]);
    Etudiant::factory()->create(['statut' => StatutEtudiant::Diplome]);

    $response = $this->actingAs($admin)->get('/console/statistiques');

    $byStatut = collect($response->viewData('page')['props']['etudiantsByStatut'])->pluck('total', 'statut');
    expect($byStatut['Actif'])->toBe(2);
    expect($byStatut['Diplômé'])->toBe(1);
});
