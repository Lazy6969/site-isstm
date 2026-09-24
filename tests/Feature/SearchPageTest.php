<?php

use App\Models\Filiere;
use App\Models\NewsArticle;
use App\Models\Post;
use App\Models\Teacher;
use App\Models\User;
use App\Role;

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

it('does not search posts or people for a guest', function () {
    Post::factory()->create(['body' => 'Réunion informatique demain']);

    $this->get('/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Search/Index')
        ->missing('results.publications')
        ->missing('results.personnes')
    );
});

it('searches posts and people for a community member only', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create(['name' => 'Jean Informatique']);
    Post::factory()->create(['body' => 'Réunion informatique demain']);

    $this->actingAs($etudiant)->get('/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Search/Index')
        ->has('results.publications', 1)
        ->has('results.personnes', 1)
    );

    $outsider = User::factory()->create(['role' => Role::User]);

    $this->actingAs($outsider)->get('/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Search/Index')
        ->missing('results.publications')
        ->missing('results.personnes')
    );
});
