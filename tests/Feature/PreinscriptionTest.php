<?php

use App\Models\Candidat;
use App\Models\Filiere;
use App\Models\User;
use App\Notifications\PreinscriptionReceived;
use App\Notifications\PreinscriptionSubmitted;
use App\Notifications\QueuedResetPassword;
use App\Notifications\QueuedVerifyEmail;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

function validAccountPayload(array $overrides = []): array
{
    return array_merge([
        'nom' => 'RAKOTO',
        'prenoms' => 'Jean',
        'civilite' => 'M',
        'sexe' => 'M',
        'email' => 'jean.rakoto@example.com',
    ], $overrides);
}

function validDossierPayload(array $overrides = []): array
{
    return array_merge([
        'date_naissance' => '2005-01-01',
        'lieu_naissance' => 'Mahajanga',
        'nationalite' => 'Malgache',
        'annee_bacc' => '2024',
        'serie_bacc' => 'D',
        'mention_bacc' => 'Passable',
        'code_redoublement' => 'N',
        'adresse' => 'Lot A 1',
        'telephone' => '0341234567',
        'contact_parents' => '0340000000',
        'pays' => 'Madagascar',
        'niveau' => 'L1',
        'photo' => UploadedFile::fake()->image('photo.jpg'),
        'releve_bacc' => UploadedFile::fake()->image('releve.jpg'),
        'cin_recto' => UploadedFile::fake()->image('cin-recto.jpg'),
        'cin_verso' => UploadedFile::fake()->image('cin-verso.jpg'),
        'diplome_attestation' => UploadedFile::fake()->image('diplome.jpg'),
    ], $overrides);
}

/**
 * Runs the two-step wizard end to end (account, then final submit) and
 * returns the resulting Candidat — the flow every "happy path" test
 * exercises.
 */
function submitPreinscription(array $accountOverrides = [], array $dossierOverrides = []): Candidat
{
    test()->post('/preinscription/compte', validAccountPayload($accountOverrides));
    $preinscription = Candidat::firstWhere('email', $accountOverrides['email'] ?? 'jean.rakoto@example.com');

    test()->post("/preinscription/{$preinscription->id}/soumettre", validDossierPayload($dossierOverrides));

    return $preinscription->fresh();
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

it('creates a candidate account in a Brouillon dossier and logs the candidate in, without e-mailing anything yet', function () {
    Notification::fake();

    $response = $this->post('/preinscription/compte', validAccountPayload());

    $response->assertRedirect();

    $user = User::firstWhere('email', 'jean.rakoto@example.com');
    expect($user)->not->toBeNull();
    expect(Auth::id())->toBe($user->id);

    $preinscription = Candidat::firstWhere('user_id', $user->id);
    expect($preinscription)->not->toBeNull();
    expect($preinscription->status)->toBe(PreinscriptionStatus::Brouillon);

    // Nothing is e-mailed until the dossier is actually submitted (see the
    // submit() test below) — a candidate who abandons the wizard here should
    // never receive anything.
    Notification::assertNothingSent();
});

it('saves the whole identité step, not just the account fields, when the account is created', function () {
    $this->post('/preinscription/compte', validAccountPayload([
        'date_naissance' => '2005-01-01',
        'lieu_naissance' => 'Mahajanga',
        'telephone' => '0341234567',
        'adresse' => 'Lot A 1',
    ]));

    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');
    expect($preinscription->lieu_naissance)->toBe('Mahajanga');
    expect($preinscription->telephone)->toBe('0341234567');
    expect($preinscription->adresse)->toBe('Lot A 1');
    expect($preinscription->date_naissance->toDateString())->toBe('2005-01-01');
});

it('reopens a draft past the identité step so a page reload never rewinds the wizard', function () {
    $this->post('/preinscription/compte', validAccountPayload());

    $this->get('/preinscription')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Create')
        ->where('initialStep', 'famille')
        ->where('draft.email', 'jean.rakoto@example.com')
    );
});

