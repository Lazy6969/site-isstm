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
        ->where('settings.chrome', 'default')
        ->where('settings.font', 'instrument-sans')
        ->where('settings.density', 'normal')
        ->where('settings.sitePrimary', 'navy')
        ->where('settings.siteAccent', 'gold')
        ->where('settings.siteMenu', 'default')
        ->where('settings.siteFooter', 'default')
        ->has('palettes', 7)
        ->has('chromes', 12)
        ->has('fonts', 8)
        ->has('sitePrimaries', 6)
        ->has('siteAccents', 6)
        ->has('siteMenus', 9)
        ->has('siteFooters', 9)
    );
});

it('lets the super admin update appearance settings', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/appearance', [
        'palette' => 'emerald',
        'chrome' => 'blue',
        'font' => 'inter',
        'density' => 'compact',
        'sitePrimary' => 'emerald',
        'siteAccent' => 'cyan',
        'siteMenu' => 'slate',
        'siteFooter' => 'black',
    ])->assertRedirect();

    expect(Setting::get('appearance.palette'))->toBe('emerald');
    expect(Setting::get('appearance.chrome'))->toBe('blue');
    expect(Setting::get('appearance.font'))->toBe('inter');
    expect(Setting::get('appearance.density'))->toBe('compact');
    expect(Setting::get('appearance.site_primary'))->toBe('emerald');
    expect(Setting::get('appearance.site_accent'))->toBe('cyan');
    expect(Setting::get('appearance.site_menu'))->toBe('slate');
    expect(Setting::get('appearance.site_footer'))->toBe('black');
});

it('lets the super admin pick the black chrome color', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/appearance', [
        'palette' => 'default',
        'chrome' => 'black',
        'font' => 'instrument-sans',
        'density' => 'normal',
        'sitePrimary' => 'navy',
        'siteAccent' => 'gold',
        'siteMenu' => 'default',
        'siteFooter' => 'default',
    ])->assertRedirect();

    expect(Setting::get('appearance.chrome'))->toBe('black');
});

it('rejects an invalid palette, chrome color, font, density, site primary, site accent, site menu, or site footer color', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->put('/console/settings/appearance', [
        'palette' => 'neon',
        'chrome' => 'neon',
        'font' => 'comic-sans',
        'density' => 'ultra-compact',
        'sitePrimary' => 'neon',
        'siteAccent' => 'neon',
        'siteMenu' => 'neon',
        'siteFooter' => 'neon',
    ])->assertSessionHasErrors(['palette', 'chrome', 'font', 'density', 'sitePrimary', 'siteAccent', 'siteMenu', 'siteFooter']);
});

it('forbids a non-super-admin from updating appearance settings', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->put('/console/settings/appearance', [
        'palette' => 'blue',
        'chrome' => 'blue',
        'font' => 'inter',
        'density' => 'normal',
        'sitePrimary' => 'navy',
        'siteAccent' => 'gold',
        'siteMenu' => 'default',
        'siteFooter' => 'default',
    ])->assertForbidden();
});
