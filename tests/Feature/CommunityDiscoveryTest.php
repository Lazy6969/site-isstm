<?php

use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\PostVisibility;
use App\Role;

it('lists only video media from posts the viewer can see, on the Reels feed', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $stranger = User::factory()->role(Role::Etudiant)->create();

    $visiblePost = Post::factory()->create(['user_id' => $user->id, 'visibility' => PostVisibility::Public]);
    PostMedia::create(['post_id' => $visiblePost->id, 'path' => 'communaute/clip.mp4', 'type' => 'video', 'display_order' => 0]);
    PostMedia::create(['post_id' => $visiblePost->id, 'path' => 'communaute/photo.jpg', 'type' => 'image', 'display_order' => 1]);

    $privatePost = Post::factory()->create(['user_id' => $stranger->id, 'visibility' => PostVisibility::Amis]);
    PostMedia::create(['post_id' => $privatePost->id, 'path' => 'communaute/hidden.mp4', 'type' => 'video', 'display_order' => 0]);

    $this->actingAs($user)->get('/communaute/reels')->assertInertia(fn ($page) => $page
        ->component('Communaute/Reels')
        ->has('videos.data', 1)
        ->where('videos.data.0.path', 'communaute/clip.mp4')
        ->where('videos.data.0.post.id', $visiblePost->id)
    );
});

it('returns the viewer\'s own posts from this day in a previous year as souvenirs', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    $today = Post::factory()->create(['user_id' => $user->id, 'body' => 'Publication du jour']);

    $lastYear = Post::factory()->create(['user_id' => $user->id, 'body' => 'Souvenir']);
    Post::whereKey($lastYear->id)->update(['created_at' => now()->subYear()]);

    $otherDay = Post::factory()->create(['user_id' => $user->id, 'body' => 'Autre jour']);
    Post::whereKey($otherDay->id)->update(['created_at' => now()->subYear()->subMonth()]);

    $someoneElses = Post::factory()->create(['body' => 'Pas le mien']);
    Post::whereKey($someoneElses->id)->update(['created_at' => now()->subYear()]);

    $response = $this->actingAs($user)->getJson('/communaute/souvenirs');

    $response->assertOk();
    $memories = $response->json('memories');
    expect($memories)->toHaveCount(1);
    expect($memories[0]['id'])->toBe($lastYear->id);
    expect($memories[0]['years_ago'])->toBe(1);
});

it('tells the admin plainly when there is nothing to remember today', function () {
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->getJson('/communaute/souvenirs')->assertOk()->assertJson(['memories' => []]);
});

it('surfaces friend suggestions on the community feed sidebar', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    User::factory()->count(3)->create(['role' => Role::Etudiant]);

    $this->actingAs($user)->get('/communaute')->assertInertia(fn ($page) => $page
        ->component('Communaute/Index')
        ->has('suggestions')
    );
});
