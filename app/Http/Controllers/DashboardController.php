<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Reaction;
use App\ReactionType;
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
        ]);
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
