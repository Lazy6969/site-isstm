<?php

use App\Models\User;
use App\Role;

it('forbids a non-privileged user from listing users', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/users')->assertForbidden();
});

it('lets the super admin list users', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    User::factory()->count(2)->create();

    $this->actingAs($admin)->get('/console/users')->assertOk();
});

it('lets the super admin change another user\'s role', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($admin)
        ->put("/console/users/{$target->id}/role", ['role' => 'enseignant'])
        ->assertRedirect();

    expect($target->fresh()->hasRole('enseignant'))->toBeTrue();
});

it('forbids a user from changing their own role', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->put("/console/users/{$admin->id}/role", ['role' => 'etudiant'])
        ->assertForbidden();
});

it('lets the super admin deactivate and reactivate another user', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $target = User::factory()->create(['is_active' => true]);

    $this->actingAs($admin)->post("/console/users/{$target->id}/toggle-active")->assertRedirect();
    expect($target->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->post("/console/users/{$target->id}/toggle-active")->assertRedirect();
    expect($target->fresh()->is_active)->toBeTrue();
});

it('forbids a user from deactivating their own account', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post("/console/users/{$admin->id}/toggle-active")->assertForbidden();
});
