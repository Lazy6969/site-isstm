<?php

use App\Models\Candidat;
use App\Models\Classe;
use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\User;
use App\Notifications\PreinscriptionAccepted;
use App\Notifications\PreinscriptionRefused;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Support\Facades\Notification;

it('forbids a non-admin from viewing pending preinscriptions', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/preinscriptions')->assertForbidden();
});

it('lists only pending preinscriptions for an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Candidat::factory()->create(['nom' => 'EnAttente', 'status' => PreinscriptionStatus::Soumis]);
    Candidat::factory()->create(['nom' => 'DejaApprouve', 'status' => PreinscriptionStatus::Accepte]);

    $this->actingAs($admin)->get('/console/preinscriptions')->assertInertia(fn ($page) => $page
        ->component('Admin/Preinscriptions/Index')
        ->has('preinscriptions', 1)
        ->where('preinscriptions.0.nom', 'EnAttente')
    );
});

it('marks a preinscription as reviewed the first time an admin opens its detail page', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Candidat::factory()->create(['status' => PreinscriptionStatus::Soumis]);

    expect($preinscription->reviewed_at)->toBeNull();

    $this->actingAs($admin)->get("/console/preinscriptions/{$preinscription->id}")
        ->assertInertia(fn ($page) => $page->component('Admin/Preinscriptions/Show'));

    expect($preinscription->fresh()->reviewed_at)->not->toBeNull();
});

it('creates a student record and activates the existing account when an admin approves a preinscription', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $candidate = User::factory()->create(['name' => 'Jean RAKOTO', 'email' => 'jean.rakoto@example.com', 'role' => Role::User]);
    $preinscription = Candidat::factory()->create([
        'user_id' => $candidate->id,
        'status' => PreinscriptionStatus::Soumis,
    ]);

    $this->actingAs($admin)
        ->post("/console/preinscriptions/{$preinscription->id}/approve")
        ->assertRedirect();

    $preinscription->refresh();
    expect($preinscription->status)->toBe(PreinscriptionStatus::Accepte);

    $candidate->refresh();
    expect($candidate->role)->toBe(Role::Etudiant);
    expect($candidate->hasRole('etudiant'))->toBeTrue();

    // The approval is what opens the étudiant space, so the account has to be
    // usable from that point — active, and past the `verified` middleware.
    expect($candidate->is_active)->toBeTrue();
    expect($candidate->hasVerifiedEmail())->toBeTrue();

    $etudiant = Etudiant::firstWhere('user_id', $candidate->id);
    expect($etudiant)->not->toBeNull();
    expect($etudiant->matricule)->toMatch('/^ISSTM-\d{4}-\d{5}$/');
    expect($etudiant->candidat_id)->toBe($preinscription->id);

    // The candidate's identity is copied onto the étudiant record itself so
    // the admin screens don't have to reach through preinscription for it.
    expect($etudiant->nom)->toBe($preinscription->nom);
    expect($etudiant->prenoms)->toBe($preinscription->prenoms);
    expect($etudiant->date_naissance->toDateString())->toBe($preinscription->date_naissance->toDateString());
    expect($etudiant->telephone)->toBe($preinscription->telephone);
    expect($etudiant->adresse)->toBe($preinscription->adresse);

    Notification::assertSentTo($candidate, PreinscriptionAccepted::class);
});

it('refuses to approve a preinscription twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Candidat::factory()->create(['status' => PreinscriptionStatus::Accepte]);

    $this->actingAs($admin)
        ->post("/console/preinscriptions/{$preinscription->id}/approve")
        ->assertStatus(409);
});

it('refuses a preinscription with an optional motif and notifies the candidate', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $candidate = User::factory()->create();
    $preinscription = Candidat::factory()->create([
        'user_id' => $candidate->id,
        'status' => PreinscriptionStatus::Soumis,
    ]);

    $this->actingAs($admin)
        ->post("/console/preinscriptions/{$preinscription->id}/refuse", ['motif_refus' => 'Dossier incomplet'])
        ->assertRedirect();

    $preinscription->refresh();
    expect($preinscription->status)->toBe(PreinscriptionStatus::Refuse);
    expect($preinscription->motif_refus)->toBe('Dossier incomplet');

    Notification::assertSentTo($candidate, PreinscriptionRefused::class);
});

it('refuses to decide a preinscription twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Candidat::factory()->create(['status' => PreinscriptionStatus::Refuse]);

    $this->actingAs($admin)
        ->post("/console/preinscriptions/{$preinscription->id}/approve")
        ->assertStatus(409);
});

it('places the new student in the niveau chosen in the pre-registration form', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['code' => 'GI']);
    $preinscription = Candidat::factory()->create([
        'user_id' => User::factory()->create(['role' => Role::User])->id,
        'status' => PreinscriptionStatus::Soumis,
        'filiere_id' => $filiere->id,
        'niveau' => 'L2',
    ]);

    $this->actingAs($admin)->post("/console/preinscriptions/{$preinscription->id}/approve")->assertRedirect();

    $etudiant = Etudiant::where('candidat_id', $preinscription->id)->firstOrFail();
    expect($etudiant->classe)->not->toBeNull()
        ->and($etudiant->classe->niveau)->toBe('L2')
        ->and($etudiant->classe->filiere_id)->toBe($filiere->id);
});

it('reuses the same niveau for every student accepted into it', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create();

    foreach (range(1, 2) as $_) {
        $preinscription = Candidat::factory()->create([
            'user_id' => User::factory()->create(['role' => Role::User])->id,
            'status' => PreinscriptionStatus::Soumis,
            'filiere_id' => $filiere->id,
            'niveau' => 'M1',
        ]);
        $this->actingAs($admin)->post("/console/preinscriptions/{$preinscription->id}/approve")->assertRedirect();
    }

    expect(Classe::where('filiere_id', $filiere->id)->where('niveau', 'M1')->count())->toBe(1)
        ->and(Etudiant::whereNotNull('classe_id')->count())->toBe(2);
});
