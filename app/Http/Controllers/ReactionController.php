<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\ReactionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReactionController extends Controller
{
    public function store(Request $request, Post $post): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(ReactionType::class)],
        ]);

        $user = $request->user();
        $existing = $post->reactions()->where('user_id', $user->id)->first();

        if ($existing && $existing->type->value === $validated['type']) {
            $existing->delete();

            return back();
        }

        $post->reactions()->updateOrCreate(
            ['user_id' => $user->id],
            ['type' => $validated['type']],
        );

        return back();
    }
}
