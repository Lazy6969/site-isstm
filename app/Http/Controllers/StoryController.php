<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoryRequest;
use App\Models\Story;
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
            ->with(['user:id,name,avatar_path', 'reactions' => fn ($query) => $query->where('user_id', $viewer->id)])
            ->withCount(['viewedBy', 'reactions'])
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
                    'can_manage' => $viewer->isAdministrator() || $story->user_id === $viewer->id,
                    // Only the story's own author can see how many people
                    // viewed it — matches viewer-list-style privacy elsewhere
                    // (Instagram/Snapchat): nobody else sees this count.
                    'views_count' => $story->user_id === $viewer->id ? $story->viewed_by_count : null,
                    // The reaction total is public (everyone sees "12 reactions"
                    // on a story, like Instagram); only the author can see who
                    // reacted with what (see StoryReactionListController).
                    'reactions_count' => $story->reactions_count,
                    'my_reaction' => $story->reactions->first()?->type->value,
                ])->values(),
            ])
            ->sortByDesc(fn ($group) => $group['is_mine'] ? 1 : 0)
            ->values();

        return response()->json(['groups' => $groups]);
    }

    public function view(Request $request, Story $story): JsonResponse
    {
        if ($story->user_id !== $request->user()->id) {
            $story->viewedBy()->syncWithoutDetaching([$request->user()->id]);
        }

        return response()->json(['status' => 'ok']);
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
        abort_unless($user->isAdministrator() || $story->user_id === $user->id, 403);

        $story->delete();

        return back()->with('status', 'Story supprimée.');
    }
}
