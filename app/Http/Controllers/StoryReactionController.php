<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\ReactionType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoryReactionController extends Controller
{
    /**
     * Returns JSON, not a redirect — unlike posts, stories are a self-contained
     * widget driven by plain fetch() (see StoriesBar.jsx/StoryViewer.jsx), not
     * an Inertia page visit, so a reaction tap updates in place instead of
     * reloading/flashing the whole page.
     */
    public function store(Request $request, Story $story): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(ReactionType::class)],
        ]);

        $user = $request->user();
        $existing = $story->reactions()->where('user_id', $user->id)->first();

        if ($existing && $existing->type->value === $validated['type']) {
            $existing->delete();

            return response()->json(['my_reaction' => null]);
        }

        $story->reactions()->updateOrCreate(
            ['user_id' => $user->id],
            ['type' => $validated['type']],
        );

        return response()->json(['my_reaction' => $validated['type']]);
    }
}
