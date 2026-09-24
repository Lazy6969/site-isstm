<?php

use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Hash;

it('redirects guests to the login page', function () {
    $this->put('/profil/mot-de-passe', [])->assertRedirect('/login');
});

it('updates the password for any account type when the current password is correct', function () {
    $user = User::factory()->role(Role::User)->create(['password' => Hash::make('AncienMdp1')]);

    $this->actingAs($user)->put('/profil/mot-de-passe', [
        'current_password' => 'AncienMdp1',
        'password' => 'NouveauMdp2',
        'password_confirmation' => 'NouveauMdp2',
    ])->assertSessionHasNoErrors()->assertRedirect();

    expect(Hash::check('NouveauMdp2', $user->fresh()->password))->toBeTrue();
});

it('rejects the wrong current password', function () {
    $user = User::factory()->create(['password' => Hash::make('AncienMdp1')]);

    $this->actingAs($user)->put('/profil/mot-de-passe', [
        'current_password' => 'MauvaisMdp1',
        'password' => 'NouveauMdp2',
        'password_confirmation' => 'NouveauMdp2',
    ])->assertSessionHasErrors('current_password');

    expect(Hash::check('AncienMdp1', $user->fresh()->password))->toBeTrue();
});

it('rejects a new password that fails the complexity rules', function () {
    $user = User::factory()->create(['password' => Hash::make('AncienMdp1')]);

    $this->actingAs($user)->put('/profil/mot-de-passe', [
        'current_password' => 'AncienMdp1',
        'password' => 'simple',
        'password_confirmation' => 'simple',
    ])->assertSessionHasErrors('password');
});
