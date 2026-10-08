<?php

use App\Models\Setting;
use App\Models\User;
use App\Role;

it('forbids a non-super-admin from viewing inscription settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/settings/inscriptions')->assertForbidden();
});

it('lets the super admin view inscription settings with sensible defaults', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/settings/inscriptions')->assertInertia(fn ($page) => $page
        ->component('Admin/Settings/Inscriptions')
        ->where('settings.closed', false)
        ->where('settings.message', '')
    );
});

it('lets the super admin close inscriptions with a custom message', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/inscriptions', [
        'closed' => true,
        'message' => 'Fermé pour la pause pédagogique.',
    ])->assertRedirect();

    expect(Setting::get('inscriptions.closed'))->toBe('true');
    expect(Setting::get('inscriptions.closed_message'))->toBe('Fermé pour la pause pédagogique.');
});

it('forbids a non-super-admin from updating inscription settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->put('/console/settings/inscriptions', [
        'closed' => true,
    ])->assertForbidden();
});
