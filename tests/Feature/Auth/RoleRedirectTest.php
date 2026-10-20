<?php

use App\Models\User;
use App\PermissionCatalog;
use App\Role;
use App\RoleHome;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

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

it('sends a teacher to the console dashboard their role allows, not to the community feed', function () {
    $user = User::factory()->role(Role::Enseignant)->create();

    loginAs($user)->assertRedirect(route('admin.dashboard'));
    $this->actingAs($user)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($user)->get(route('posts.index'))->assertOk();
});

it('keeps a teacher without the dashboard permission on the personal dashboard', function () {
    $user = User::factory()->role(Role::Enseignant)->create();
    $user->roles->first()->revokePermissionTo('dashboard.view');

    loginAs($user)->assertRedirect(route('dashboard.index'));
    $this->actingAs($user)->get(route('dashboard.index'))->assertOk();
});

it('sends a student to the community feed', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    loginAs($user)->assertRedirect(route('posts.index'));
});

it('sends a materiel account straight to its own dedicated Matériel page', function () {
    $user = User::factory()->create();
    $user->assignRole('responsable-materiel');

    loginAs($user)->assertRedirect(route('materiel.index'));
    $this->actingAs($user)->get(route('materiel.index'))->assertOk();
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

it('lands a scolarité account on a page it may open even when its role lacks the students permission', function () {
    $role = Spatie\Permission\Models\Role::findByName('scolarite');
    $role->revokePermissionTo('etudiants.view');
    $user = User::factory()->create();
    $user->assignRole('scolarite');

    $landing = RoleHome::for($user);

    expect($landing)->toBe(route('admin.preinscriptions.index'));
    loginAs($user)->assertRedirect(route('admin.preinscriptions.index'));
    $this->actingAs($user)->get($landing)->assertOk();
});

it('never sends a role without any admin permission to a forbidden page', function () {
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');
    $scolarite->roles->first()->syncPermissions([]);

    $materiel = User::factory()->create(['is_messagerie' => false]);
    $materiel->assignRole('responsable-materiel');
    $materiel->roles->first()->syncPermissions([]);

    loginAs($scolarite)->assertRedirect(route('home'));
    loginAs($materiel)->assertRedirect(route('home'));
});

it('sends a materiel account with staff messaging but no dashboard to the messaging page', function () {
    $user = User::factory()->create(['is_messagerie' => true]);
    $user->assignRole('responsable-materiel');
    $user->roles->first()->syncPermissions([]);

    loginAs($user)->assertRedirect(route('staff-messages.index'));
    $this->actingAs($user)->get(route('staff-messages.index'))->assertOk();
});

it('keeps students and teachers out of a 403 on a database that has not created the community permissions yet', function () {
    Permission::whereIn('name', PermissionCatalog::COMMUNITY)->delete();
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $student = User::factory()->role(Role::Etudiant)->create();
    $teacher = User::factory()->create();
    $teacher->assignRole('enseignant');

    loginAs($student)->assertRedirect(route('posts.index'));
    $this->actingAs($student)->get(route('posts.index'))->assertOk();
    $this->actingAs($teacher)->get(route('posts.index'))->assertOk();
    $this->actingAs($teacher)->get(route('class-groups.index'))->assertOk();
});