it('reopens a draft at the furthest step it already holds data for', function () {
    $user = User::factory()->create();
    $filiere = Filiere::factory()->create();

    $draft = Candidat::factory()->create([
        'user_id' => $user->id,
        'status' => PreinscriptionStatus::Brouillon,
        'contact_parents' => '0340000000',
        'filiere_id' => null,
        'niveau' => null,
    ]);

    $this->actingAs($user)->get('/preinscription')
        ->assertInertia(fn ($page) => $page->where('initialStep', 'formation'));

    $draft->update(['filiere_id' => $filiere->id, 'niveau' => 'L1']);

    $this->actingAs($user)->get('/preinscription')
        ->assertInertia(fn ($page) => $page->where('initialStep', 'validation'));
});

it('starts a brand-new candidate on the identité step', function () {
    $this->get('/preinscription')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Create')
        ->where('initialStep', 'identite')
        ->where('draft', null)
    );
});

it('sends a candidate who already submitted a dossier to their dossier page, not a blank form', function () {
    $user = User::factory()->create();
    Candidat::factory()->create(['user_id' => $user->id, 'status' => PreinscriptionStatus::Soumis]);

    $this->actingAs($user)->get('/preinscription')
        ->assertRedirect(route('preinscription.dossier'))
        ->assertSessionHas('status');
});

it('explains on the dossier page why an already-submitted candidate was sent there', function () {
    $user = User::factory()->create();
    Candidat::factory()->create(['user_id' => $user->id, 'status' => PreinscriptionStatus::Soumis]);

    $this->actingAs($user)->followingRedirects()->get('/preinscription')
        ->assertInertia(fn ($page) => $page
            ->component('Preinscription/Dossier')
            ->where('flash.status', 'Votre dossier a déjà été envoyé : il n’est plus modifiable. Vous pouvez suivre son avancement sur cette page.')
        );
});

it('rejects account creation with an e-mail already used by an account', function () {
    User::factory()->create(['email' => 'jean.rakoto@example.com']);

    $response = $this->post('/preinscription/compte', validAccountPayload());

    $response->assertSessionHasErrors(['email']);
});

it('saves a draft without requiring files or account fields', function () {
    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');
    $filiere = Filiere::factory()->create();

    $this->patch("/preinscription/{$preinscription->id}/brouillon", [
        'lieu_naissance' => 'Mahajanga',
        'filiere_id' => $filiere->id,
    ])->assertRedirect();

    $preinscription->refresh();
    expect($preinscription->status)->toBe(PreinscriptionStatus::Brouillon);
    expect($preinscription->lieu_naissance)->toBe('Mahajanga');
    expect($preinscription->filiere_id)->toBe($filiere->id);
});

it("forbids another candidate from saving a draft on someone else's dossier", function () {
    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');

    $intruder = User::factory()->create();
    $this->actingAs($intruder)
        ->patch("/preinscription/{$preinscription->id}/brouillon", ['lieu_naissance' => 'Ailleurs'])
        ->assertForbidden();
});

it('submits a complete dossier, generates a dossier number, logs the candidate in, and e-mails only a "received" notification', function () {
    Storage::fake('public');
    Notification::fake();
    $filiere = Filiere::factory()->create();

    $preinscription = submitPreinscription(dossierOverrides: ['filiere_id' => $filiere->id]);

    expect($preinscription->status)->toBe(PreinscriptionStatus::Soumis);
    expect($preinscription->numero_dossier)->toMatch('/^PI-\d{4}-\d{5}$/');
    expect($preinscription->submitted_at)->not->toBeNull();
    Storage::disk('public')->assertExists($preinscription->photo_path);
    Storage::disk('public')->assertExists($preinscription->releve_bacc_path);
    Storage::disk('public')->assertExists($preinscription->cin_recto_path);
    Storage::disk('public')->assertExists($preinscription->cin_verso_path);
    Storage::disk('public')->assertExists($preinscription->diplome_attestation_path);

    $user = $preinscription->user;
    expect(Auth::id())->toBe($user->id);
    // No password-setup link yet — that only arrives once the dossier is
    // approved (see PreinscriptionAccepted / PreinscriptionApprovalTest).
    Notification::assertSentTo($user, PreinscriptionReceived::class);
    Notification::assertNotSentTo($user, QueuedVerifyEmail::class);
    Notification::assertNotSentTo($user, QueuedResetPassword::class);
});

