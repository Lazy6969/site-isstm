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

it('lists every account with its direct and role-inherited permissions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $enseignant = User::factory()->role(Role::Enseignant)->create();
    $enseignant->givePermissionTo('etudiants.view');

    $this->actingAs($admin)->get('/console/roles')->assertInertia(fn ($page) => $page
        ->has('users', fn ($page) => $page->count(2)->each(fn ($page) => $page->hasAll(['id', 'name', 'email', 'avatar_path', 'role', 'permissions', 'role_permissions'])))
    );
});

it('lets the super admin grant a direct permission to an account', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $enseignant = User::factory()->role(Role::Enseignant)->create();

    $this->actingAs($admin)
        ->put("/console/roles/users/{$enseignant->id}", ['permissions' => ['etudiants.view']])
        ->assertRedirect();

    expect($enseignant->fresh()->getDirectPermissions()->pluck('name')->all())->toBe(['etudiants.view']);
});

it('keeps a direct permission additive on top of the role\'s own permissions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $enseignant = User::factory()->role(Role::Enseignant)->create();
    $rolePermissions = $enseignant->getPermissionsViaRoles()->pluck('name')->all();

    $this->actingAs($admin)->put("/console/roles/users/{$enseignant->id}", ['permissions' => ['etudiants.view']]);

    $enseignant->refresh();
    expect($enseignant->can('etudiants.view'))->toBeTrue();
    foreach ($rolePermissions as $permission) {
        expect($enseignant->can($permission))->toBeTrue();
    }
});

it('forbids a user from editing their own direct permissions', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->put("/console/roles/users/{$admin->id}", ['permissions' => []])
        ->assertForbidden();
});

it('forbids editing a super admin account\'s direct permissions', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $otherAdmin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->put("/console/roles/users/{$otherAdmin->id}", ['permissions' => []])
        ->assertForbidden();
});
