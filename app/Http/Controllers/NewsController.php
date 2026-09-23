<?php

namespace App\Http\Controllers;

use App\EvenementStatus;
use App\Models\Evenement;
use App\Models\NewsArticle;
use App\NewsStatus;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(): Response
    {
        $articles = NewsArticle::query()
            ->with('category:id,name_fr,icon')
            ->where('status', NewsStatus::Publie)
            ->orderByDesc('published_at')
            ->get(['id', 'news_category_id', 'title', 'slug', 'excerpt', 'image_path', 'author', 'published_at']);

        // A few months out is enough to populate the calendar widget without
        // pulling in every event ever scheduled.
        $evenements = Evenement::query()
            ->where('date_debut', '>=', now()->startOfDay())
            ->where('date_debut', '<=', now()->addMonths(3))
            ->where('status', EvenementStatus::Publie)
            ->orderBy('date_debut')
            ->get(['id', 'titre', 'date_debut', 'lieu', 'categorie']);

        return Inertia::render('Actualites/Index', [
            'articles' => $articles,
            'evenements' => $evenements,
        ]);
    }

    public function show(NewsArticle $article): Response
    {
        abort_unless($article->status === NewsStatus::Publie, 404);

        $article->increment('views');
        $article->load('category:id,name_fr,icon');

        return Inertia::render('Actualites/Show', ['article' => $article]);
    }
}
