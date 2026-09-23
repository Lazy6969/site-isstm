<?php

use App\Models\Filiere;
use App\Models\Preinscription;
use App\Models\User;
use App\PreinscriptionStatus;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

function validPreinscriptionPayload(array $overrides = []): array
{
    return array_merge([
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
        'password' => 'Password1',
        'password_confirmation' => 'Password1',
        'pays' => 'Madagascar',
        'niveau' => 'L1',
        'photo' => UploadedFile::fake()->image('photo.jpg'),
        'releve_bacc' => UploadedFile::fake()->image('releve.jpg'),
        'cin_document' => UploadedFile::fake()->image('cin.jpg'),
    ], $overrides);
}

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

it('creates a candidate account and préinscription, logs the candidate in, and sends a verification e-mail', function () {
    Storage::fake('public');
    Notification::fake();
    $filiere = Filiere::factory()->create();

    $response = $this->post('/preinscription', validPreinscriptionPayload(['filiere_id' => $filiere->id]));

    $response->assertRedirect(route('verification.notice'));
    $response->assertSessionHas('status');

    $user = User::firstWhere('email', 'jean.rakoto@example.com');
    expect($user)->not->toBeNull();
    expect(Auth::id())->toBe($user->id);
    expect($user->hasVerifiedEmail())->toBeFalse();

    $preinscription = Preinscription::firstWhere('user_id', $user->id);
    expect($preinscription)->not->toBeNull();
    expect($preinscription->status)->toBe(PreinscriptionStatus::Soumis);
    Storage::disk('public')->assertExists($preinscription->photo_path);
    Storage::disk('public')->assertExists($preinscription->releve_bacc_path);
    Storage::disk('public')->assertExists($preinscription->cin_document_path);

    Notification::assertSentTo($user, VerifyEmail::class);
});

it('rejects a submission with an e-mail already used by an account', function () {
    User::factory()->create(['email' => 'jean.rakoto@example.com']);
    $filiere = Filiere::factory()->create();

    $response = $this->post('/preinscription', validPreinscriptionPayload(['filiere_id' => $filiere->id]));

    $response->assertSessionHasErrors(['email']);
});

it('rejects a submission missing required fields', function () {
    $response = $this->post('/preinscription', []);

    $response->assertSessionHasErrors(['nom', 'prenoms', 'sexe', 'photo', 'releve_bacc', 'cin_document', 'password']);
});

it('requires the other-series field when serie_bacc is AUTRE', function () {
    $filiere = Filiere::factory()->create();

    $response = $this->post('/preinscription', validPreinscriptionPayload([
        'filiere_id' => $filiere->id,
        'serie_bacc' => 'AUTRE',
        'photo' => null,
    ]));

    $response->assertSessionHasErrors(['serie_bacc_autre', 'photo']);
});

it('requires a guest to log in before viewing the dossier', function () {
    $this->get('/mon-dossier')->assertRedirect('/login');
});

it('redirects an unverified candidate to the verification notice instead of the dossier', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get('/mon-dossier')->assertRedirect(route('verification.notice'));
});

it('shows the dossier status to a verified candidate', function () {
    $user = User::factory()->create();
    Preinscription::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/mon-dossier')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Dossier')
        ->where('preinscription.status', 'en_attente')
    );
});
