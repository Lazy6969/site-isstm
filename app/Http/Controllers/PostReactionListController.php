<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\JsonResponse;

class PostReactionListController extends Controller
{
    public function index(Post $post): JsonResponse
    {
        $reactions = $post->reactions()->with('user:id,name,avatar_path')->latest()->get()
            ->map(fn (Reaction $reaction) => [
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
