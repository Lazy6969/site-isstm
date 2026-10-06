<?php

use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

/**
 * One login form for every kind of account; only the landing page differs.
 */
function loginAs(User $user)
{
    return test()->post('/login', ['email' => $user->email, 'password' => 'password']);
}

it('sends the super admin to the console dashboard', function () {
    $user = User::factory()->role(Role::Admin)->create();

    loginAs($user)->assertRedirect(route('admin.dashboard'));
    $this->assertAuthenticatedAs($user);
});

it('sends a scolarité account to the students workspace', function () {
    $user = User::factory()->create();
    $user->assignRole('scolarite');

    loginAs($user)->assertRedirect(route('admin.scolarite.etudiants.index'));
});

it('sends a teacher to the personal dashboard', function () {
    $user = User::factory()->role(Role::Enseignant)->create();

    loginAs($user)->assertRedirect(route('dashboard.index'));
});

it('sends a student to the community feed', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    loginAs($user)->assertRedirect(route('posts.index'));
});

it('sends a materiel account to the admin dashboard it is allowed to open', function () {
    $user = User::factory()->create();
    $user->assignRole('responsable-materiel');

    loginAs($user)->assertRedirect(route('admin.dashboard'));
    $this->actingAs($user)->get(route('admin.dashboard'))->assertOk();
});

it('never gives a 403 on the landing page of a staff account', function () {
    $enseignant = User::factory()->create();
    $enseignant->assignRole('enseignant');
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');

    $this->actingAs($enseignant)->get(route('dashboard.index'))->assertOk();
    $this->actingAs($enseignant)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($scolarite)->get(route('admin.scolarite.etudiants.index'))->assertOk();
});

it('still refuses admin pages a staff role was not given', function () {
    $enseignant = User::factory()->create();
    $enseignant->assignRole('enseignant');

    $this->actingAs($enseignant)->get(route('admin.users.index'))->assertForbidden();
});

it('sends any other account to the public homepage', function () {
    $user = User::factory()->create();

    loginAs($user)->assertRedirect(route('home'));
});

it('keeps each account on its own credentials', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->post('/login', ['email' => $admin->email, 'password' => 'mauvais'])->assertSessionHasErrors('email');
    $this->assertGuest();

    loginAs($etudiant)->assertRedirect(route('posts.index'));
    $this->assertAuthenticatedAs($etudiant);
});

it('returns an already signed-in account to its own landing page from the login screen', function () {
    $this->actingAs(User::factory()->role(Role::Admin)->create())->get('/login')->assertRedirect(route('admin.dashboard'));
    $this->actingAs(User::factory()->role(Role::Etudiant)->create())->get('/login')->assertRedirect(route('posts.index'));
});

it('no longer has department subdomain logins or access keys', function () {
    expect(Route::has('scolarite.login'))->toBeFalse()
        ->and(Route::has('admin.access-keys.index'))->toBeFalse()
        ->and(Schema::hasTable('access_keys'))->toBeFalse();
});
