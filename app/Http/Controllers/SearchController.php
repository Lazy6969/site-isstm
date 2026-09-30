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
use App\Models\Post;
use App\Models\Teacher;
use App\Models\User;
use App\NewsStatus;
use App\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $term = trim((string) $request->string('q'));
        $tokens = $this->tokenize($term);
        $results = [];

        if ($tokens !== []) {
            $results['filieres'] = Filiere::query()
                ->select(['slug', 'nom_fr as title', 'mention as subtitle'])
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['nom_fr', 'code', 'mention', 'description_fr', 'debouches_fr']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'nom_fr', ['code', 'mention', 'description_fr', 'debouches_fr']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/filieres/{$item->slug}"]);

            $results['enseignants'] = Teacher::query()
                ->select(['name as title', 'specialty_fr as subtitle'])
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['name', 'specialty_fr', 'description_fr', 'departement']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'name', ['specialty_fr', 'description_fr', 'departement']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => '/enseignants']);

            $results['actualites'] = NewsArticle::query()
                ->select(['slug', 'title', 'excerpt as subtitle'])
                ->where('status', NewsStatus::Publie)
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['title', 'excerpt', 'content', 'author']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'title', ['excerpt', 'content', 'author']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/actualites/{$item->slug}"]);

            $results['campus'] = CampusBloc::query()
                ->select(['bloc_key', 'nom as title', 'signification as subtitle'])
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['nom', 'signification', 'slogan', 'fondateurs', 'objectifs', 'activites']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'nom', ['signification', 'slogan', 'fondateurs', 'objectifs', 'activites']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/campus/{$item->bloc_key}"]);

            $results['galerie'] = GalleryAlbum::query()
                ->select(['slug', 'title', 'location as subtitle'])
                ->where('status', GalleryStatus::Publie)
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['title', 'description', 'location', 'author']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'title', ['description', 'location', 'author']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => "/galerie/{$item->slug}"]);

            $results['evenements'] = Evenement::query()
                ->select(['titre as title', 'lieu as subtitle'])
                ->where('status', EvenementStatus::Publie)
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['titre', 'description', 'lieu', 'categorie']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'titre', ['description', 'lieu', 'categorie']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => [...$item->toArray(), 'url' => '/evenements']);

            $results['documents'] = Document::query()
                ->select(['title', 'category as subtitle', 'file_path'])
                ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['title', 'category']))
                ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'title', ['category']))
                ->limit(5)
                ->get()
                ->map(fn ($item) => ['title' => $item->title, 'subtitle' => $item->subtitle, 'url' => "/{$item->file_path}"]);

            // Fil communautaire — réservé aux membres de la communauté (admin/enseignant/étudiant),
            // pour ne jamais faire fuiter des publications ou des comptes vers une recherche publique.
            $user = $request->user();
            if ($user && in_array($user->role, [Role::Admin, Role::Enseignant, Role::Etudiant], true)) {
                $results['publications'] = Post::query()
                    ->select(['id', 'user_id', 'body', 'created_at'])
                    ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['body']))
                    ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'body'))
                    ->with('user:id,name')
                    ->limit(5)
                    ->get()
                    ->map(fn (Post $post) => [
                        'title' => Str::limit($post->body, 80),
                        'subtitle' => $post->user?->name,
                        'url' => '/communaute',
                    ]);

                $results['personnes'] = User::query()
                    ->select(['id', 'name as title', 'role'])
                    ->whereIn('role', [Role::Admin, Role::Enseignant, Role::Etudiant])
                    ->tap(fn (Builder $q) => $this->matchAll($q, $tokens, ['name', 'profession', 'bio']))
                    ->tap(fn (Builder $q) => $this->orderByRelevance($q, $tokens, 'name', ['profession', 'bio']))
                    ->limit(5)
                    ->get()
                    ->map(fn (User $person) => [
                        'title' => $person->title,
                        'subtitle' => $person->role->label(),
                        'url' => "/profil/{$person->id}",
                    ]);
            }
        }

        return Inertia::render('Search/Index', [
            'query' => $term,
            'results' => $results,
        ]);
    }

    /**
     * Splits the search phrase into individual keywords — "génie informatique
     * mahajanga" becomes three separate clues instead of one literal phrase
     * that has to appear verbatim, letting matchAll() find rows where the
     * clues are scattered across different fields or in any order. One-letter
     * words are dropped as noise (articles, typos) unless that's all there is.
     *
     * @return array<int, string>
     */
    private function tokenize(string $term): array
    {
        $words = collect(preg_split('/\s+/u', mb_strtolower($term), -1, PREG_SPLIT_NO_EMPTY))
            ->unique()
            ->values();

        $meaningful = $words->filter(fn (string $word) => mb_strlen($word) >= 2);

        return ($meaningful->isEmpty() ? $words : $meaningful)->all();
    }

    /**
     * Every keyword must be found (AND across tokens) — each one wherever it
     * turns up, in any of the given columns (OR across columns). This is what
     * lets "génie informatique" match a filière whose name only contains
     * "Informatique" while "Génie" only appears in its description.
     *
     * @param  array<int, string>  $tokens
     * @param  array<int, string>  $columns
     */
    private function matchAll(Builder $query, array $tokens, array $columns): Builder
    {
        foreach ($tokens as $token) {
            $query->where(function (Builder $tokenQuery) use ($columns, $token) {
                foreach ($columns as $column) {
                    $tokenQuery->orWhere($column, 'like', '%'.$token.'%');
                }
            });
        }

        return $query;
    }

    /**
     * Ranks rows by how many keywords land in the title versus the
     * supporting columns — a title hit counts double, so a filière named
     * after the search term outranks one that merely mentions it in its
     * description. Ties fall back to the most recently created row. Bindings
     * travel alongside the raw SQL (never interpolated), keeping this
     * injection-safe despite being built from user input. Appends to
     * whatever `select()` already chose — the caller must select its columns
     * before tapping this in, since a raw `*` here would clobber them.
     *
     * @param  array<int, string>  $tokens
     * @param  array<int, string>  $otherColumns
     */
    private function orderByRelevance(Builder $query, array $tokens, string $titleColumn, array $otherColumns = []): Builder
    {
        $parts = [];
        $bindings = [];

        foreach ($tokens as $token) {
            $like = '%'.$token.'%';
            $parts[] = "(CASE WHEN {$titleColumn} LIKE ? THEN 2 ELSE 0 END)";
            $bindings[] = $like;

            foreach ($otherColumns as $column) {
                $parts[] = "(CASE WHEN {$column} LIKE ? THEN 1 ELSE 0 END)";
                $bindings[] = $like;
            }
        }

        return $query
            ->selectRaw('('.implode(' + ', $parts).') as search_relevance', $bindings)
            ->orderByDesc('search_relevance')
            ->orderByDesc($query->getModel()->getCreatedAtColumn());
    }
}
