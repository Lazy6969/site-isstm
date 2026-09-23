<?php

use App\Models\NewsArticle;
use App\NewsStatus;

it('exposes only the 3 most recent published articles on the homepage', function () {
    NewsArticle::factory()->create(['status' => NewsStatus::Publie, 'title' => 'Le plus récent', 'published_at' => now()]);
    NewsArticle::factory()->create(['status' => NewsStatus::Publie, 'title' => 'Deuxième', 'published_at' => now()->subDay()]);
    NewsArticle::factory()->create(['status' => NewsStatus::Publie, 'title' => 'Troisième', 'published_at' => now()->subDays(2)]);
    NewsArticle::factory()->create(['status' => NewsStatus::Publie, 'title' => 'Trop vieux', 'published_at' => now()->subDays(3)]);
    NewsArticle::factory()->create(['status' => NewsStatus::Brouillon, 'title' => 'Brouillon', 'published_at' => now()]);

    $this->get('/')->assertInertia(fn ($page) => $page
        ->component('Home')
        ->has('actualites', 3)
        ->where('actualites.0.title', 'Le plus récent')
    );
});
