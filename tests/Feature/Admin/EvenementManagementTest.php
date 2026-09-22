<?php

use App\Models\Evenement;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing evenements', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/evenements')->assertForbidden();
});

it('lets an admin create an evenement', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/evenements', [
        'titre' => 'Journée portes ouvertes',
        'date_debut' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'categorie' => 'ceremonie',
    ])->assertRedirect();

    $evenement = Evenement::latest('id')->first();
    expect($evenement->titre)->toBe('Journée portes ouvertes');
    expect($evenement->categorie)->toBe('ceremonie');
});

it('rejects an end date before the start date', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/evenements', [
        'titre' => 'Atelier',
        'date_debut' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'date_fin' => now()->addDays(2)->format('Y-m-d H:i:s'),
        'categorie' => 'atelier',
    ])->assertSessionHasErrors('date_fin');
});

it('lets an admin update an evenement without touching its image when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $evenement = Evenement::factory()->create(['image_path' => 'images/evenement.jpg']);

    $this->actingAs($admin)->put("/console/evenements/{$evenement->id}", [
        'titre' => 'Titre modifié',
        'date_debut' => $evenement->date_debut->format('Y-m-d H:i:s'),
        'categorie' => $evenement->categorie,
    ])->assertRedirect();

    expect($evenement->refresh()->titre)->toBe('Titre modifié');
    expect($evenement->image_path)->toBe('images/evenement.jpg');
});

it('replaces the uploaded image and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $evenement = Evenement::factory()->create(['image_path' => 'images/evenement.jpg']);

    $this->actingAs($admin)->put("/console/evenements/{$evenement->id}", [
        'titre' => $evenement->titre,
        'date_debut' => $evenement->date_debut->format('Y-m-d H:i:s'),
        'categorie' => $evenement->categorie,
        'image' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($evenement->refresh()->image_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    expect(Evenement::find($evenement->id)->image_path)->not->toBe('images/evenement.jpg');

    $this->actingAs($admin)->put("/console/evenements/{$evenement->id}", [
        'titre' => $evenement->titre,
        'date_debut' => $evenement->date_debut->format('Y-m-d H:i:s'),
        'categorie' => $evenement->categorie,
        'image' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('deletes an evenement and its uploaded image', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $evenement = Evenement::factory()->create(['image_path' => 'storage/evenements/old.jpg']);
    Storage::disk('public')->put('evenements/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/evenements/{$evenement->id}")->assertRedirect();

    expect(Evenement::find($evenement->id))->toBeNull();
    Storage::disk('public')->assertMissing('evenements/old.jpg');
});

it('lists all evenements for the admin, including past ones', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Evenement::factory()->create(['date_debut' => now()->subDays(3)]);
    Evenement::factory()->create(['date_debut' => now()->addDays(3)]);

    $this->actingAs($admin)->get('/console/evenements')->assertInertia(fn ($page) => $page
        ->component('Admin/Evenements/Index')
        ->has('evenements', 2)
    );
});
