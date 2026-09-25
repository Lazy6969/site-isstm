<?php

use App\Models\CampusBloc;
use App\Models\GalleryAlbum;
use App\Models\GalleryPhoto;
use App\Models\NewsArticle;
use App\Models\User;
use App\Role;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from viewing the corbeille', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/corbeille')->assertForbidden();
});

it('lists soft-deleted items with a human label and lets an admin restore one', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['title' => 'Article archivé par erreur']);
    $article->delete();

    $index = $this->actingAs($admin)->get('/console/corbeille');
    $index->assertInertia(fn ($page) => $page
        ->has('items', 1)
        ->where('items.0.type', 'actualites')
        ->where('items.0.title', 'Article archivé par erreur'));

    $this->actingAs($admin)->post("/console/corbeille/actualites/{$article->id}/restaurer")->assertRedirect();

    expect(NewsArticle::find($article->id))->not->toBeNull();
});

it('permanently deletes an item and its uploaded file from the corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('news/old.jpg', 'fake');
    $article = NewsArticle::factory()->create(['image_path' => 'storage/news/old.jpg']);
    $article->delete();

    $this->actingAs($admin)->delete("/console/corbeille/actualites/{$article->id}")->assertRedirect();

    expect(NewsArticle::onlyTrashed()->find($article->id))->toBeNull();
    Storage::disk('public')->assertMissing('news/old.jpg');
});

it('restores a gallery album together with its photos', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create();
    $photo = GalleryPhoto::factory()->create(['gallery_album_id' => $album->id]);
    $this->actingAs($admin)->delete("/console/galerie/{$album->id}");

    $this->actingAs($admin)->post("/console/corbeille/albums-galerie/{$album->id}/restaurer")->assertRedirect();

    expect(GalleryAlbum::find($album->id))->not->toBeNull();
    expect(GalleryPhoto::find($photo->id))->not->toBeNull();
});

it('permanently deletes a gallery album together with its photos and their files', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('galerie/cover.jpg', 'fake');
    Storage::disk('public')->put('galerie/photo.jpg', 'fake');
    $album = GalleryAlbum::factory()->create(['cover_image' => 'storage/galerie/cover.jpg']);
    $photo = GalleryPhoto::factory()->create(['gallery_album_id' => $album->id, 'image_path' => 'storage/galerie/photo.jpg']);
    $this->actingAs($admin)->delete("/console/galerie/{$album->id}");

    $this->actingAs($admin)->delete("/console/corbeille/albums-galerie/{$album->id}")->assertRedirect();

    expect(GalleryAlbum::onlyTrashed()->find($album->id))->toBeNull();
    expect(GalleryPhoto::onlyTrashed()->find($photo->id))->toBeNull();
    Storage::disk('public')->assertMissing('galerie/cover.jpg');
    Storage::disk('public')->assertMissing('galerie/photo.jpg');
});

it('permanently deletes every image of a campus bloc, which keeps an array of paths', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    Storage::disk('public')->put('campus/a.jpg', 'fake');
    Storage::disk('public')->put('campus/b.jpg', 'fake');
    $bloc = CampusBloc::factory()->create(['images' => ['storage/campus/a.jpg', 'storage/campus/b.jpg']]);
    $this->actingAs($admin)->delete("/console/campus/{$bloc->id}");

    $this->actingAs($admin)->delete("/console/corbeille/campus/{$bloc->id}")->assertRedirect();

    Storage::disk('public')->assertMissing('campus/a.jpg');
    Storage::disk('public')->assertMissing('campus/b.jpg');
});

it('only shows and allows acting on trashed items a scolarité account has permission for', function () {
    Storage::fake('public');
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');
    $article = NewsArticle::factory()->create();
    $article->delete();

    $this->actingAs($scolarite)->get('/console/corbeille')
        ->assertInertia(fn ($page) => $page->has('items', 0));

    $this->actingAs($scolarite)->post("/console/corbeille/actualites/{$article->id}/restaurer")->assertForbidden();
});