it('sends the candidate straight to their dossier after submitting, not a verification detour', function () {
    Storage::fake('public');
    $filiere = Filiere::factory()->create();

    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');

    $this->post("/preinscription/{$preinscription->id}/soumettre", validDossierPayload(['filiere_id' => $filiere->id]))
        ->assertRedirect(route('preinscription.dossier'));
});

it("doesn't require re-uploading a file already saved by an earlier draft", function () {
    Storage::fake('public');
    $filiere = Filiere::factory()->create();

    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');

    $this->patch("/preinscription/{$preinscription->id}/brouillon", [
        'photo' => UploadedFile::fake()->image('photo.jpg'),
    ]);

    $payload = validDossierPayload(['filiere_id' => $filiere->id]);
    unset($payload['photo']);

    $this->post("/preinscription/{$preinscription->id}/soumettre", $payload)->assertRedirect();

    expect($preinscription->fresh()->status)->toBe(PreinscriptionStatus::Soumis);
});

it('notifies every admin holding preinscriptions.manage when a dossier is submitted', function () {
    Storage::fake('public');
    Notification::fake();
    $filiere = Filiere::factory()->create();
    $scolarite = User::factory()->role(Role::Admin)->create();
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $preinscription = submitPreinscription(dossierOverrides: ['filiere_id' => $filiere->id]);

    Notification::assertSentTo($scolarite, PreinscriptionSubmitted::class, function ($notification) use ($preinscription) {
        return $notification->preinscription->is($preinscription);
    });
    Notification::assertNotSentTo($etudiant, PreinscriptionSubmitted::class);
});

it('rejects a submission missing required dossier fields', function () {
    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');

    $response = $this->post("/preinscription/{$preinscription->id}/soumettre", []);

    $response->assertSessionHasErrors([
        'date_naissance', 'lieu_naissance', 'photo', 'releve_bacc', 'cin_recto', 'cin_verso', 'diplome_attestation', 'contact_parents',
    ]);
});

it('requires at least one contactable phone number for the family, either the parents or the répondant', function () {
    $filiere = Filiere::factory()->create();

    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');

    $response = $this->post("/preinscription/{$preinscription->id}/soumettre", validDossierPayload([
        'filiere_id' => $filiere->id,
        'contact_parents' => null,
    ]));

    $response->assertSessionHasErrors(['contact_parents']);
});

it('requires the other-series field when serie_bacc is AUTRE', function () {
    $filiere = Filiere::factory()->create();

    $this->post('/preinscription/compte', validAccountPayload());
    $preinscription = Candidat::firstWhere('email', 'jean.rakoto@example.com');

    $response = $this->post("/preinscription/{$preinscription->id}/soumettre", validDossierPayload([
        'filiere_id' => $filiere->id,
        'serie_bacc' => 'AUTRE',
        'photo' => null,
    ]));

    $response->assertSessionHasErrors(['serie_bacc_autre', 'photo']);
});

it('requires a guest to log in before viewing the dossier', function () {
    $this->get('/mon-dossier')->assertRedirect('/login');
});

it('lets an unverified candidate view their own dossier — no e-mail verification is required for this', function () {
    $user = User::factory()->unverified()->create();
    Candidat::factory()->create(['user_id' => $user->id, 'status' => PreinscriptionStatus::Soumis]);

    $this->actingAs($user)->get('/mon-dossier')->assertOk();
});

it('shows the dossier status to a verified candidate', function () {
    $user = User::factory()->create();
    Candidat::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/mon-dossier')->assertInertia(fn ($page) => $page
        ->component('Preinscription/Dossier')
        ->where('preinscription.status', 'en_attente')
    );
});
