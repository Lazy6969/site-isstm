<?php

use App\Models\HeroSlide;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing hero slides', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/accueil')->assertForbidden();
});

it('lets an admin add a hero slide', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/accueil', [
        'image' => UploadedFile::fake()->image('slide.jpg'),
        'display_order' => 4,
    ])->assertRedirect();

    $slide = HeroSlide::latest('id')->first();
    expect($slide->display_order)->toBe(4);
    expect($slide->media_type)->toBe('image');
    Storage::disk('public')->assertExists(str($slide->image_path)->after('storage/')->toString());
});

it('lets an admin update a hero slide order without touching its image when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $slide = HeroSlide::factory()->create(['image_path' => 'images/slide1.jpg', 'display_order' => 1]);

    $this->actingAs($admin)->put("/console/accueil/{$slide->id}", [
        'display_order' => 9,
    ])->assertRedirect();

    expect($slide->refresh()->display_order)->toBe(9);
    expect($slide->image_path)->toBe('images/slide1.jpg');
});

it('replaces the uploaded image and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $slide = HeroSlide::factory()->create(['image_path' => 'images/slide1.jpg']);

    $this->actingAs($admin)->put("/console/accueil/{$slide->id}", [
        'image' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($slide->refresh()->image_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(HeroSlide::find($slide->id)->image_path)->not->toBe('images/slide1.jpg');

    $this->actingAs($admin)->put("/console/accueil/{$slide->id}", [
        'image' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('deletes a hero slide and its uploaded image', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $slide = HeroSlide::factory()->create(['image_path' => 'storage/hero/old.jpg']);
    Storage::disk('public')->put('hero/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/accueil/{$slide->id}")->assertRedirect();

    expect(HeroSlide::find($slide->id))->toBeNull();
    Storage::disk('public')->assertMissing('hero/old.jpg');
});

it('shows all hero slides to the admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    HeroSlide::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/accueil')->assertInertia(fn ($page) => $page
        ->component('Admin/HeroSlides/Index')
        ->has('heroSlides', 3)
    );
});
