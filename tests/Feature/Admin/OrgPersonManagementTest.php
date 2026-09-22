<?php

use App\Models\OrgPerson;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing organigramme members', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/organigramme')->assertForbidden();
});

it('lets an admin update a member name without touching the photo when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $orgPerson = OrgPerson::factory()->create(['photo_path' => 'images/organigramme/directeur.jpg']);

    $this->actingAs($admin)->put("/console/organigramme/{$orgPerson->id}", [
        'name' => 'Nom modifié',
    ])->assertRedirect();

    expect($orgPerson->refresh()->name)->toBe('Nom modifié');
    expect($orgPerson->photo_path)->toBe('images/organigramme/directeur.jpg');
});

it('replaces the uploaded photo and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $orgPerson = OrgPerson::factory()->create(['photo_path' => 'images/organigramme/directeur.jpg']);

    $this->actingAs($admin)->put("/console/organigramme/{$orgPerson->id}", [
        'name' => $orgPerson->name,
        'photo' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($orgPerson->refresh()->photo_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(OrgPerson::find($orgPerson->id)->photo_path)->not->toBe('images/organigramme/directeur.jpg');

    $this->actingAs($admin)->put("/console/organigramme/{$orgPerson->id}", [
        'name' => $orgPerson->name,
        'photo' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('shows all organigramme members to the admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    OrgPerson::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/organigramme')->assertInertia(fn ($page) => $page
        ->component('Admin/Organigramme/Index')
        ->has('orgPeople', 3)
    );
});
