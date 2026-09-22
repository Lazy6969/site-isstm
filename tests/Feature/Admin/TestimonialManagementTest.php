<?php

use App\Models\Testimonial;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing testimonials', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/temoignages')->assertForbidden();
});

it('lets an admin create a testimonial', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/temoignages', [
        'author_name' => 'Fanja Rakoto',
        'program' => 'Génie Informatique',
        'quote_fr' => "L'ISSTM m'a beaucoup apporté.",
        'display_order' => 5,
    ])->assertRedirect();

    $testimonial = Testimonial::latest('id')->first();
    expect($testimonial->author_name)->toBe('Fanja Rakoto');
    expect($testimonial->program)->toBe('Génie Informatique');
    expect($testimonial->display_order)->toBe(5);
});

it('lets an admin update a testimonial without touching its image when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $testimonial = Testimonial::factory()->create(['image_path' => 'images/etudiant/tanael.jpg']);

    $this->actingAs($admin)->put("/console/temoignages/{$testimonial->id}", [
        'author_name' => 'Nom modifié',
        'quote_fr' => $testimonial->quote_fr,
    ])->assertRedirect();

    expect($testimonial->refresh()->author_name)->toBe('Nom modifié');
    expect($testimonial->image_path)->toBe('images/etudiant/tanael.jpg');
});

it('replaces the uploaded image and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $testimonial = Testimonial::factory()->create(['image_path' => 'images/etudiant/tanael.jpg']);

    $this->actingAs($admin)->put("/console/temoignages/{$testimonial->id}", [
        'author_name' => $testimonial->author_name,
        'quote_fr' => $testimonial->quote_fr,
        'image' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($testimonial->refresh()->image_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(Testimonial::find($testimonial->id)->image_path)->not->toBe('images/etudiant/tanael.jpg');

    $this->actingAs($admin)->put("/console/temoignages/{$testimonial->id}", [
        'author_name' => $testimonial->author_name,
        'quote_fr' => $testimonial->quote_fr,
        'image' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('deletes a testimonial and its uploaded image', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $testimonial = Testimonial::factory()->create(['image_path' => 'storage/testimonials/old.jpg']);
    Storage::disk('public')->put('testimonials/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/temoignages/{$testimonial->id}")->assertRedirect();

    expect(Testimonial::find($testimonial->id))->toBeNull();
    Storage::disk('public')->assertMissing('testimonials/old.jpg');
});

it('shows all testimonials to the admin', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    Testimonial::factory()->count(3)->create();

    $this->actingAs($admin)->get('/console/temoignages')->assertInertia(fn ($page) => $page
        ->component('Admin/Temoignages/Index')
        ->has('testimonials', 3)
    );
});
