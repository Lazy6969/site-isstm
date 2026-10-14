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
     *
     * Ranked with TokenSearch::rankByOverlap() — the same word-overlap,
     * accent/typo-tolerant algorithm the Assistant ISSTM chatbot uses to read
     * a question — rather than SQL `LIKE` patterns: every catalog searched
     * here is small enough (at most a few dozen rows) to fetch whole and
     * score in memory, which is what actually lets a misspelled or
     * unaccented word still find its match.
     */
    public function index(Request $request): Response
    {
        $term = trim((string) $request->string('q'));
        $queryWords = TokenSearch::fuzzyWords($term);
        $results = [];

        if ($queryWords !== []) {
            $results['filieres'] = TokenSearch::rankByOverlap(
                Filiere::query()->select(['slug', 'nom_fr', 'mention', 'code', 'description_fr', 'debouches_fr'])->latest()->get(),
                $queryWords,
                fn (Filiere $f) => $f->nom_fr,
                fn (Filiere $f) => implode(' ', [$f->code, $f->mention, $f->description_fr, $f->debouches_fr]),
            )->map(fn (Filiere $f) => [
                'title' => $f->nom_fr,
                'subtitle' => $f->mention,
                'url' => "/filieres/{$f->slug}",
            ])->values();

            $results['enseignants'] = TokenSearch::rankByOverlap(
                Teacher::query()->select(['name', 'specialty_fr', 'description_fr', 'departement'])->latest()->get(),
                $queryWords,
                fn (Teacher $t) => $t->name,
                fn (Teacher $t) => implode(' ', [$t->specialty_fr, $t->description_fr, $t->departement?->value]),
            )->map(fn (Teacher $t) => [
                'title' => $t->name,
                'subtitle' => $t->specialty_fr,
                'url' => '/enseignants',
            ])->values();

            $results['actualites'] = TokenSearch::rankByOverlap(
                NewsArticle::query()->select(['slug', 'title', 'excerpt', 'content', 'author'])
                    ->where('status', NewsStatus::Publie)->latest()->get(),
                $queryWords,
                fn (NewsArticle $n) => $n->title,
                fn (NewsArticle $n) => implode(' ', [$n->excerpt, $n->content, $n->author]),
            )->map(fn (NewsArticle $n) => [
                'title' => $n->title,
                'subtitle' => $n->excerpt,
                'url' => "/actualites/{$n->slug}",
            ])->values();

            $results['campus'] = TokenSearch::rankByOverlap(
                CampusBloc::query()->select(['bloc_key', 'nom', 'signification', 'slogan', 'fondateurs', 'objectifs', 'activites'])->latest()->get(),
                $queryWords,
                fn (CampusBloc $c) => $c->nom,
                fn (CampusBloc $c) => implode(' ', [$c->signification, $c->slogan, $c->fondateurs, $c->objectifs, $c->activites]),
            )->map(fn (CampusBloc $c) => [
                'title' => $c->nom,
                'subtitle' => $c->signification,
                'url' => "/campus/{$c->bloc_key}",
            ])->values();

            $results['galerie'] = TokenSearch::rankByOverlap(
                GalleryAlbum::query()->select(['slug', 'title', 'description', 'location', 'author'])
                    ->where('status', GalleryStatus::Publie)->latest()->get(),
                $queryWords,
                fn (GalleryAlbum $g) => $g->title,
                fn (GalleryAlbum $g) => implode(' ', [$g->description, $g->location, $g->author]),
            )->map(fn (GalleryAlbum $g) => [
                'title' => $g->title,
                'subtitle' => $g->location,
                'url' => "/galerie/{$g->slug}",
            ])->values();

            $results['evenements'] = TokenSearch::rankByOverlap(
                Evenement::query()->select(['titre', 'description', 'lieu', 'categorie'])
                    ->where('status', EvenementStatus::Publie)->latest()->get(),
                $queryWords,
                fn (Evenement $e) => $e->titre,
                fn (Evenement $e) => implode(' ', [$e->description, $e->lieu, $e->categorie]),
            )->map(fn (Evenement $e) => [
                'title' => $e->titre,
                'subtitle' => $e->lieu,
                'url' => '/evenements',
            ])->values();

            $results['documents'] = TokenSearch::rankByOverlap(
                Document::query()->select(['title', 'category', 'file_path'])->latest()->get(),
                $queryWords,
                fn (Document $d) => $d->title,
                fn (Document $d) => (string) $d->category,
            )->map(fn (Document $d) => [
                'title' => $d->title,
                'subtitle' => $d->category,
                'url' => "/{$d->file_path}",
            ])->values();
        }

        return Inertia::render('Search/Index', [
            'query' => $term,
            'results' => $results,
        ]);
    }
}
