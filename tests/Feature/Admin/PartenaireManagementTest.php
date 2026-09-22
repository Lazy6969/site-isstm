<?php

use App\Models\Partenaire;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing partenaires', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/partenaires')->assertForbidden();
});

it('lets an admin create a partenaire', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/partenaires', [
        'nom' => 'Université de Test',
        'site_url' => 'https://example.com',
        'display_order' => 3,
    ])->assertRedirect();

    $partenaire = Partenaire::latest('id')->first();
    expect($partenaire->nom)->toBe('Université de Test');
    expect($partenaire->site_url)->toBe('https://example.com');
    expect($partenaire->display_order)->toBe(3);
});

it('lets an admin update a partenaire without touching its logo when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $partenaire = Partenaire::factory()->create(['logo_path' => 'images/partenariat/laval.png']);

    $this->actingAs($admin)->put("/console/partenaires/{$partenaire->id}", [
        'nom' => 'Nom modifié',
    ])->assertRedirect();

    expect($partenaire->refresh()->nom)->toBe('Nom modifié');
    expect($partenaire->logo_path)->toBe('images/partenariat/laval.png');
});

it('replaces the uploaded logo and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $partenaire = Partenaire::factory()->create(['logo_path' => 'images/partenariat/laval.png']);

    $this->actingAs($admin)->put("/console/partenaires/{$partenaire->id}", [
        'nom' => $partenaire->nom,
        'logo' => UploadedFile::fake()->image('premier.jpg'),
    ]);
    $firstPath = str($partenaire->refresh()->logo_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(Partenaire::find($partenaire->id)->logo_path)->not->toBe('images/partenariat/laval.png');

    $this->actingAs($admin)->put("/console/partenaires/{$partenaire->id}", [
        'nom' => $partenaire->nom,
        'logo' => UploadedFile::fake()->image('second.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('deletes a partenaire and its uploaded logo', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $partenaire = Partenaire::factory()->create(['logo_path' => 'storage/partenaires/old.jpg']);
    Storage::disk('public')->put('partenaires/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/partenaires/{$partenaire->id}")->assertRedirect();

    expect(Partenaire::find($partenaire->id))->toBeNull();
    Storage::disk('public')->assertMissing('partenaires/old.jpg');
});

it('shows all partenaires to the admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Partenaire::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/partenaires')->assertInertia(fn ($page) => $page
        ->component('Admin/Partenaires/Index')
        ->has('partenaires', 3)
    );
});
