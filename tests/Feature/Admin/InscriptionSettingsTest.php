<?php

use App\Models\Setting;
use App\Models\User;
use App\Role;

// Préinscription/réactivation gating used to live on its own
// /console/settings/inscriptions page — it's now a second section of
// /console/settings/maintenance. The Setting keys are unchanged.

it('forbids a non-super-admin from viewing inscription settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/settings/maintenance')->assertForbidden();
});

it('lets the super admin view inscription settings with sensible defaults', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/settings/maintenance')->assertInertia(fn ($page) => $page
        ->component('Admin/Settings/Maintenance')
        ->where('inscriptionSettings.closed', false)
        ->where('inscriptionSettings.message', '')
    );
});

it('lets the super admin close inscriptions with a custom message', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/maintenance/inscriptions', [
        'closed' => true,
        'message' => 'Fermé pour la pause pédagogique.',
    ])->assertRedirect();

    expect(Setting::get('inscriptions.closed'))->toBe('true');
    expect(Setting::get('inscriptions.closed_message'))->toBe('Fermé pour la pause pédagogique.');
});

it('forbids a non-super-admin from updating inscription settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->put('/console/settings/maintenance/inscriptions', [
        'closed' => true,
    ])->assertForbidden();
});
