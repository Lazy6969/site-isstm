<?php

namespace App\Http\Controllers;

use App\EvenementStatus;
use App\GalleryStatus;
use App\Models\CampusBloc;
use App\Models\Document;
use App\Models\Evenement;
use App\Models\Filiere;
use App\Models\GalleryAlbum;
use App\Models\NewsArticle;
use App\Models\Teacher;
use App\NewsStatus;
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
                ->where('status', NewsStatus::Publie)
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

            $results['galerie'] = GalleryAlbum::query()
                ->where('status', GalleryStatus::Publie)
                ->where(fn ($query) => $query->where('title', 'like', $like)->orWhere('description', 'like', $like))
                ->limit(5)
                ->get(['slug', 'title', 'location as subtitle'])
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/galerie/{$item->slug}"]);

            $results['evenements'] = Evenement::query()
                ->where('status', EvenementStatus::Publie)
                ->where(fn ($query) => $query->where('titre', 'like', $like)->orWhere('description', 'like', $like))
                ->limit(5)
                ->get(['titre as title', 'lieu as subtitle'])
                ->map(fn ($item) => [...$item->toArray(), 'url' => '/evenements']);

            $results['documents'] = Document::query()
                ->where('title', 'like', $like)
                ->limit(5)
                ->get(['title', 'category as subtitle', 'file_path'])
                ->map(fn ($item) => ['title' => $item->title, 'subtitle' => $item->subtitle, 'url' => "/{$item->file_path}"]);
        }

        return Inertia::render('Search/Index', [
            'query' => $term,
            'results' => $results,
        ]);
    }
}
