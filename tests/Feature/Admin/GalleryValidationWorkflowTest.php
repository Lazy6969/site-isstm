<?php

use App\GalleryStatus;
use App\Models\GalleryAlbum;
use App\Models\User;
use App\Role;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * No seeded role currently holds content-create permissions without also
 * holding gallery.publish — this ad-hoc role exercises the "editor" side of
 * the workflow without deciding which real role should get it.
 */
function createGalleryEditor(): User
{
    SpatieRole::findOrCreate('gallery-editor-test', 'web')
        ->syncPermissions(['gallery.view', 'gallery.create', 'gallery.edit']);

    $editor = User::factory()->create();
    $editor->assignRole('gallery-editor-test');

    return $editor;
}

it('downgrades a non-publisher\'s album straight to en_attente', function () {
    $editor = createGalleryEditor();

    $this->actingAs($editor)->post('/console/galerie', [
        'title' => 'Album soumis',
        'status' => 'publie',
    ])->assertRedirect();

    $album = GalleryAlbum::latest('id')->first();
    expect($album->status)->toBe(GalleryStatus::EnAttente);
    expect($album->published_at)->toBeNull();
});

it('lets a non-publisher save a plain draft album', function () {
    $editor = createGalleryEditor();

    $this->actingAs($editor)->post('/console/galerie', [
        'title' => 'Brouillon simple',
        'status' => 'brouillon',
    ])->assertRedirect();

    expect(GalleryAlbum::latest('id')->first()->status)->toBe(GalleryStatus::Brouillon);
});

it('lets a publisher approve a pending album', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create(['status' => GalleryStatus::EnAttente, 'published_at' => null]);

    $this->actingAs($admin)->post("/console/galerie/{$album->id}/approve")->assertRedirect();

    $album->refresh();
    expect($album->status)->toBe(GalleryStatus::Publie);
    expect($album->published_at)->not->toBeNull();
    expect($album->validated_by)->toBe($admin->id);
});

it('lets a publisher reject a pending album with a reason', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create(['status' => GalleryStatus::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/galerie/{$album->id}/reject", ['rejection_reason' => 'Photos de mauvaise qualité'])
        ->assertRedirect();

    $album->refresh();
    expect($album->status)->toBe(GalleryStatus::Rejete);
    expect($album->rejection_reason)->toBe('Photos de mauvaise qualité');
});

it('requires a reason to reject an album', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create(['status' => GalleryStatus::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/galerie/{$album->id}/reject", [])
        ->assertSessionHasErrors('rejection_reason');
});

it('forbids approving or rejecting an album without gallery.publish', function () {
    $editor = createGalleryEditor();
    $album = GalleryAlbum::factory()->create(['status' => GalleryStatus::EnAttente]);

    $this->actingAs($editor)->post("/console/galerie/{$album->id}/approve")->assertForbidden();
    $this->actingAs($editor)->post("/console/galerie/{$album->id}/reject", ['rejection_reason' => 'x'])->assertForbidden();
});

it('refuses to approve an album that is not pending', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $album = GalleryAlbum::factory()->create(['status' => GalleryStatus::Publie]);

    $this->actingAs($admin)->post("/console/galerie/{$album->id}/approve")->assertStatus(409);
});

it('never exposes a pending or rejected album on the public site', function () {
    $pending = GalleryAlbum::factory()->create(['status' => GalleryStatus::EnAttente]);
    $rejected = GalleryAlbum::factory()->create(['status' => GalleryStatus::Rejete]);

    $this->get('/galerie')->assertInertia(fn ($page) => $page->component('Galerie/Index')->has('albums', 0));
    $this->get("/galerie/{$pending->slug}")->assertNotFound();
    $this->get("/galerie/{$rejected->slug}")->assertNotFound();
});
