<?php

use App\Models\FriendRequest;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('redirects guests to the login page', function () {
    $this->get('/profil')->assertRedirect('/login');
});

it('renders the edit form for an authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/profil')->assertOk();
});

it('updates the profile with valid data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/profil', [
        'name' => 'Nouveau Nom',
        'email' => $user->email,
        'city' => 'Mahajanga',
        'bio' => 'Étudiante en génie informatique.',
    ]);

    $response->assertSessionHasNoErrors();
    expect($user->fresh())
        ->name->toBe('Nouveau Nom')
        ->city->toBe('Mahajanga')
        ->bio->toBe('Étudiante en génie informatique.');
});

it('rejects an email already used by another account', function () {
    $existing = User::factory()->create();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/profil', [
        'name' => $user->name,
        'email' => $existing->email,
    ]);

    $response->assertSessionHasErrors('email');
});

it('shows a public profile without requiring authentication', function () {
    $user = User::factory()->create(['bio' => 'Passionnée de robotique.']);

    $this->get("/profil/{$user->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Show')
            ->where('profile.name', $user->name)
        );
});

it('lets a user upload a cover photo', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/profil', [
        'name' => $user->name,
        'email' => $user->email,
        'cover' => UploadedFile::fake()->image('couverture.jpg'),
    ]);

    $response->assertSessionHasNoErrors();
    $user->refresh();
    expect($user->cover_path)->not->toBeNull();
    Storage::disk('public')->assertExists($user->cover_path);
});

it('shows the public profile\'s friends count, posts and photos', function () {
    $user = User::factory()->create();
    $friend = User::factory()->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $user->id, 'recipient_id' => $friend->id]);

    $post = Post::factory()->for($user)->create(['body' => 'Ma première publication.']);
    PostMedia::create(['post_id' => $post->id, 'path' => 'communaute/photo.jpg', 'type' => 'image', 'display_order' => 0]);

    $this->get("/profil/{$user->id}")
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Show')
            ->where('friendsCount', 1)
            ->where('postsCount', 1)
            ->has('posts.data', 1)
            ->has('photos', 1)
            ->has('friendsPreview', 1)
        );
});

it('saves the extended profile fields (work, education, hometown, social handles)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch('/profil', [
        'name' => $user->name,
        'email' => $user->email,
        'profession' => 'Développeuse',
        'employer' => 'ISSTM Mahajanga',
        'education' => 'ISSTM',
        'hometown' => 'Moramanga',
        'instagram_handle' => 'moncompte',
    ]);

    $response->assertSessionHasNoErrors();
    expect($user->fresh())
        ->profession->toBe('Développeuse')
        ->employer->toBe('ISSTM Mahajanga')
        ->education->toBe('ISSTM')
        ->hometown->toBe('Moramanga')
        ->instagram_handle->toBe('moncompte');
});

it('hides a friends-only post from a profile visitor who is not a friend', function () {
    $owner = User::factory()->create();
    $friend = User::factory()->create();
    $stranger = User::factory()->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $owner->id, 'recipient_id' => $friend->id]);

    Post::factory()->for($owner)->create(['visibility' => 'amis', 'body' => 'Réservé aux amis']);

    // Guest first: actingAs() persists across requests within a single test,
    // so an unauthenticated assertion must run before any actingAs() call.
    $this->get("/profil/{$owner->id}")->assertInertia(fn ($page) => $page->has('posts.data', 0));
    $this->actingAs($stranger)->get("/profil/{$owner->id}")->assertInertia(fn ($page) => $page->has('posts.data', 0));
    $this->actingAs($friend)->get("/profil/{$owner->id}")->assertInertia(fn ($page) => $page->has('posts.data', 1));
});
