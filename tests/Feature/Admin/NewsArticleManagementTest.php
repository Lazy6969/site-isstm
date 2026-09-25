<?php

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\User;
use App\NewsStatus;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a non-admin from listing articles', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/actualites')->assertForbidden();
});

it('lets an admin create an article as a draft with an auto-generated unique slug', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    NewsArticle::factory()->create(['title' => 'Rentrée universitaire', 'slug' => 'rentree-universitaire']);

    $this->actingAs($admin)->post('/console/actualites', [
        'title' => 'Rentrée universitaire',
        'status' => 'brouillon',
    ])->assertRedirect();

    $article = NewsArticle::latest('id')->first();
    expect($article->slug)->toBe('rentree-universitaire-1');
    expect($article->status)->toBe(NewsStatus::Brouillon);
    expect($article->published_at)->toBeNull();
});

it('stamps published_at when creating an article as published', function () {
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->post('/console/actualites', [
        'title' => 'Nouvelle formation',
        'status' => 'publie',
    ]);

    $article = NewsArticle::latest('id')->first();
    expect($article->status)->toBe(NewsStatus::Publie);
    expect($article->published_at)->not->toBeNull();
});

it('lets an admin update an article without touching its image when none is uploaded', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['image_path' => 'images/slide1.jpg']);

    $this->actingAs($admin)->put("/console/actualites/{$article->id}", [
        'title' => 'Titre modifié',
        'status' => 'publie',
    ])->assertRedirect();

    expect($article->refresh()->title)->toBe('Titre modifié');
    expect($article->image_path)->toBe('images/slide1.jpg');
});

it('replaces the uploaded image and deletes the previous one, but never a bundled seed asset', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['image_path' => 'images/slide1.jpg']);

    $this->actingAs($admin)->put("/console/actualites/{$article->id}", [
        'title' => $article->title,
        'status' => 'brouillon',
        'image' => UploadedFile::fake()->image('premiere.jpg'),
    ]);
    $firstPath = str($article->refresh()->image_path)->after('storage/')->toString();
    Storage::disk('public')->assertExists($firstPath);
    // The original bundled asset must never be deleted.
    expect(NewsArticle::find($article->id)->image_path)->not->toBe('images/slide1.jpg');

    $this->actingAs($admin)->put("/console/actualites/{$article->id}", [
        'title' => $article->title,
        'status' => 'brouillon',
        'image' => UploadedFile::fake()->image('seconde.jpg'),
    ]);
    Storage::disk('public')->assertMissing($firstPath);
});

it('soft-deletes an article, keeping its image until it is purged from the Corbeille', function () {
    Storage::fake('public');
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['image_path' => 'storage/news/old.jpg']);
    Storage::disk('public')->put('news/old.jpg', 'fake');

    $this->actingAs($admin)->delete("/console/actualites/{$article->id}")->assertRedirect();

    expect(NewsArticle::find($article->id))->toBeNull();
    expect(NewsArticle::onlyTrashed()->find($article->id))->not->toBeNull();
    Storage::disk('public')->assertExists('news/old.jpg');
});

it('shows draft and published articles to the admin, unlike the public page', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $category = NewsCategory::create(['slug' => 'vie-campus', 'name_fr' => 'Vie de campus']);
    NewsArticle::factory()->create(['status' => NewsStatus::Brouillon, 'news_category_id' => $category->id]);
    NewsArticle::factory()->create(['status' => NewsStatus::Publie]);

    $this->actingAs($admin)->get('/console/actualites')->assertInertia(fn ($page) => $page
        ->component('Admin/Actualites/Index')
        ->has('articles', 2)
    );
});
