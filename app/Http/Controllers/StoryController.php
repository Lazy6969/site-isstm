<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoryRequest;
use App\Models\Story;
use App\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $viewer = $request->user();

        $groups = Story::query()
            ->active()
            ->with('user:id,name,avatar_path')
            ->oldest()
            ->get()
            ->groupBy('user_id')
            ->map(fn ($stories) => [
                'user' => [
                    'id' => $stories->first()->user->id,
                    'name' => $stories->first()->user->name,
                    'avatar_path' => $stories->first()->user->avatar_path,
                ],
                'is_mine' => $stories->first()->user_id === $viewer->id,
                'stories' => $stories->map(fn (Story $story) => [
                    'id' => $story->id,
                    'media_path' => $story->media_path,
                    'caption' => $story->caption,
                    'created_at' => $story->created_at,
                    'can_manage' => $viewer->hasLegacyRole(Role::Admin) || $story->user_id === $viewer->id,
                ])->values(),
            ])
            ->sortByDesc(fn ($group) => $group['is_mine'] ? 1 : 0)
            ->values();

        return response()->json(['groups' => $groups]);
    }

    public function store(StoreStoryRequest $request): RedirectResponse
    {
        Story::create([
            'user_id' => $request->user()->id,
            'media_path' => $request->file('media')->store('stories', 'public'),
            'caption' => $request->validated('caption'),
            'expires_at' => now()->addDay(),
        ]);

        return back()->with('status', 'Story publiée.');
    }

    public function destroy(Request $request, Story $story): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasLegacyRole(Role::Admin) || $story->user_id === $user->id, 403);

        $story->delete();

        return back()->with('status', 'Story supprimée.');
    }
}
