<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Reaction;
use App\Models\User;
use App\ReactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Personal "tableau de bord" for the espace étudiant — reach/engagement
 * stats for the signed-in user's own posts and stories, plus their
 * friends/groups counts. Distinct from the admin console's /console/dashboard,
 * which covers site-wide statistics rather than one account's activity.
 */
class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $postIds = $user->posts()->pluck('id');
        $storyIds = $user->stories()->pluck('id');

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'posts_count' => $postIds->count(),
                'post_views_count' => DB::table('post_views')->whereIn('post_id', $postIds)->count(),
                'reactions_received' => Reaction::query()->whereIn('post_id', $postIds)->count(),
                'comments_received' => Comment::query()->whereIn('post_id', $postIds)->count(),
                'stories_count' => $storyIds->count(),
                'story_views_count' => DB::table('story_views')->whereIn('story_id', $storyIds)->count(),
                'friends_count' => $user->friends()->count(),
                'groups_count' => $user->classGroupMemberships()->where('is_banned', false)->count(),
            ],
            'viewsOverTime' => $this->viewsOverTime($postIds),
            'reactionsByType' => $this->reactionsByType($postIds),
            'dossier' => $this->dossierSummary($user),
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role_label' => $user->roles->first()?->name,
                'member_since' => $user->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Every Candidat (préinscription) and Inscription (réinscription/
     * redoublement) tied to this account, newest first — the most recent one
     * is "current" (with its full timeline since creation), the rest are
     * "archives": the student's whole admission/enrollment history, not just
     * this year's. Returns null for an account with neither (e.g. staff).
     *
     * @return array{current: array<string, mixed>, timeline: array<int, array<string, mixed>>, archives: array<int, array<string, mixed>>}|null
     */
    private function dossierSummary(User $user): ?array
    {
        $records = $user->candidats()->with('filiere:id,nom_fr')->get()
            ->map(fn ($c) => [
                'kind' => 'preinscription',
                'id' => $c->id,
                'numero_dossier' => $c->numero_dossier,
                'label' => 'Préinscription',
                'filiere' => $c->filiere?->nom_fr,
                'niveau' => $c->niveau,
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'commentaire_correction' => $c->commentaire_correction,
                'motif_refus' => $c->motif_refus,
                'created_at' => $c->created_at,
                'submitted_at' => $c->submitted_at,
                'reviewed_at' => $c->reviewed_at,
                'model' => $c,
            ]);

        $etudiant = $user->etudiant()->with('classe:id,nom')->first();
        if ($etudiant) {
            $records = $records->concat(
                $etudiant->inscriptions()->with('filiere:id,nom_fr')->get()->map(fn ($i) => [
                    'kind' => 'inscription',
                    'id' => $i->id,
                    'numero_dossier' => $i->numero_dossier,
                    'label' => $i->type?->label() ?? 'Inscription',
                    'filiere' => $i->filiere?->nom_fr,
                    'niveau' => $i->niveau_souhaite,
                    'status' => $i->statut->value,
                    'status_label' => $i->statut->label(),
                    'commentaire_correction' => $i->commentaire_correction,
                    'motif_refus' => $i->motif_refus,
                    'created_at' => $i->created_at,
                    'submitted_at' => $i->submitted_at,
                    'reviewed_at' => $i->reviewed_at,
                    'model' => $i,
                ]),
            );
        }

        if ($records->isEmpty()) {
            return null;
        }

        $records = $records->sortByDesc('created_at')->values();
        $current = $records->first();

        return [
            'current' => collect($current)->except('model')->map(fn ($v) => $v instanceof Carbon ? $v->toIso8601String() : $v)->all(),
            'timeline' => $this->dossierTimeline($current['model']),
            'archives' => $records->slice(1)->map(fn ($r) => collect($r)->except('model')->map(fn ($v) => $v instanceof Carbon ? $v->toIso8601String() : $v)->all())->values()->all(),
        ];
    }

    /**
     * Every milestone of one dossier since it was first created: the record's
     * own creation/submission timestamps, plus every scolarité action already
     * logged against it (correction requested, approved, refused — see
     * Admin\PreinscriptionController / Admin\InscriptionController).
     *
     * @return array<int, array{date: string, label: string}>
     */
    private function dossierTimeline(Model $record): array
    {
        $entries = collect([['date' => $record->created_at, 'label' => 'Dossier créé']]);

        if ($record->submitted_at) {
            $entries->push(['date' => $record->submitted_at, 'label' => 'Dossier soumis à la scolarité']);
        }

        $logs = ActivityLog::query()
            ->where('subject_type', $record->getMorphClass())
            ->where('subject_id', $record->id)
            ->orderBy('created_at')
            ->get(['description', 'created_at']);

        foreach ($logs as $log) {
            $entries->push(['date' => $log->created_at, 'label' => $log->description]);
        }

        return $entries->sortBy('date')->values()
            ->map(fn (array $entry) => ['date' => $entry['date']->toIso8601String(), 'label' => $entry['label']])
            ->all();
    }

    /**
     * Daily post-view count for the last 14 days — grouped in PHP rather
     * than with a SQL DATE() expression so it behaves the same on the
     * MySQL connection this app runs on and the SQLite one tests use.
     *
     * @param  Collection<int, int>  $postIds
     * @return array<int, array{date: string, total: int}>
     */
    private function viewsOverTime($postIds): array
    {
        $since = now()->subDays(13)->startOfDay();

        $byDate = DB::table('post_views')
            ->whereIn('post_id', $postIds)
            ->where('created_at', '>=', $since)
            ->pluck('created_at')
            ->groupBy(fn ($timestamp) => Carbon::parse($timestamp)->toDateString())
            ->map->count();

        return collect(range(13, 0))
            ->map(function (int $daysAgo) use ($byDate) {
                $date = now()->subDays($daysAgo);

                return ['date' => $date->translatedFormat('d M'), 'total' => $byDate->get($date->toDateString(), 0)];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, int>  $postIds
     * @return array<int, array{type: string, emoji: string, total: int}>
     */
    private function reactionsByType($postIds): array
    {
        $counts = Reaction::query()->whereIn('post_id', $postIds)->get()->countBy(fn (Reaction $r) => $r->type->value);

        return collect(ReactionType::cases())
            ->map(fn (ReactionType $type) => ['type' => $type->label(), 'emoji' => $type->emoji(), 'total' => $counts->get($type->value, 0)])
            ->filter(fn (array $row) => $row['total'] > 0)
            ->values()
            ->all();
    }
}
