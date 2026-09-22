<?php

use App\Models\Partenaire;

it('exposes partenaires ordered by display order on the homepage', function () {
    Partenaire::factory()->create(['nom' => 'Second', 'display_order' => 2]);
    Partenaire::factory()->create(['nom' => 'Premier', 'display_order' => 1]);

    $this->get('/')->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('partenaires', 2)
        ->where('partenaires.0.nom', 'Premier')
    );
});
