<?php

use App\Models\Filiere;

it('lists filieres ordered by display order', function () {
    Filiere::factory()->create(['slug' => 'genie-civil', 'nom_fr' => 'Génie Civil', 'display_order' => 2]);
    Filiere::factory()->create(['slug' => 'genie-informatique', 'nom_fr' => 'Génie Informatique', 'display_order' => 1]);

    $this->get('/filieres')->assertInertia(fn ($page) => $page
        ->component('Filieres/Index')
        ->where('filieres.0.slug', 'genie-informatique')
        ->where('filieres.1.slug', 'genie-civil')
    );
});

it('shows a filiere detail page by slug', function () {
    $filiere = Filiere::factory()->create(['slug' => 'genie-civil', 'nom_fr' => 'Génie Civil']);

    $this->get("/filieres/{$filiere->slug}")->assertInertia(fn ($page) => $page
        ->component('Filieres/Show')
        ->where('filiere.nom', 'Génie Civil')
    );
});

it('returns 404 for an unknown filiere slug', function () {
    $this->get('/filieres/inconnue')->assertNotFound();
});
