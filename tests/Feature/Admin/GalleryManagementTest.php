<?php

use App\GalleryStatus;
use App\Models\GalleryAlbum;
use App\Models\GalleryPhoto;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing albums', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/galerie')->assertForbidden();
});

it('lets an admin create an album with a unique slug', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    GalleryAlbum::factory()->create(['title' => 'Journée portes ouvertes', 'slug' => 'journee-portes-ouvertes']);

    $this->actingAs($admin)->post('/console/galerie', [
        'title' => 'Journée portes ouvertes',
        'status' => 'brouillon',
    ])->assertRedirect();

    $album = GalleryAlbum::latest('id')->first();
    expect($album->slug)->toBe('journee-portes-ouvertes-1');
    expect($album->status)->toBe(GalleryStatus::Brouillon);
});

it('lets an admin upload a cover image and replace it, deleting the previous upload only', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create(['cover_image' => 'images/slide1.jpg']);

    $this->actingAs($admin)->put("/console/galerie/{$album->id}", [
        'title' => $album->title,
        'status' => 'brouillon',
        'cover_image' => UploadedFile::fake()->image('couverture.jpg'),
    ]);
    $firstPath = str($album->refresh()->cover_image)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);

    $this->actingAs($admin)->put("/console/galerie/{$album->id}", [
        'title' => $album->title,
        'status' => 'brouillon',
        'cover_image' => UploadedFile::fake()->image('nouvelle-couverture.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('lets an admin add photos to an album', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create();

    $this->actingAs($admin)->post("/console/galerie/{$album->id}/photos", [
        'photos' => [UploadedFile::fake()->image('photo1.jpg'), UploadedFile::fake()->image('photo2.jpg')],
    ])->assertRedirect();

    expect($album->photos()->count())->toBe(2);
    $album->photos->each(fn (GalleryPhoto $photo) => Storage::disk('public')->assertExists(str($photo->image_path)->after('storage/')->toString()));
});

it('soft-deletes a photo, keeping its file until it is purged from the Corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('galerie/photo.jpg', 'fake');
    $photo = GalleryPhoto::factory()->create(['image_path' => 'storage/galerie/photo.jpg']);

    $this->actingAs($admin)->delete("/console/galerie/photos/{$photo->id}")->assertRedirect();

    expect(GalleryPhoto::find($photo->id))->toBeNull();
    expect(GalleryPhoto::onlyTrashed()->find($photo->id))->not->toBeNull();
    Storage::disk('public')->assertExists('galerie/photo.jpg');
});

it('soft-deletes an album and all of its photos when destroyed, keeping their files until purged from the Corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create(['cover_image' => 'storage/galerie/cover.jpg']);
    Storage::disk('public')->put('galerie/cover.jpg', 'fake');
    Storage::disk('public')->put('galerie/photo.jpg', 'fake');
    $photo = GalleryPhoto::factory()->create(['gallery_album_id' => $album->id, 'image_path' => 'storage/galerie/photo.jpg']);

    $this->actingAs($admin)->delete("/console/galerie/{$album->id}")->assertRedirect();

    expect(GalleryAlbum::find($album->id))->toBeNull();
    expect(GalleryPhoto::find($photo->id))->toBeNull();
    expect(GalleryAlbum::onlyTrashed()->find($album->id))->not->toBeNull();
    expect(GalleryPhoto::onlyTrashed()->find($photo->id))->not->toBeNull();
    Storage::disk('public')->assertExists('galerie/cover.jpg');
    Storage::disk('public')->assertExists('galerie/photo.jpg');
});
