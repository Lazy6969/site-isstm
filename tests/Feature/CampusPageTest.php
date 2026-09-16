<?php

use App\Models\CampusBloc;

it('lists campus blocs', function () {
    CampusBloc::factory()->count(3)->create();

    $this->get('/campus')->assertInertia(fn ($page) => $page
        ->component('Campus/Index')
        ->has('blocs', 3)
    );
});

it('shows a campus bloc detail page by key', function () {
    $bloc = CampusBloc::factory()->create(['bloc_key' => 'mafami', 'nom' => 'MAFAMI']);

    $this->get("/campus/{$bloc->bloc_key}")->assertInertia(fn ($page) => $page
        ->component('Campus/Show')
        ->where('bloc.nom', 'MAFAMI')
    );
});

it('returns 404 for an unknown bloc key', function () {
    $this->get('/campus/inconnu')->assertNotFound();
});
