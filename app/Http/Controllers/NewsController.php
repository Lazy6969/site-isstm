<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\NewsStatus;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(): Response
    {
        $articles = NewsArticle::query()
            ->with('category:id,name_fr,icon,color')
            ->where('status', NewsStatus::Publie)
            ->orderByDesc('published_at')
            ->get(['id', 'news_category_id', 'title', 'slug', 'excerpt', 'image_path', 'author', 'published_at']);

        return Inertia::render('Actualites/Index', [
            'articles' => $articles,
        ]);
    }

    public function show(NewsArticle $article): Response
    {
        abort_unless($article->status === NewsStatus::Publie, 404);

        $article->increment('views');
        $article->load('category:id,name_fr,icon,color');

        $relatedArticles = $article->news_category_id === null
            ? collect()
            : NewsArticle::query()
                ->where('news_category_id', $article->news_category_id)
                ->where('id', '!=', $article->id)
                ->where('status', NewsStatus::Publie)
                ->orderByDesc('published_at')
                ->limit(3)
                ->get(['id', 'title', 'slug', 'excerpt', 'image_path', 'published_at']);

        return Inertia::render('Actualites/Show', ['article' => $article, 'relatedArticles' => $relatedArticles]);
    }
}
