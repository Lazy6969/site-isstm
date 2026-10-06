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

it('finds a filière when its keywords are scattered across different fields', function () {
    // "génie" only in the name, "biomédical" only in the description — a
    // literal-substring search for "génie biomédical" would find neither.
    Filiere::factory()->create([
        'nom_fr' => 'Génie Informatique',
        'description_fr' => 'Formation orientée vers les technologies biomédicales.',
    ]);

    $this->get('/recherche?'.http_build_query(['q' => 'génie biomédical']))->assertInertia(fn ($page) => $page
        ->has('results.filieres', 1)
    );
});

it('requires every keyword to match, not just one of them', function () {
    Filiere::factory()->create(['nom_fr' => 'Génie Civil', 'description_fr' => 'Bâtiments et infrastructures.']);

    $this->get('/recherche?'.http_build_query(['q' => 'génie informatique']))->assertInertia(fn ($page) => $page
        ->has('results.filieres', 0)
    );
});

it('tolerates a wrong leading or trailing letter in the title', function () {
    Filiere::factory()->create(['nom_fr' => 'Informatique']);

    $this->get('/recherche?q=xnformatique')->assertInertia(fn ($page) => $page
        ->has('results.filieres', 1)
    );

    $this->get('/recherche?q=informatiquex')->assertInertia(fn ($page) => $page
        ->has('results.filieres', 1)
    );
});

it('ranks a title match above a description-only match', function () {
    Filiere::factory()->create(['nom_fr' => 'Réseaux', 'description_fr' => 'Rien à voir avec la cible recherchée.']);
    Filiere::factory()->create(['nom_fr' => 'Autre filière', 'description_fr' => 'Mentionne les réseaux informatiques en passant.']);

    $this->get('/recherche?q=réseaux')->assertInertia(fn ($page) => $page
        ->where('results.filieres.0.title', 'Réseaux')
    );
});

it('tolerates search phrases with punctuation and SQL-special characters', function () {
    Filiere::factory()->create(['nom_fr' => 'Génie Informatique']);

    $this->get('/recherche?'.http_build_query(['q' => "génie' OR '1'='1"]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Search/Index'));
});

it('never searches posts or people, even for a logged-in community member', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create(['name' => 'Jean Informatique']);
    Post::factory()->create(['body' => 'Réunion informatique demain']);

    $this->actingAs($etudiant)->get('/recherche?q=informatique')->assertInertia(fn ($page) => $page
        ->component('Search/Index')
        ->missing('results.publications')
        ->missing('results.personnes')
    );
});
