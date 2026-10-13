<?php

use App\Models\User;
use App\PermissionCatalog;
use App\Role;
use Spatie\Permission\Models\Role as SpatieRole;

it('gives students and teachers the community access they already had', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $teacher = User::factory()->role(Role::Enseignant)->create();

    foreach ([$student, $teacher] as $user) {
        $this->actingAs($user)->get('/communaute')->assertOk();
        $this->actingAs($user)->get('/amis')->assertOk();
        $this->actingAs($user)->get('/groupes')->assertOk();
    }

    expect(SpatieRole::findByName('enseignant')->hasPermissionTo('groups.announce'))->toBeTrue()
        ->and(SpatieRole::findByName('etudiant')->hasPermissionTo('reinscription.submit'))->toBeTrue()
        ->and(SpatieRole::findByName('enseignant')->hasPermissionTo('reinscription.submit'))->toBeFalse();
});

it('blocks a role from the community pages once its permission is removed', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $student->syncRoles(['etudiant']);

    SpatieRole::findByName('etudiant')->revokePermissionTo('community.view');

    $this->actingAs($student)->get('/communaute')->assertForbidden();
    $this->actingAs($student)->get('/amis')->assertOk();
});

it('lets an account with only a legacy role keep its community access', function () {
    $student = User::factory()->role(Role::Etudiant)->create();
    $student->syncRoles([]);

    SpatieRole::findByName('etudiant')->revokePermissionTo('community.view');

    $this->actingAs($student)->get('/communaute')->assertOk();
});

it('gives scolarité the finer actions of the permissions it already held', function () {
    $scolarite = SpatieRole::findByName('scolarite');

    foreach (['etudiants.export', 'etudiants.pause', 'inscriptions.approve', 'preinscriptions.approve', 'reactivations.refuse'] as $permission) {
        expect($scolarite->hasPermissionTo($permission))->toBeTrue();
    }

    expect(SpatieRole::findByName('enseignant')->hasPermissionTo('etudiants.export'))->toBeFalse();
});

it('installs the catalog without duplicating or removing anything when run twice', function () {
    $before = SpatieRole::findByName('scolarite')->permissions()->count();

    PermissionCatalog::install();
    PermissionCatalog::install();

    expect(SpatieRole::findByName('scolarite')->permissions()->count())->toBe($before);
});
