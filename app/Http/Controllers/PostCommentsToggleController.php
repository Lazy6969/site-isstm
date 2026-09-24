<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostCommentsToggleController extends Controller
{
    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasLegacyRole(Role::Admin) || $post->user_id === $user->id, 403);

        $post->update(['comments_disabled' => ! $post->comments_disabled]);

        return back()->with('status', $post->comments_disabled ? 'Commentaires désactivés.' : 'Commentaires réactivés.');
    }
}
