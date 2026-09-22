<?php

use App\Models\Filiere;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing filieres', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/filieres')->assertForbidden();
});

it('lets an admin create a filiere with an auto-generated unique slug', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Filiere::factory()->create(['nom_fr' => 'Informatique', 'slug' => 'informatique']);

    $this->actingAs($admin)->post('/console/filieres', [
        'nom_fr' => 'Informatique',
    ])->assertRedirect();

    $filiere = Filiere::latest('id')->first();
    expect($filiere->slug)->toBe('informatique-1');
});

it('lets an admin update a filiere without touching its image when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['image_path' => 'images/logo-isstm.jpg']);

    $this->actingAs($admin)->put("/console/filieres/{$filiere->id}", [
        'nom_fr' => 'Nom modifié',
    ])->assertRedirect();

    expect($filiere->refresh()->nom_fr)->toBe('Nom modifié');
    expect($filiere->image_path)->toBe('images/logo-isstm.jpg');
});

it('keeps the existing slug when updating a filiere', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['nom_fr' => 'Original', 'slug' => 'original']);

    $this->actingAs($admin)->put("/console/filieres/{$filiere->id}", [
        'nom_fr' => 'Nom totalement différent',
    ])->assertRedirect();

    expect($filiere->refresh()->slug)->toBe('original');
});

it('replaces the uploaded image and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['image_path' => 'images/logo-isstm.jpg']);

    $this->actingAs($admin)->put("/console/filieres/{$filiere->id}", [
        'nom_fr' => $filiere->nom_fr,
        'image' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($filiere->refresh()->image_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(Filiere::find($filiere->id)->image_path)->not->toBe('images/logo-isstm.jpg');

    $this->actingAs($admin)->put("/console/filieres/{$filiere->id}", [
        'nom_fr' => $filiere->nom_fr,
        'image' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('deletes a filiere and its uploaded image', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $filiere = Filiere::factory()->create(['image_path' => 'storage/filieres/old.jpg']);
    Storage::disk('public')->put('filieres/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/filieres/{$filiere->id}")->assertRedirect();

    expect(Filiere::find($filiere->id))->toBeNull();
    Storage::disk('public')->assertMissing('filieres/old.jpg');
});

it('shows all filieres to the admin ordered by display order', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Filiere::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/filieres')->assertInertia(fn ($page) => $page
        ->component('Admin/Filieres/Index')
        ->has('filieres', 3)
    );
});
