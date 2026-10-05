<?php

use App\Models\Filiere;
use App\Models\Post;
use App\Models\User;
use App\Role;

it('redirects a guest to login', function () {
    $this->get('/communaute/recherche?q=informatique')->assertRedirect('/login');
});

it('forbids a non-community user', function () {
    $outsider = User::factory()->create(['role' => Role::User]);

    $this->actingAs($outsider)->get('/communaute/recherche?q=informatique')->assertForbidden();
});

it('renders an empty state without a query', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/communaute/recherche')->assertInertia(fn ($page) => $page
        ->component('Communaute/Recherche')
        ->where('query', '')
    );
});

it('finds matching publications and accounts for a community member', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create(['name' => 'Jean Informatique']);
    Post::factory()->create(['body' => 'Réunion informatique demain']);

    $this->actingAs($etudiant)->get('/communaute/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Communaute/Recherche')
        ->has('results.publications', 1)
        ->has('results.personnes', 1)
    );
});

it('never returns site content such as filières', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    Filiere::factory()->create(['nom_fr' => 'Génie Informatique']);

    $this->actingAs($etudiant)->get('/communaute/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Communaute/Recherche')
        ->missing('results.filieres')
    );
});
