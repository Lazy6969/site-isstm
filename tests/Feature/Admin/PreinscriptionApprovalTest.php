<?php

use App\Models\Preinscription;
use App\Models\User;
use App\PreinscriptionStatus;
use App\Role;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

it('forbids a non-admin from viewing pending preinscriptions', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/admin/preinscriptions')->assertForbidden();
});

it('lists only pending preinscriptions for an admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Preinscription::factory()->create(['nom' => 'EnAttente', 'status' => PreinscriptionStatus::EnAttente]);
    Preinscription::factory()->create(['nom' => 'DejaApprouve', 'status' => PreinscriptionStatus::Approuve]);

    $this->actingAs($admin)->get('/admin/preinscriptions')->assertInertia(fn ($page) => $page
        ->component('Admin/Preinscriptions/Index')
        ->has('preinscriptions', 1)
        ->where('preinscriptions.0.nom', 'EnAttente')
    );
});

it('creates a student account when an admin approves a preinscription', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Preinscription::factory()->create([
        'nom' => 'RAKOTO',
        'prenoms' => 'Jean',
        'email' => 'jean.rakoto@example.com',
        'status' => PreinscriptionStatus::EnAttente,
    ]);

    $this->actingAs($admin)
        ->post("/admin/preinscriptions/{$preinscription->id}/approve")
        ->assertRedirect();

    $preinscription->refresh();
    expect($preinscription->status)->toBe(PreinscriptionStatus::Approuve);
    expect($preinscription->user)->not->toBeNull();
    expect($preinscription->user->role)->toBe(Role::Etudiant);
    expect($preinscription->user->email)->toBe('jean.rakoto@example.com');

    Notification::assertSentTo($preinscription->user, ResetPassword::class);
});

it('refuses to approve a preinscription twice', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $preinscription = Preinscription::factory()->create(['status' => PreinscriptionStatus::Approuve]);

    $this->actingAs($admin)
        ->post("/admin/preinscriptions/{$preinscription->id}/approve")
        ->assertStatus(409);
});
