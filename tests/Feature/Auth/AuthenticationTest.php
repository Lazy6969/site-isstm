<?php

use App\Models\User;
use App\Role;

it('renders the login page', function () {
    $this->get('/login')->assertOk();
});

it('logs the user in with valid credentials', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('home'));
});

it('sends an admin straight to the console dashboard instead of the homepage', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $response = $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($admin);
    $response->assertRedirect(route('admin.dashboard'));
});

it('sends a student straight to the community feed instead of the homepage', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('posts.index'));
});

it('rejects an invalid password', function () {
    $user = User::factory()->create();

    $response = $this->from('/login')->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
    $response->assertRedirect('/login');
    $response->assertSessionHasErrors('email');
});

/**
 * Reproduces exactly what the Login.jsx frontend reads after a failed
 * attempt: not just that the session carries a validation error (already
 * covered above), but that the *next* page Inertia renders — the one
 * useForm()'s errors state actually hydrates from — carries it in
 * props.errors.email, on the right component.
 */
it('delivers the invalid-credentials message to the Inertia page the frontend re-renders', function () {
    $this->from('/login')->post('/login', [
        'email' => 'nobody@example.com',
        'password' => 'wrong-password',
    ]);

    $this->get('/login')->assertInertia(fn ($page) => $page
        ->component('Auth/Login')
        ->where('errors.email', 'Ces identifiants ne correspondent à aucun compte.')
    );
});

it('logs the user out', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

it('redirects an authenticated user away from the login page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/login')->assertRedirect(route('home'));
});

it('refuses login for a deactivated account', function () {
    $user = User::factory()->create(['is_active' => false]);

    $response = $this->from('/login')->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});
