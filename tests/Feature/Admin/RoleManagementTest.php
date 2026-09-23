<?php

use App\Models\User;
use App\Role;
use Spatie\Permission\Models\Role as SpatieRole;

it('forbids a non-privileged user from listing roles', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/roles')->assertForbidden();
});

it('lets the super admin list roles', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/roles')->assertOk();
});

it('lets the super admin update a role\'s permissions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $scolarite = SpatieRole::findByName('scolarite');

    $this->actingAs($admin)
        ->put("/console/roles/{$scolarite->id}", ['permissions' => ['etudiants.view']])
        ->assertRedirect();

    expect($scolarite->fresh()->permissions->pluck('name')->all())->toBe(['etudiants.view']);
});

it('forbids editing the super admin role\'s permissions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $superAdmin = SpatieRole::findByName('super-admin');

    $this->actingAs($admin)
        ->put("/console/roles/{$superAdmin->id}", ['permissions' => []])
        ->assertForbidden();
});
