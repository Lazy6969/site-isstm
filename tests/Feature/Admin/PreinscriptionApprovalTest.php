<?php

use App\Models\Etudiant;
use App\Models\Preinscription;
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
    Preinscription::factory()->create(['nom' => 'EnAttente', 'status' => PreinscriptionStatus::Soumis]);
    Preinscription::factory()->create(['nom' => 'DejaApprouve', 'status' => PreinscriptionStatus::Accepte]);

    $this->actingAs($admin)->get('/console/preinscriptions')->assertInertia(fn ($page) => $page
        ->component('Admin/Preinscriptions/Index')
        ->has('preinscriptions', 1)
        ->where('preinscriptions.0.nom', 'EnAttente')
    );
});

it('marks a preinscription as reviewed the first time an admin opens its detail page', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Preinscription::factory()->create(['status' => PreinscriptionStatus::Soumis]);

    expect($preinscription->reviewed_at)->toBeNull();

    $this->actingAs($admin)->get("/console/preinscriptions/{$preinscription->id}")
        ->assertInertia(fn ($page) => $page->component('Admin/Preinscriptions/Show'));

    expect($preinscription->fresh()->reviewed_at)->not->toBeNull();
});

it('creates a student record and activates the existing account when an admin approves a preinscription', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $candidate = User::factory()->create(['name' => 'Jean RAKOTO', 'email' => 'jean.rakoto@example.com', 'role' => Role::User]);
    $preinscription = Preinscription::factory()->create([
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

    $etudiant = Etudiant::firstWhere('user_id', $candidate->id);
    expect($etudiant)->not->toBeNull();
    expect($etudiant->matricule)->toMatch('/^ISSTM-\d{4}-\d{5}$/');
    expect($etudiant->preinscription_id)->toBe($preinscription->id);

    Notification::assertSentTo($candidate, PreinscriptionAccepted::class);
});

it('refuses to approve a preinscription twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Preinscription::factory()->create(['status' => PreinscriptionStatus::Accepte]);

    $this->actingAs($admin)
        ->post("/console/preinscriptions/{$preinscription->id}/approve")
        ->assertStatus(409);
});

it('refuses a preinscription with an optional motif and notifies the candidate', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $candidate = User::factory()->create();
    $preinscription = Preinscription::factory()->create([
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
    $preinscription = Preinscription::factory()->create(['status' => PreinscriptionStatus::Refuse]);

    $this->actingAs($admin)
        ->post("/console/preinscriptions/{$preinscription->id}/approve")
        ->assertStatus(409);
});
