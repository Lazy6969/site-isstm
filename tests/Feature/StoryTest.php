<?php

use App\Models\Story;
use App\Models\User;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('forbids a user without a community role from listing or publishing stories', function () {
    $user = User::factory()->role(Role::Materiel)->create();

    $this->actingAs($user)->get('/stories')->assertForbidden();
    $this->actingAs($user)->post('/stories', ['media' => UploadedFile::fake()->image('story.jpg')])->assertForbidden();
});

it('lets a student publish a story that expires in 24 hours', function () {
    Storage::fake('public');
    $student = User::factory()->role(Role::Etudiant)->create();

    $response = $this->actingAs($student)->post('/stories', [
        'media' => UploadedFile::fake()->image('story.jpg'),
        'caption' => 'Bonne rentrée !',
    ]);

    $response->assertRedirect();
    $story = Story::first();
    expect($story->user_id)->toBe($student->id)
        ->and($story->caption)->toBe('Bonne rentrée !')
        ->and($story->expires_at->diffInHours(now()))->toBeLessThanOrEqual(24);
    Storage::disk('public')->assertExists($story->media_path);
});

it('lets a student publish several stories', function () {
    Storage::fake('public');
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/stories', ['media' => UploadedFile::fake()->image('story1.jpg')]);
    $this->actingAs($student)->post('/stories', ['media' => UploadedFile::fake()->image('story2.jpg')]);

    expect(Story::where('user_id', $student->id)->count())->toBe(2);
});

it('only lists stories that have not expired yet, grouped by author', function () {
    $viewer = User::factory()->role(Role::Etudiant)->create();
    $author = User::factory()->role(Role::Etudiant)->create();
    Story::factory()->for($author)->create();
    Story::factory()->for($author)->expired()->create();

    $response = $this->actingAs($viewer)->getJson('/stories');

    $response->assertOk();
    $groups = $response->json('groups');
    expect($groups)->toHaveCount(1)
        ->and($groups[0]['user']['id'])->toBe($author->id)
        ->and($groups[0]['stories'])->toHaveCount(1);
});

it('lets the author delete their own story but not someone else\'s', function () {
    $author = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    $story = Story::factory()->for($author)->create();

    $this->actingAs($other)->delete("/stories/{$story->id}")->assertForbidden();
    $this->assertModelExists($story);

    $this->actingAs($author)->delete("/stories/{$story->id}")->assertRedirect();
    $this->assertModelMissing($story);
});

it('records a story view from another viewer but not from the author themselves', function () {
    $author = User::factory()->role(Role::Etudiant)->create();
    $viewer = User::factory()->role(Role::Etudiant)->create();
    $story = Story::factory()->for($author)->create();

    $this->actingAs($viewer)->postJson("/stories/{$story->id}/vue")->assertOk();
    $this->actingAs($author)->postJson("/stories/{$story->id}/vue")->assertOk();

    expect($story->viewedBy()->count())->toBe(1);
    expect($story->viewedBy()->first()->id)->toBe($viewer->id);
});

it('only exposes the story view count to its own author', function () {
    $author = User::factory()->role(Role::Etudiant)->create();
    $viewer = User::factory()->role(Role::Etudiant)->create();
    $story = Story::factory()->for($author)->create();
    $story->viewedBy()->attach($viewer->id);

    $asAuthor = $this->actingAs($author)->getJson('/stories')->json('groups');
    expect($asAuthor[0]['stories'][0]['views_count'])->toBe(1);

    $asViewer = $this->actingAs($viewer)->getJson('/stories')->json('groups');
    expect($asViewer[0]['stories'][0]['views_count'])->toBeNull();
});
