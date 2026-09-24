<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostArchiveController extends Controller
{
    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasLegacyRole(Role::Admin) || $post->user_id === $user->id, 403);

        $post->update(['archived_at' => $post->archived_at ? null : now()]);

        return back()->with('status', $post->archived_at ? 'Publication archivée.' : 'Publication désarchivée.');
    }
}
