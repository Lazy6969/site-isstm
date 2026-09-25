<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Reaction;
use Illuminate\Http\Request;
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
        ]);
    }
}
