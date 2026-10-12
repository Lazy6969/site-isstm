<?php

use App\Models\Setting;
use App\Models\User;
use App\Role;

// The "Admissions ouvertes/fermées" homepage banner's on/off switch — a
// third section of /console/settings/maintenance (same page as the general
// maintenance toggle and the préinscription/réactivation gating).

it('lets the super admin view admissions settings with a sensible default', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/settings/maintenance')->assertInertia(fn ($page) => $page
        ->component('Admin/Settings/Maintenance')
        ->where('admissionsOpen', true)
    );
});

it('lets the super admin mark admissions as closed', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/maintenance/admissions', [
        'open' => false,
    ])->assertRedirect();

    expect(Setting::get('admissions.open'))->toBe('false');
});

it('lets the super admin mark admissions as open again', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Setting::set('admissions.open', 'false');

    $this->actingAs($admin)->put('/console/settings/maintenance/admissions', [
        'open' => true,
    ])->assertRedirect();

    expect(Setting::get('admissions.open'))->toBe('true');
});

it('forbids a non-super-admin from updating admissions settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->put('/console/settings/maintenance/admissions', [
        'open' => false,
    ])->assertForbidden();
});

it('shares the admissions status with every page via Inertia', function () {
    $visitor = User::factory()->role(Role::Etudiant)->create();
    Setting::set('admissions.open', 'false');

    $this->actingAs($visitor)->get('/')->assertInertia(fn ($page) => $page
        ->where('admissionsOpen', false)
    );
});
