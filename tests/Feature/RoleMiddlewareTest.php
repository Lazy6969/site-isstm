<?php

use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware(['web', 'auth', 'role:admin'])
        ->get('/_test/admin-only', fn () => 'ok');
});

it('forbids a guest from reaching a role-protected route', function () {
    $this->get('/_test/admin-only')->assertRedirect('/login');
});

it('forbids a user without the required role', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->get('/_test/admin-only')->assertForbidden();
});

it('allows a user with the required role', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/_test/admin-only')->assertOk();
});
