<?php

use App\Models\NewsArticle;
use App\Models\NewsCategory;

it('lists only published articles ordered by publication date', function () {
    NewsArticle::factory()->create(['title' => 'Ancien', 'slug' => 'ancien', 'status' => 'publie', 'published_at' => now()->subDays(5)]);
    NewsArticle::factory()->create(['title' => 'Récent', 'slug' => 'recent', 'status' => 'publie', 'published_at' => now()]);
    NewsArticle::factory()->create(['title' => 'Brouillon', 'slug' => 'brouillon', 'status' => 'brouillon']);

    $this->get('/actualites')->assertInertia(fn ($page) => $page
        ->component('Actualites/Index')
        ->has('articles', 2)
        ->where('articles.0.slug', 'recent')
    );
});

it('shows a published article and increments its view count', function () {
    $article = NewsArticle::factory()->create(['status' => 'publie', 'views' => 5]);

    $this->get("/actualites/{$article->slug}")->assertInertia(fn ($page) => $page
        ->component('Actualites/Show')
        ->where('article.title', $article->title)
    );

    expect($article->fresh()->views)->toBe(6);
});

it('returns 404 for a draft article', function () {
    $article = NewsArticle::factory()->create(['status' => 'brouillon']);

    $this->get("/actualites/{$article->slug}")->assertNotFound();
});

it('shows related articles from the same category, excluding itself and drafts', function () {
    $category = NewsCategory::create(['slug' => 'vie-etudiante', 'name_fr' => 'Vie étudiante']);
    $otherCategory = NewsCategory::create(['slug' => 'recherche', 'name_fr' => 'Recherche']);

    $article = NewsArticle::factory()->create(['status' => 'publie', 'news_category_id' => $category->id]);
    $related = NewsArticle::factory()->create(['status' => 'publie', 'news_category_id' => $category->id]);
    NewsArticle::factory()->create(['status' => 'brouillon', 'news_category_id' => $category->id]);
    NewsArticle::factory()->create(['status' => 'publie', 'news_category_id' => $otherCategory->id]);

    $this->get("/actualites/{$article->slug}")->assertInertia(fn ($page) => $page
        ->component('Actualites/Show')
        ->has('relatedArticles', 1)
        ->where('relatedArticles.0.slug', $related->slug)
    );
});

it('shows no related articles for an uncategorized article', function () {
    $article = NewsArticle::factory()->create(['status' => 'publie', 'news_category_id' => null]);
    NewsArticle::factory()->create(['status' => 'publie', 'news_category_id' => null]);

    $this->get("/actualites/{$article->slug}")->assertInertia(fn ($page) => $page
        ->has('relatedArticles', 0)
    );
});
