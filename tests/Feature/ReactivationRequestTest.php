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

it('gives the same generic message for an unknown email, to avoid leaking account existence', function () {
    $this->post('/ancien-etudiant', ['email' => 'inconnu@example.com']);
    $known = session('status');

    User::factory()->create(['email' => 'actif2@example.com', 'is_active' => true]);
    $this->post('/ancien-etudiant', ['email' => 'actif2@example.com']);
    $other = session('status');

    expect($known)->toBe($other)->not->toBeNull();
});

it('does not create a duplicate pending request for the same account', function () {
    Notification::fake();
    $former = User::factory()->create(['email' => 'ancien2@example.com', 'is_active' => false]);

    $this->post('/ancien-etudiant', ['email' => 'ancien2@example.com']);
    $this->post('/ancien-etudiant', ['email' => 'ancien2@example.com']);

    expect(ReactivationRequest::where('user_id', $former->id)->count())->toBe(1);
});
