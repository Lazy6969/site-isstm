<?php

use App\Models\Comment;
use App\Models\FriendRequest;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use App\Notifications\CommentReplied;
use App\Notifications\NewPostPublished;
use App\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

it('lets a student publish a post', function () {
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($student)->post('/communaute', ['type' => 'autre', 'body' => 'Bonjour'])->assertRedirect();

    expect(Post::query()->where('user_id', $student->id)->exists())->toBeTrue();
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

it('lets a user reply to a reply and shows it nested in the feed', function () {
    $post = Post::factory()->create();
    $topLevelAuthor = User::factory()->role(Role::Etudiant)->create();
    $topLevel = Comment::factory()->for($post)->for($topLevelAuthor)->create();
    $replier = User::factory()->role(Role::Etudiant)->create();
    $reply = Comment::factory()->for($post)->for($replier)->create(['parent_id' => $topLevel->id]);
    $subReplier = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($subReplier)->post("/communaute/{$post->id}/commentaires", [
        'body' => 'Réponse à la réponse',
        'parent_id' => $reply->id,
    ])->assertRedirect();

    $this->actingAs($subReplier)->get('/communaute')->assertInertia(fn ($page) => $page
        ->where('posts.data.0.comments.0.replies.0.replies.0.body', 'Réponse à la réponse')
    );
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

it('records a view when a post permalink is visited, once per viewer', function () {
    $post = Post::factory()->create();
    $viewer = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($viewer)->get("/communaute/{$post->id}")->assertInertia(fn ($page) => $page
        ->where('post.views_count', 1)
    );

    $this->actingAs($viewer)->get("/communaute/{$post->id}");

    expect($post->viewedBy()->count())->toBe(1);

    $this->actingAs($viewer)->get('/communaute')->assertInertia(fn ($page) => $page
        ->where('posts.data.0.views_count', 1)
    );
});

it('lets the author edit their own comment and marks it edited', function () {
    $post = Post::factory()->create();
    $author = User::factory()->role(Role::Etudiant)->create();
    $comment = Comment::factory()->for($post)->for($author)->create(['body' => 'Texte original']);

    $this->actingAs($author)->patch("/commentaires/{$comment->id}", ['body' => 'Texte corrigé'])->assertRedirect();

    $comment->refresh();
    expect($comment->body)->toBe('Texte corrigé');
    expect($comment->edited_at)->not->toBeNull();
});

it('forbids editing someone elses comment', function () {
    $post = Post::factory()->create();
    $author = User::factory()->role(Role::Etudiant)->create();
    $comment = Comment::factory()->for($post)->for($author)->create();
    $other = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($other)->patch("/commentaires/{$comment->id}", ['body' => 'Piraté'])->assertForbidden();
});

it('saves the mood, location and tagged friends of a new post', function () {
    $author = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $stranger = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $author->id, 'recipient_id' => $friend->id]);

    $this->actingAs($author)->post('/communaute', [
        'type' => 'autre',
        'body' => 'Journée parfaite',
        'visibility' => 'amis',
        'mood' => '😊 Heureux(se)',
        'location' => 'Mahajanga, Madagascar',
        'tagged_user_ids' => [$friend->id, $stranger->id],
    ])->assertRedirect();

    $post = Post::query()->sole();
    expect($post->visibility->value)->toBe('amis');
    expect($post->mood)->toBe('😊 Heureux(se)');
    expect($post->location)->toBe('Mahajanga, Madagascar');
    expect($post->taggedUsers->pluck('id')->all())->toBe([$friend->id]);
});

it('hides a friends-only post from someone who is not a friend, but shows it to a friend', function () {
    $author = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    $stranger = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $author->id, 'recipient_id' => $friend->id]);

    Post::factory()->for($author)->create(['visibility' => 'amis', 'body' => 'Réservé aux amis']);

    $this->actingAs($stranger)->get('/communaute')->assertInertia(fn ($page) => $page->has('posts.data', 0));
    $this->actingAs($friend)->get('/communaute')->assertInertia(fn ($page) => $page->has('posts.data', 1));
    $this->actingAs($author)->get('/communaute')->assertInertia(fn ($page) => $page->has('posts.data', 1));
});
