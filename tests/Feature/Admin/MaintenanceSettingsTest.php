<?php

use App\Models\Setting;
use App\Models\User;
use App\Role;

it('forbids a non-super-admin from viewing maintenance settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/settings/maintenance')->assertForbidden();
});

it('lets the super admin view maintenance settings with sensible defaults', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/settings/maintenance')->assertInertia(fn ($page) => $page
        ->component('Admin/Settings/Maintenance')
        ->where('settings.enabled', false)
        ->where('settings.template', 'maintenance')
        ->has('templates', 3)
    );
});

it('lets the super admin turn maintenance on with a chosen template and message', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/maintenance', [
        'enabled' => true,
        'template' => 'indisponible',
        'title' => 'Titre perso',
        'message' => 'Message perso',
    ])->assertRedirect();

    expect(Setting::get('maintenance.enabled'))->toBe('true');
    expect(Setting::get('maintenance.template'))->toBe('indisponible');
    expect(Setting::get('maintenance.title'))->toBe('Titre perso');
    expect(Setting::get('maintenance.message'))->toBe('Message perso');
});

it('rejects an invalid maintenance template', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/maintenance', [
        'enabled' => true,
        'template' => 'neon',
    ])->assertSessionHasErrors(['template']);
});

it('forbids a non-super-admin from updating maintenance settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->put('/console/settings/maintenance', [
        'enabled' => true,
        'template' => 'maintenance',
    ])->assertForbidden();
});

it('previews any template and text combination without requiring maintenance to be on', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)
        ->get('/console/settings/maintenance/preview?'.http_build_query([
            'template' => 'indisponible',
            'title' => 'Aperçu du titre',
            'message' => 'Aperçu du message',
        ]))
        ->assertOk()
        ->assertSee('Aperçu du titre')
        ->assertSee('Aperçu du message');
});

it('forbids a non-super-admin from previewing the maintenance page', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/settings/maintenance/preview')->assertForbidden();
});
