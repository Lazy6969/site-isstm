<?php

use App\Models\User;

it('redirects guests to the login page', function () {
    $this->get('/profil')->assertRedirect('/login');
});

it('renders the edit form for an authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/profil')->assertOk();
});

it('updates the profile with valid data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/profil', [
        'name' => 'Nouveau Nom',
        'email' => $user->email,
        'city' => 'Mahajanga',
        'bio' => 'Étudiante en génie informatique.',
    ]);

    $response->assertSessionHasNoErrors();
    expect($user->fresh())
        ->name->toBe('Nouveau Nom')
        ->city->toBe('Mahajanga')
        ->bio->toBe('Étudiante en génie informatique.');
});

it('rejects an email already used by another account', function () {
    $existing = User::factory()->create();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/profil', [
        'name' => $user->name,
        'email' => $existing->email,
    ]);

    $response->assertSessionHasErrors('email');
});

it('shows a public profile without requiring authentication', function () {
    $user = User::factory()->create(['bio' => 'Passionnée de robotique.']);

    $this->get("/profil/{$user->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Show')
            ->where('profile.name', $user->name)
        );
});
