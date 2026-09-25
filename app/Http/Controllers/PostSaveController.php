<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostSaveController extends Controller
{
    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();

        if ($post->savedBy()->where('users.id', $user->id)->exists()) {
            $post->savedBy()->detach($user->id);

            return back()->with('status', 'Publication retirée des enregistrements.');
        }

        $post->savedBy()->attach($user->id);

        return back()->with('status', 'Publication enregistrée.');
    }
}
