<?php

use App\Models\AccessKey;
use App\Models\User;

function departmentUrl(string $subdomain, string $path): string
{
    $host = parse_url(config('app.url'), PHP_URL_HOST);

    return "http://{$subdomain}.{$host}{$path}";
}

it('never lets a guest reach the dashboard directly', function () {
    $this->get(departmentUrl('scolarite', '/dashboard'))
        ->assertRedirect(departmentUrl('scolarite', '/login'));
});

it('logs a department user in with the right password and an active access key', function () {
    $user = User::factory()->create();
    $user->assignRole('scolarite');

    $accessKey = AccessKey::factory()->create(['role' => 'scolarite']);
    $plainKey = $accessKey->generateKey();

    $response = $this->post(departmentUrl('scolarite', '/login'), [
        'email' => $user->email,
        'password' => 'password',
        'access_key' => $plainKey,
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(departmentUrl('scolarite', '/dashboard'));
});

it('rejects a valid password with the wrong access key', function () {
    $user = User::factory()->create();
    $user->assignRole('scolarite');

    $accessKey = AccessKey::factory()->create(['role' => 'scolarite']);
    $accessKey->generateKey();

    $response = $this->from(departmentUrl('scolarite', '/login'))->post(departmentUrl('scolarite', '/login'), [
        'email' => $user->email,
        'password' => 'password',
        'access_key' => 'wrong-key',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('access_key');
});

it('immediately locks out an already logged-in user once the Super Admin disables the access key', function () {
    $user = User::factory()->create();
    $user->assignRole('scolarite');

    $accessKey = AccessKey::factory()->create(['role' => 'scolarite']);
    $plainKey = $accessKey->generateKey();

    $this->post(departmentUrl('scolarite', '/login'), [
        'email' => $user->email,
        'password' => 'password',
        'access_key' => $plainKey,
    ]);

    $this->get(departmentUrl('scolarite', '/dashboard'))->assertOk();

    $accessKey->update(['is_active' => false]);

    $response = $this->get(departmentUrl('scolarite', '/dashboard'));

    $response->assertRedirect(departmentUrl('scolarite', '/login'));
    $response->assertSessionHasErrors(['email' => "Votre clé d'accès est actuellement désactivée. Veuillez contacter le Super Administrateur."]);
    $this->assertGuest();

    $accessKey->update(['is_active' => true]);

    $this->post(departmentUrl('scolarite', '/login'), [
        'email' => $user->email,
        'password' => 'password',
        'access_key' => $plainKey,
    ]);

    $this->get(departmentUrl('scolarite', '/dashboard'))->assertOk();
});

it('refuses a user without the department role even with a valid access key', function () {
    $user = User::factory()->create();
    $user->assignRole('enseignant');

    $accessKey = AccessKey::factory()->create(['role' => 'scolarite']);
    $plainKey = $accessKey->generateKey();

    $response = $this->post(departmentUrl('scolarite', '/login'), [
        'email' => $user->email,
        'password' => 'password',
        'access_key' => $plainKey,
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

it('redirects to the department login instead of a bare 403 when an unrelated logged-in session hits the subdomain', function () {
    // Session cookies are shared across the main domain and every department
    // subdomain (SESSION_DOMAIN=.site-isstm.test), so a user authenticated
    // elsewhere (e.g. as etudiant) can reach a department's routes without
    // ever seeing its login form.
    $user = User::factory()->create();
    $user->assignRole('etudiant');

    $response = $this->actingAs($user)->get(departmentUrl('scolarite', '/dashboard'));

    $response->assertRedirect(departmentUrl('scolarite', '/login'));
    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});
