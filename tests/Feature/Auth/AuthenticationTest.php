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
