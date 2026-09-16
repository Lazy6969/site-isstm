<?php

use App\Models\Filiere;
use App\Models\Preinscription;
use App\PreinscriptionStatus;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('renders the inscription info page with fee content', function () {
    $this->get('/inscription')->assertInertia(fn ($page) => $page
        ->component('Inscription/Index')
        ->has('content')
    );
});

it('renders the preinscription form with filieres', function () {
    Filiere::factory()->create();

    $this->get('/preinscription')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Create')
        ->has('filieres', 1)
    );
});

it('creates a preinscription with valid data and an uploaded photo', function () {
    Storage::fake('public');
    $filiere = Filiere::factory()->create();

    $response = $this->post('/preinscription', [
        'nom' => 'RAKOTO',
        'prenoms' => 'Jean',
        'sexe' => 'M',
        'date_naissance' => '2005-01-01',
        'lieu_naissance' => 'Mahajanga',
        'nationalite' => 'Malgache',
        'annee_bacc' => '2024',
        'serie_bacc' => 'D',
        'mention_bacc' => 'Passable',
        'code_redoublement' => 'N',
        'adresse' => 'Lot A 1',
        'telephone' => '0341234567',
        'email' => 'jean.rakoto@example.com',
        'pays' => 'Madagascar',
        'filiere_id' => $filiere->id,
        'niveau' => 'L1',
        'photo' => UploadedFile::fake()->image('photo.jpg'),
    ]);

    $response->assertRedirect(route('preinscription.create'));
    $response->assertSessionHas('status');

    $preinscription = Preinscription::firstWhere('email', 'jean.rakoto@example.com');
    expect($preinscription)->not->toBeNull();
    expect($preinscription->status)->toBe(PreinscriptionStatus::EnAttente);
    Storage::disk('public')->assertExists($preinscription->photo_path);
});

it('rejects a submission missing required fields', function () {
    $response = $this->post('/preinscription', []);

    $response->assertSessionHasErrors(['nom', 'prenoms', 'sexe', 'photo']);
});

it('requires the other-series field when serie_bacc is AUTRE', function () {
    $filiere = Filiere::factory()->create();

    $response = $this->post('/preinscription', [
        'nom' => 'RAKOTO',
        'prenoms' => 'Jean',
        'sexe' => 'M',
        'date_naissance' => '2005-01-01',
        'lieu_naissance' => 'Mahajanga',
        'nationalite' => 'Malgache',
        'annee_bacc' => '2024',
        'serie_bacc' => 'AUTRE',
        'mention_bacc' => 'Passable',
        'code_redoublement' => 'N',
        'adresse' => 'Lot A 1',
        'telephone' => '0341234567',
        'email' => 'jean.rakoto@example.com',
        'pays' => 'Madagascar',
        'filiere_id' => $filiere->id,
        'niveau' => 'L1',
    ]);

    $response->assertSessionHasErrors(['serie_bacc_autre', 'photo']);
});
