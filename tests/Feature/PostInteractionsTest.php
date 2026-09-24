<?php

use App\Models\Post;
use App\Models\PostReport;
use App\Models\User;
use App\Role;

it('toggles saving a post on and off', function () {
    $post = Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/communaute/{$post->id}/enregistrer")->assertRedirect();
    expect($post->savedBy()->where('users.id', $user->id)->exists())->toBeTrue();

    $this->actingAs($user)->post("/communaute/{$post->id}/enregistrer")->assertRedirect();
    expect($post->savedBy()->where('users.id', $user->id)->exists())->toBeFalse();
});

it('lists only the viewer\'s saved posts', function () {
    $post = Post::factory()->create();
    Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();
    $post->savedBy()->attach($user->id);

    $this->actingAs($user)->get('/communaute/enregistres')->assertInertia(fn ($page) => $page
        ->component('Communaute/Enregistres')
        ->has('posts.data', 1)
        ->where('posts.data.0.id', $post->id)
    );
});

it('hides a post from the viewer\'s own feed without affecting others', function () {
    $post = Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();
    $other = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/communaute/{$post->id}/masquer")->assertRedirect();

    $this->actingAs($user)->get('/communaute')->assertInertia(fn ($page) => $page->has('posts.data', 0));
    $this->actingAs($other)->get('/communaute')->assertInertia(fn ($page) => $page->has('posts.data', 1));
});

it('records a report and does not duplicate it on a second report from the same user', function () {
    $post = Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/communaute/{$post->id}/signaler", ['reason' => 'Contenu inapproprié'])->assertRedirect();
    $this->actingAs($user)->post("/communaute/{$post->id}/signaler", ['reason' => 'Toujours un problème'])->assertRedirect();

    expect(PostReport::query()->where('post_id', $post->id)->where('reporter_id', $user->id)->count())->toBe(1);
    expect(PostReport::query()->where('post_id', $post->id)->sole()->reason)->toBe('Toujours un problème');
});

it('lets a teacher share a post to their own feed but forbids a student from sharing', function () {
    $original = Post::factory()->create();
    $teacher = User::factory()->role(Role::Enseignant)->create();
    $student = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($teacher)->post('/communaute', ['type' => 'autre', 'shared_post_id' => $original->id])->assertRedirect();
    $share = Post::query()->where('shared_post_id', $original->id)->sole();
    expect($share->user_id)->toBe($teacher->id);

    $this->actingAs($student)->post('/communaute', ['type' => 'autre', 'shared_post_id' => $original->id])->assertForbidden();
});

it('shows a single post permalink page with its shared post nested', function () {
    $original = Post::factory()->create(['body' => 'Publication originale']);
    $sharer = User::factory()->role(Role::Enseignant)->create();
    $share = Post::factory()->for($sharer)->create(['shared_post_id' => $original->id, 'body' => null]);
    $viewer = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($viewer)->get("/communaute/{$share->id}")->assertInertia(fn ($page) => $page
        ->component('Communaute/Show')
        ->where('post.id', $share->id)
        ->where('post.shared_post.id', $original->id)
        ->where('post.shared_post.body', 'Publication originale')
    );
});

it('breaks reaction counts down by type including the newer emoji reactions', function () {
    $post = Post::factory()->create();
    $user = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($user)->post("/communaute/{$post->id}/reaction", ['type' => 'haha'])->assertRedirect();

    $this->actingAs($user)->get('/communaute')->assertInertia(fn ($page) => $page
        ->where('posts.data.0.reactions.haha', 1)
        ->where('posts.data.0.my_reaction', 'haha')
    );
});
