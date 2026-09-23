<?php

use App\Models\Setting;
use App\Models\User;
use App\Role;

it('forbids a non-super-admin from viewing appearance settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/settings/appearance')->assertForbidden();
});

it('lets the super admin view appearance settings with sensible defaults', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/console/settings/appearance')->assertInertia(fn ($page) => $page
        ->component('Admin/Settings/Appearance')
        ->where('settings.palette', 'default')
        ->where('settings.font', 'instrument-sans')
        ->where('settings.density', 'normal')
        ->has('palettes', 7)
        ->has('fonts', 8)
    );
});

it('lets the super admin update appearance settings', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/appearance', [
        'palette' => 'emerald',
        'font' => 'inter',
        'density' => 'compact',
    ])->assertRedirect();

    expect(Setting::get('appearance.palette'))->toBe('emerald');
    expect(Setting::get('appearance.font'))->toBe('inter');
    expect(Setting::get('appearance.density'))->toBe('compact');
});

it('rejects an invalid palette, font, or density', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/appearance', [
        'palette' => 'neon',
        'font' => 'comic-sans',
        'density' => 'ultra-compact',
    ])->assertSessionHasErrors(['palette', 'font', 'density']);
});

it('forbids a non-super-admin from updating appearance settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->put('/console/settings/appearance', [
        'palette' => 'blue',
        'font' => 'inter',
        'density' => 'normal',
    ])->assertForbidden();
});
