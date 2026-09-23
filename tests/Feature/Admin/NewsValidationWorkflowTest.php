<?php

use App\Models\NewsArticle;
use App\Models\User;
use App\NewsStatus;
use App\Role;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * No seeded role currently holds content-create permissions without also
 * holding news.publish — this ad-hoc role exercises the "editor" side of the
 * workflow without deciding which real role should get it.
 */
function createNewsEditor(): User
{
    SpatieRole::findOrCreate('news-editor-test', 'web')
        ->syncPermissions(['news.view', 'news.create', 'news.edit']);

    $editor = User::factory()->create();
    $editor->assignRole('news-editor-test');

    return $editor;
}

it('downgrades a non-publisher\'s article straight to en_attente', function () {
    $editor = createNewsEditor();

    $this->actingAs($editor)->post('/console/actualites', [
        'title' => 'Article soumis',
        'status' => 'publie',
    ])->assertRedirect();

    $article = NewsArticle::latest('id')->first();
    expect($article->status)->toBe(NewsStatus::EnAttente);
    expect($article->published_at)->toBeNull();
});

it('lets a non-publisher save a plain draft', function () {
    $editor = createNewsEditor();

    $this->actingAs($editor)->post('/console/actualites', [
        'title' => 'Brouillon simple',
        'status' => 'brouillon',
    ])->assertRedirect();

    expect(NewsArticle::latest('id')->first()->status)->toBe(NewsStatus::Brouillon);
});

it('lets a publisher approve a pending article', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['status' => NewsStatus::EnAttente, 'published_at' => null]);

    $this->actingAs($admin)->post("/console/actualites/{$article->id}/approve")->assertRedirect();

    $article->refresh();
    expect($article->status)->toBe(NewsStatus::Publie);
    expect($article->published_at)->not->toBeNull();
    expect($article->validated_by)->toBe($admin->id);
});

it('lets a publisher reject a pending article with a reason', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['status' => NewsStatus::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/actualites/{$article->id}/reject", ['rejection_reason' => 'Titre trop vague'])
        ->assertRedirect();

    $article->refresh();
    expect($article->status)->toBe(NewsStatus::Rejete);
    expect($article->rejection_reason)->toBe('Titre trop vague');
});

it('requires a reason to reject an article', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['status' => NewsStatus::EnAttente]);

    $this->actingAs($admin)
        ->post("/console/actualites/{$article->id}/reject", [])
        ->assertSessionHasErrors('rejection_reason');
});

it('forbids approving or rejecting without news.publish', function () {
    $editor = createNewsEditor();
    $article = NewsArticle::factory()->create(['status' => NewsStatus::EnAttente]);

    $this->actingAs($editor)->post("/console/actualites/{$article->id}/approve")->assertForbidden();
    $this->actingAs($editor)->post("/console/actualites/{$article->id}/reject", ['rejection_reason' => 'x'])->assertForbidden();
});

it('refuses to approve an article that is not pending', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $article = NewsArticle::factory()->create(['status' => NewsStatus::Publie]);

    $this->actingAs($admin)->post("/console/actualites/{$article->id}/approve")->assertStatus(409);
});

it('never exposes a pending or rejected article on the public site', function () {
    $pending = NewsArticle::factory()->create(['status' => NewsStatus::EnAttente]);
    $rejected = NewsArticle::factory()->create(['status' => NewsStatus::Rejete]);

    $this->get('/actualites')->assertInertia(fn ($page) => $page->component('Actualites/Index')->has('articles', 0));
    $this->get("/actualites/{$pending->slug}")->assertNotFound();
    $this->get("/actualites/{$rejected->slug}")->assertNotFound();
});
