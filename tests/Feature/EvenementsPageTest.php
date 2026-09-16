<?php

use App\Models\Evenement;

it('lists only upcoming events ordered by start date', function () {
    Evenement::factory()->create(['titre' => 'Passé', 'date_debut' => now()->subDay()]);
    Evenement::factory()->create(['titre' => 'Bientôt', 'date_debut' => now()->addDays(2)]);
    Evenement::factory()->create(['titre' => 'Plus tard', 'date_debut' => now()->addDays(10)]);

    $this->get('/evenements')->assertInertia(fn ($page) => $page
        ->component('Evenements/Index')
        ->has('evenements', 2)
        ->where('evenements.0.titre', 'Bientôt')
    );
});
