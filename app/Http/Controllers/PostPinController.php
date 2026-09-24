<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostPinController extends Controller
{
    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasLegacyRole(Role::Admin) || $post->user_id === $user->id, 403);

        if ($post->pinned_at) {
            $post->update(['pinned_at' => null]);

            return back()->with('status', 'Publication désépinglée.');
        }

        // Only one post is pinned to the top of the shared feed at a time —
        // unpin whatever was pinned before pinning this one.
        Post::query()->whereNotNull('pinned_at')->update(['pinned_at' => null]);
        $post->update(['pinned_at' => now()]);

        return back()->with('status', 'Publication épinglée en haut du fil.');
    }
}
