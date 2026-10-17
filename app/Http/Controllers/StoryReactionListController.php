<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryReactionListController extends Controller
{
    /**
     * Who reacted with what, visible only to the story's own author —
     * mirrors Facebook/Instagram, where other viewers never see each
     * other's story reactions, only the author does.
     */
    public function index(Request $request, Story $story): JsonResponse
    {
        abort_unless($story->user_id === $request->user()->id, 403);

        $reactions = $story->reactions()->with('user:id,name,avatar_path')->latest()->get()
            ->map(fn (StoryReaction $reaction) => [
                'type' => $reaction->type->value,
                'emoji' => $reaction->type->emoji(),
                'user' => [
                    'id' => $reaction->user->id,
                    'name' => $reaction->user->name,
                    'avatar_path' => $reaction->user->avatar_path,
                ],
            ]);

        return response()->json(['reactions' => $reactions]);
    }
}
