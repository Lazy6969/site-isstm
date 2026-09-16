<?php

namespace App\Http\Controllers;

use App\Models\CampusBloc;
use App\Models\Filiere;
use App\Models\NewsArticle;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $term = trim((string) $request->string('q'));
        $results = [];

        if ($term !== '') {
            $like = '%'.$term.'%';

            $results['filieres'] = Filiere::query()
                ->where('nom_fr', 'like', $like)
                ->orWhere('description_fr', 'like', $like)
                ->limit(5)
                ->get(['slug', 'nom_fr as title', 'mention as subtitle'])
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/filieres/{$item->slug}"]);

            $results['enseignants'] = Teacher::query()
                ->where('name', 'like', $like)
                ->orWhere('specialty_fr', 'like', $like)
                ->limit(5)
                ->get(['name as title', 'specialty_fr as subtitle'])
                ->map(fn ($item) => [...$item->toArray(), 'url' => '/enseignants']);

            $results['actualites'] = NewsArticle::query()
                ->where('status', 'publie')
                ->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('excerpt', 'like', $like))
                ->limit(5)
                ->get(['slug', 'title', 'excerpt as subtitle'])
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/actualites/{$item->slug}"]);

            $results['campus'] = CampusBloc::query()
                ->where('nom', 'like', $like)
                ->orWhere('signification', 'like', $like)
                ->limit(5)
                ->get(['bloc_key', 'nom as title', 'signification as subtitle'])
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/campus/{$item->bloc_key}"]);
        }

        return Inertia::render('Search/Index', [
            'query' => $term,
            'results' => $results,
        ]);
    }
}
