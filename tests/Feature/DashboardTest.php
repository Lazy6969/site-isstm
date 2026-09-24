<?php

use App\Models\ClassGroup;
use App\Models\ClassGroupMember;
use App\Models\Comment;
use App\Models\FriendRequest;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\Story;
use App\Models\User;
use App\Role;

it('shows the signed-in users own activity and reach on their dashboard', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $friend = User::factory()->role(Role::Etudiant)->create();
    FriendRequest::factory()->accepted()->create(['sender_id' => $user->id, 'recipient_id' => $friend->id]);

    $group = ClassGroup::factory()->create();
    ClassGroupMember::factory()->for($group, 'classGroup')->create(['user_id' => $user->id]);

    $post = Post::factory()->for($user)->create();
    $post->viewedBy()->attach($friend->id);
    Reaction::create(['post_id' => $post->id, 'user_id' => $friend->id, 'type' => 'like']);
    Comment::factory()->for($post)->create();

    $story = Story::factory()->for($user)->create();
    $story->viewedBy()->attach($friend->id);

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->component('Dashboard/Index')
        ->where('stats.posts_count', 1)
        ->where('stats.post_views_count', 1)
        ->where('stats.reactions_received', 1)
        ->where('stats.comments_received', 1)
        ->where('stats.stories_count', 1)
        ->where('stats.story_views_count', 1)
        ->where('stats.friends_count', 1)
        ->where('stats.groups_count', 1)
    );
});

it('does not count another users posts or stories on the dashboard', function () {
    $user = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();
    Post::factory()->for($other)->create();
    Story::factory()->for($other)->create();

    $this->actingAs($user)->get('/tableau-de-bord')->assertInertia(fn ($page) => $page
        ->where('stats.posts_count', 0)
        ->where('stats.stories_count', 0)
    );
});
