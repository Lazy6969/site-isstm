<?php

use App\Models\Setting;
use App\Models\User;
use App\Role;

it('serves the site normally when maintenance is off', function () {
    $this->get('/')->assertOk();
});

it('shows the maintenance page with a 503 status to a guest when maintenance is on', function () {
    Setting::set('maintenance.enabled', 'true');
    Setting::set('maintenance.template', 'indisponible');
    Setting::set('maintenance.title', 'Indisponible pour de vrai');
    Setting::set('maintenance.message', 'Revenez plus tard.');

    $this->get('/')
        ->assertStatus(503)
        ->assertSee('Indisponible pour de vrai')
        ->assertSee('Revenez plus tard.');
});

it('still lets a guest reach the login page during maintenance', function () {
    Setting::set('maintenance.enabled', 'true');

    $this->get('/login')->assertOk();
});

it('never blocks the admin who can turn maintenance back off', function () {
    Setting::set('maintenance.enabled', 'true');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->get('/')->assertOk();
});

it('still blocks a logged-in user without settings.manage during maintenance', function () {
    Setting::set('maintenance.enabled', 'true');
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/')->assertStatus(503);
});

it('lets a blocked visitor still reach the console login-protected area to sign in', function () {
    Setting::set('maintenance.enabled', 'true');

    // Not authenticated yet: the auth middleware on /console/dashboard redirects
    // to /login as usual — maintenance must not intercept that redirect target.
    $this->get('/console/dashboard')->assertRedirect('/login');
});
