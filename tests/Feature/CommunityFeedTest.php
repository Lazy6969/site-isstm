<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use App\Notifications\CommentReplied;
use App\Notifications\NewPostPublished;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

it('forbids a student from publishing a post', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/communaute', ['type' => 'autre', 'body' => 'Bonjour'])->assertForbidden();
});

it('lets a teacher publish a post with media and notifies the other community members', function () {
    Storage::fake('public');
    Notification::fake();

    $teacher = User::factory()->role(Role::Enseignant)->create();
    $student = User::factory()->role(Role::Etudiant)->create();
    $admin = User::factory()->role(Role::Admin)->create();
    $outsider = User::factory()->role(Role::Materiel)->create();

    $this->actingAs($teacher)->post('/communaute', [
        'type' => 'actualite',
        'body' => 'Réunion vendredi',
        'media' => [UploadedFile::fake()->image('photo.jpg')],
    ])->assertRedirect();

    $post = Post::query()->first();
    expect($post->body)->toBe('Réunion vendredi');
    expect($post->media)->toHaveCount(1);

    Notification::assertSentTo($student, NewPostPublished::class);
    Notification::assertSentTo($admin, NewPostPublished::class);
    Notification::assertNotSentTo($outsider, NewPostPublished::class);
    Notification::assertNotSentTo($teacher, NewPostPublished::class);
});

it('forbids another student from deleting someone elses post', function () {
    $author = User::factory()->role(Role::Enseignant)->create();
    $post = Post::factory()->for($author)->create();
    $other = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($other)->delete("/communaute/{$post->id}")->assertForbidden();
});

it('lets an admin delete any post', function () {
    $author = User::factory()->role(Role::Enseignant)->create();
    $post = Post::factory()->for($author)->create();
    $admin = User::factory()->role(Role::Admin)->create();

    $this->actingAs($admin)->delete("/communaute/{$post->id}")->assertRedirect();

    expect(Post::query()->find($post->id))->toBeNull();
});

it('notifies the parent comment author when someone replies', function () {
    Notification::fake();

    $post = Post::factory()->create();
    $commentAuthor = User::factory()->role(Role::Etudiant)->create();
    $comment = Comment::factory()->for($post)->for($commentAuthor)->create();
    $replier = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($replier)->post("/communaute/{$post->id}/commentaires", [
        'body' => 'Je suis d\'accord',
        'parent_id' => $comment->id,
    ])->assertRedirect();

    Notification::assertSentTo($commentAuthor, CommentReplied::class);
});

it('does not notify a user replying to their own comment', function () {
    Notification::fake();

    $post = Post::factory()->create();
    $author = User::factory()->role(Role::Etudiant)->create();
    $comment = Comment::factory()->for($post)->for($author)->create();

    $this->actingAs($author)->post("/communaute/{$post->id}/commentaires", [
        'body' => 'Je me réponds',
        'parent_id' => $comment->id,
    ])->assertRedirect();

    Notification::assertNothingSent();
});

it('toggles a reaction off when the same type is submitted twice', function () {
    $post = Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/communaute/{$post->id}/reaction", ['type' => 'like'])->assertRedirect();
    expect(Reaction::query()->where('post_id', $post->id)->where('user_id', $user->id)->exists())->toBeTrue();

    $this->actingAs($user)->post("/communaute/{$post->id}/reaction", ['type' => 'like'])->assertRedirect();
    expect(Reaction::query()->where('post_id', $post->id)->where('user_id', $user->id)->exists())->toBeFalse();
});

it('replaces an existing reaction with a different type', function () {
    $post = Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/communaute/{$post->id}/reaction", ['type' => 'like']);
    $this->actingAs($user)->post("/communaute/{$post->id}/reaction", ['type' => 'love']);

    $reaction = Reaction::query()->where('post_id', $post->id)->where('user_id', $user->id)->sole();
    expect($reaction->type->value)->toBe('love');
});
