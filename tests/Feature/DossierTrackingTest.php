<?php

use App\Models\Candidat;
use App\PreinscriptionStatus;

it('renders an invite without a numero', function () {
    $this->get('/suivi-dossier')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Suivi')
        ->where('numero', '')
        ->where('preinscription', null)
    );
});

it('finds a dossier by its numero_dossier alone, with no authentication', function () {
    Candidat::factory()->create([
        'numero_dossier' => 'PI-2026-00042',
        'status' => PreinscriptionStatus::Soumis,
    ]);

    $this->get('/suivi-dossier?numero=PI-2026-00042')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Suivi')
        ->where('numero', 'PI-2026-00042')
        ->where('preinscription.numero_dossier', 'PI-2026-00042')
    );
});

it('returns no dossier for an unknown numero', function () {
    $this->get('/suivi-dossier?numero=PI-2026-99999')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Suivi')
        ->where('numero', 'PI-2026-99999')
        ->where('preinscription', null)
    );
});

it('never exposes the uploaded documents through the anonymous lookup', function () {
    Candidat::factory()->create([
        'numero_dossier' => 'PI-2026-00043',
        'status' => PreinscriptionStatus::Soumis,
    ]);

    $this->get('/suivi-dossier?numero=PI-2026-00043')->assertInertia(fn ($page) => $page
        ->missing('preinscription.cin_recto_path')
        ->missing('preinscription.photo_path')
    );
});
