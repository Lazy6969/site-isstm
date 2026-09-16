<?php

use App\Models\Filiere;
use App\Models\NewsArticle;
use App\Models\Teacher;

it('renders an empty state without a query', function () {
    $this->get('/recherche')->assertInertia(fn ($page) => $page
        ->component('Search/Index')
        ->where('query', '')
    );
});

it('finds matching filieres, teachers and published articles', function () {
    Filiere::factory()->create(['nom_fr' => 'Génie Informatique']);
    Teacher::factory()->create(['name' => 'Rakoto Jean', 'specialty_fr' => 'Informatique appliquée']);
    NewsArticle::factory()->create(['title' => 'Nouvelle filière informatique', 'status' => 'publie']);
    NewsArticle::factory()->create(['title' => 'Article informatique en brouillon', 'status' => 'brouillon']);

    $this->get('/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Search/Index')
        ->has('results.filieres', 1)
        ->has('results.enseignants', 1)
        ->has('results.actualites', 1)
    );
});
