<?php

use App\Models\GalleryAlbum;
use App\Models\GalleryPhoto;

it('lists only published albums with a photo count', function () {
    $album = GalleryAlbum::factory()->create(['status' => 'publie']);
    GalleryPhoto::factory()->count(2)->create(['gallery_album_id' => $album->id]);
    GalleryAlbum::factory()->create(['status' => 'brouillon']);

    $this->get('/galerie')->assertInertia(fn ($page) => $page
        ->component('Galerie/Index')
        ->has('albums', 1)
        ->where('albums.0.photos_count', 2)
    );
});

it('shows a published album with its photos', function () {
    $album = GalleryAlbum::factory()->create(['status' => 'publie']);
    GalleryPhoto::factory()->create(['gallery_album_id' => $album->id, 'title' => 'Une photo']);

    $this->get("/galerie/{$album->slug}")->assertInertia(fn ($page) => $page
        ->component('Galerie/Show')
        ->has('album.photos', 1)
        ->where('album.photos.0.title', 'Une photo')
    );
});

it('returns 404 for a draft album', function () {
    $album = GalleryAlbum::factory()->create(['status' => 'brouillon']);

    $this->get("/galerie/{$album->slug}")->assertNotFound();
});
