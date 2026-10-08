<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Notifications\CommentReplied;
use App\Notifications\NewPostPublished;
use App\Role;

it('groups notifications by period on the dedicated page', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();

    $user->notify(new NewPostPublished($post));

    $this->actingAs($user)->get('/notifications')->assertInertia(fn ($page) => $page
        ->component('Notifications/Index')
        ->has('groups')
    );
});

it('returns the unread count and recent notifications for the bell dropdown', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));

    $response = $this->actingAs($user)->getJson('/notifications/recentes');

    $response->assertOk();
    expect($response->json('unread_count'))->toBe(1);
    expect($response->json('notifications'))->toHaveCount(1);
});

it('includes the post and comment ids for a comment-reply notification, for deep-linking', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $reply = Comment::factory()->for($post)->create();

    $user->notify(new CommentReplied($reply));

    $response = $this->actingAs($user)->getJson('/notifications/recentes');

    $response->assertOk();
    expect($response->json('notifications.0.post_id'))->toBe($post->id);
    expect($response->json('notifications.0.comment_id'))->toBe($reply->id);
});

it('marks a single notification as read', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));
    $notification = $user->notifications()->first();

    $this->actingAs($user)->post("/notifications/{$notification->id}/lu")->assertRedirect();

    expect($notification->refresh()->read_at)->not->toBeNull();
});

it('marks all notifications as read at once', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));
    $user->notify(new NewPostPublished($post));

    $this->actingAs($user)->post('/notifications/tout-lire')->assertRedirect();

    expect($user->unreadNotifications()->count())->toBe(0);
});

it('forbids reading another users notification', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $other->notify(new NewPostPublished($post));
    $notification = $other->notifications()->first();

    $this->actingAs($user)->post("/notifications/{$notification->id}/lu")->assertForbidden();
});

it('deletes a notification', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));
    $notification = $user->notifications()->first();

    $this->actingAs($user)->delete("/notifications/{$notification->id}")->assertRedirect();

    expect($user->notifications()->count())->toBe(0);
});

it('deletes a selection of notifications, leaving the rest untouched', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));
    $user->notify(new NewPostPublished($post));
    $user->notify(new NewPostPublished($post));
    $ids = $user->notifications()->pluck('id');

    $this->actingAs($user)->post('/notifications/supprimer', [
        'ids' => $ids->take(2)->all(),
    ])->assertRedirect();

    expect($user->notifications()->count())->toBe(1);
    expect($user->notifications()->first()->id)->toBe($ids->last());
});

it('refuses to delete a selection that includes another users notification', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));
    $other->notify(new NewPostPublished($post));

    $this->actingAs($user)->post('/notifications/supprimer', [
        'ids' => $other->notifications()->pluck('id')->all(),
    ])->assertRedirect();

    expect($other->notifications()->count())->toBe(1);
});

it('deletes every notification for the user at once', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    $post = Post::factory()->create();
    $user->notify(new NewPostPublished($post));
    $user->notify(new NewPostPublished($post));
    $other->notify(new NewPostPublished($post));

    $this->actingAs($user)->post('/notifications/tout-supprimer')->assertRedirect();

    expect($user->notifications()->count())->toBe(0);
    expect($other->notifications()->count())->toBe(1);
});

it('lets a staff account without a community role use the notification bell', function () {
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');
    $scolarite->notify(new NewPostPublished(Post::factory()->create()));

    $response = $this->actingAs($scolarite)->getJson('/notifications/recentes');

    $response->assertOk();
    expect($response->json('unread_count'))->toBe(1)
        ->and($response->json('notifications'))->toHaveCount(1);

    $this->actingAs($scolarite)->get('/notifications')->assertOk()->assertInertia(fn ($page) => $page->component('Notifications/Index'));
    $this->actingAs($scolarite)->postJson('/notifications/tout-lire')->assertOk();
    expect($scolarite->unreadNotifications()->count())->toBe(0);
});

it('keeps notifications private to their owner', function () {
    $owner = User::factory()->role(Role::Etudiant)->create();
    $owner->notify(new NewPostPublished(Post::factory()->create()));
    $other = User::factory()->create();
    $other->assignRole('scolarite');

    $notification = $owner->notifications()->first();

    $this->actingAs($other)->postJson("/notifications/{$notification->id}/lu")->assertForbidden();
    $this->actingAs($other)->delete("/notifications/{$notification->id}")->assertForbidden();
    expect($other->notifications()->count())->toBe(0)
        ->and($owner->unreadNotifications()->count())->toBe(1);
});

it('sends a signed-out visitor to the login page instead of the notifications', function () {
    $this->get('/notifications')->assertRedirect('/login');
    $this->getJson('/notifications/recentes')->assertUnauthorized();
});

it('lets a staff account delete one of its notifications or all of them from the bell', function () {
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');
    foreach (range(1, 3) as $_) {
        $scolarite->notify(new NewPostPublished(Post::factory()->create()));
    }
    $first = $scolarite->notifications()->first();

    $this->actingAs($scolarite)->delete("/notifications/{$first->id}")->assertRedirect();
    expect($scolarite->notifications()->count())->toBe(2)
        ->and($scolarite->unreadNotifications()->count())->toBe(2);

    $this->actingAs($scolarite)->post('/notifications/tout-supprimer')->assertRedirect();
    expect($scolarite->notifications()->count())->toBe(0);
});

it('only deletes the signed-in account\'s notifications when clearing all', function () {
    $scolarite = User::factory()->create();
    $scolarite->assignRole('scolarite');
    $other = User::factory()->role(Role::Etudiant)->create();
    $scolarite->notify(new NewPostPublished(Post::factory()->create()));
    $other->notify(new NewPostPublished(Post::factory()->create()));

    $this->actingAs($scolarite)->post('/notifications/tout-supprimer');

    expect($scolarite->notifications()->count())->toBe(0)
        ->and($other->notifications()->count())->toBe(1);
});
