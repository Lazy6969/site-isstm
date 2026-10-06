<?php

use App\Models\ReactivationRequest;
use App\Models\User;
use App\Notifications\ReactivationRequested;
use App\Role;
use Illuminate\Support\Facades\Notification;

it('renders the request form', function () {
    $this->get('/ancien-etudiant')->assertInertia(fn ($page) => $page
        ->component('AncienEtudiant/Verifier')
    );
});

it('creates a pending request and notifies admins for an inactive account', function () {
    Notification::fake();
    $admin = User::factory()->role(Role::Admin)->create();
    $former = User::factory()->create(['email' => 'ancien@example.com', 'is_active' => false]);

    $this->post('/ancien-etudiant', ['email' => 'ancien@example.com'])
        ->assertRedirect()
        ->assertSessionHas('status');

    $reactivation = ReactivationRequest::firstWhere('user_id', $former->id);
    expect($reactivation)->not->toBeNull();
    expect($reactivation->status->value)->toBe('en_attente');

    Notification::assertSentTo($admin, ReactivationRequested::class);
});

it('does not create a request for an already active account', function () {
    $active = User::factory()->create(['email' => 'actif@example.com', 'is_active' => true]);

    $this->post('/ancien-etudiant', ['email' => 'actif@example.com'])->assertRedirect();

    expect(ReactivationRequest::where('user_id', $active->id)->exists())->toBeFalse();
});

it('tells the visitor plainly when no account exists for that email', function () {
    $this->post('/ancien-etudiant', ['email' => 'inconnu@example.com'])
        ->assertSessionHas('status', "Aucun compte n'existe pour cette adresse e-mail.");
});

it('gives the same generic message for an active or a pending account, without distinguishing them', function () {
    User::factory()->create(['email' => 'actif2@example.com', 'is_active' => true]);
    $this->post('/ancien-etudiant', ['email' => 'actif2@example.com']);
    $active = session('status');

    User::factory()->create(['email' => 'inactif2@example.com', 'is_active' => false]);
    $this->post('/ancien-etudiant', ['email' => 'inactif2@example.com']);
    $pending = session('status');

    expect($active)->toBe($pending)->not->toBeNull();
});

it('does not create a duplicate pending request for the same account', function () {
    Notification::fake();
    $former = User::factory()->create(['email' => 'ancien2@example.com', 'is_active' => false]);

    $this->post('/ancien-etudiant', ['email' => 'ancien2@example.com']);
    $this->post('/ancien-etudiant', ['email' => 'ancien2@example.com']);

    expect(ReactivationRequest::where('user_id', $former->id)->count())->toBe(1);
});
