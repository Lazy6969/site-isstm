<?php

use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * The admin edits their profile from a drawer over the current page: the
 * form posts (method-spoofed PATCH, multipart for the photo) and the server
 * redirects back, so nobody navigates away.
 */
it('updates the profile and photo from the drawer and returns to the same page', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create(['name' => 'Ancien Nom']);

    $this->actingAs($admin)
        ->from('/console/dashboard')
        ->post('/profil', [
            '_method' => 'patch',
            'name' => 'Nouveau Nom',
            'email' => $admin->email,
            'phone' => '0340000000',
            'city' => 'Mahajanga',
            'bio' => 'Administrateur de la plateforme',
            'avatar' => UploadedFile::fake()->image('moi.jpg'),
        ])
        ->assertRedirect('/console/dashboard')
        ->assertSessionHasNoErrors();

    $admin->refresh();

    expect($admin->name)->toBe('Nouveau Nom')
        ->and($admin->city)->toBe('Mahajanga')
        ->and($admin->avatar_path)->not->toBeNull();
    Storage::disk('public')->assertExists($admin->avatar_path);
});

it('rejects an e-mail already used by another account', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $other = User::factory()->create();

    $this->actingAs($admin)->from('/console/dashboard')
        ->post('/profil', ['_method' => 'patch', 'name' => $admin->name, 'email' => $other->email])
        ->assertSessionHasErrors('email');
});

it('changes the password from the drawer only with the current one', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->from('/console/dashboard')
        ->put('/profil/mot-de-passe', ['current_password' => 'mauvais', 'password' => 'Nouveau2026x', 'password_confirmation' => 'Nouveau2026x'])
        ->assertSessionHasErrors('current_password');

    $this->actingAs($admin)->from('/console/dashboard')
        ->put('/profil/mot-de-passe', ['current_password' => 'password', 'password' => 'Nouveau2026x', 'password_confirmation' => 'Nouveau2026x'])
        ->assertRedirect('/console/dashboard')
        ->assertSessionHasNoErrors();

    expect(Hash::check('Nouveau2026x', $admin->fresh()->password))->toBeTrue();
});
