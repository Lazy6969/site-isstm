<?php

use App\EvenementStatus;
use App\Models\Evenement;
use App\Models\NewsArticle;

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

it('feeds the calendar widget with only published, upcoming events', function () {
    Evenement::factory()->create(['titre' => 'À venir', 'status' => EvenementStatus::Publie, 'date_debut' => now()->addDays(5)]);
    Evenement::factory()->create(['titre' => 'Passé', 'status' => EvenementStatus::Publie, 'date_debut' => now()->subDays(5)]);
    Evenement::factory()->create(['titre' => 'Brouillon', 'status' => EvenementStatus::Brouillon, 'date_debut' => now()->addDays(5)]);
    Evenement::factory()->create(['titre' => 'Trop loin', 'status' => EvenementStatus::Publie, 'date_debut' => now()->addMonths(6)]);

    $this->get('/actualites')->assertInertia(fn ($page) => $page
        ->component('Actualites/Index')
        ->has('evenements', 1)
        ->where('evenements.0.titre', 'À venir')
    );
});
