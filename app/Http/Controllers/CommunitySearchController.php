<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use App\Role;
use App\Support\Search\TokenSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CommunitySearchController extends Controller
{
    /**
     * Publications et comptes de la communauté uniquement — jamais le contenu
     * public du site (filières, actualités...), qui reste sur
     * SearchController via /recherche. Protégée par le même groupe de routes
     * que les autres pages de la communauté (auth + rôle admin/enseignant/
     * étudiant), donc jamais accessible à un simple visiteur ou compte `user`.
     */
    public function index(Request $request): Response
    {
        $term = trim((string) $request->string('q'));
        $tokens = TokenSearch::tokenize($term);
        $results = [];

        if ($tokens !== []) {
            $results['publications'] = Post::query()
                ->select(['id', 'user_id', 'body', 'created_at'])
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['body']))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'body'))
                ->with('user:id,name')
                ->limit(10)
                ->get()
                ->map(fn (Post $post) => [
                    'title' => Str::limit($post->body, 80),
                    'subtitle' => $post->user?->name,
                    'url' => route('posts.show', $post->id),
                ]);

            $results['personnes'] = User::query()
                ->select(['id', 'name as title', 'role'])
                ->whereIn('role', [Role::Admin, Role::Enseignant, Role::Etudiant])
                ->tap(fn (Builder $q) => TokenSearch::matchAll($q, $tokens, ['name', 'profession', 'bio']))
                ->tap(fn (Builder $q) => TokenSearch::orderByRelevance($q, $tokens, 'name', ['profession', 'bio']))
                ->limit(10)
                ->get()
                ->map(fn (User $person) => [
                    'title' => $person->title,
                    'subtitle' => $person->role->label(),
                    'url' => "/profil/{$person->id}",
                ]);
        }

        return Inertia::render('Communaute/Recherche', [
            'query' => $term,
            'results' => $results,
        ]);
    }
}
