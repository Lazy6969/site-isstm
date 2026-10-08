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
use App\Support\Search\TokenSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Site content only — filières, enseignants, actualités, campus, galerie,
     * événements, documents. Never publications or comptes: those live on
     * their own `/communaute/recherche` endpoint (CommunitySearchController),
     * so the public site search and the community search never mix, no
     * matter who's asking.
     */
    public function index(Request $request): Response
    {
        $term = trim((string) $request->string('q'));
        $tokens = TokenSearch::tokenize($term);
        $results = [];

        if ($tokens !== []) {
            $results['filieres'] = Filiere::query()
                ->select(['slug', 'nom_fr as title', 'mention as subtitle'])
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['nom_fr', 'code', 'mention', 'description_fr', 'debouches_fr'], 'nom_fr'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'nom_fr', ['code', 'mention', 'description_fr', 'debouches_fr']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/filieres/{$item->slug}"]);

            $results['enseignants'] = Teacher::query()
                ->select(['name as title', 'specialty_fr as subtitle'])
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['name', 'specialty_fr', 'description_fr', 'departement'], 'name'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'name', ['specialty_fr', 'description_fr', 'departement']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => '/enseignants']);

            $results['actualites'] = NewsArticle::query()
                ->select(['slug', 'title', 'excerpt as subtitle'])
                ->where('status', NewsStatus::Publie)
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['title', 'excerpt', 'content', 'author'], 'title'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'title', ['excerpt', 'content', 'author']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/actualites/{$item->slug}"]);

            $results['campus'] = CampusBloc::query()
                ->select(['bloc_key', 'nom as title', 'signification as subtitle'])
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['nom', 'signification', 'slogan', 'fondateurs', 'objectifs', 'activites'], 'nom'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'nom', ['signification', 'slogan', 'fondateurs', 'objectifs', 'activites']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/campus/{$item->bloc_key}"]);

            $results['galerie'] = GalleryAlbum::query()
                ->select(['slug', 'title', 'location as subtitle'])
                ->where('status', GalleryStatus::Publie)
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['title', 'description', 'location', 'author'], 'title'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'title', ['description', 'location', 'author']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/galerie/{$item->slug}"]);

            $results['evenements'] = Evenement::query()
                ->select(['titre as title', 'lieu as subtitle'])
                ->where('status', EvenementStatus::Publie)
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['titre', 'description', 'lieu', 'categorie'], 'titre'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'titre', ['description', 'lieu', 'categorie']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => '/evenements']);

            $results['documents'] = Document::query()
                ->select(['title', 'category as subtitle', 'file_path'])
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['title', 'category'], 'title'))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'title', ['category']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => ['title' => $item->title, 'subtitle' => $item->subtitle, 'url' => "/{$item->file_path}"]);
        }

        return Inertia::render('Search/Index', [
            'query' => $term,
            'results' => $results,
        ]);
    }
}
