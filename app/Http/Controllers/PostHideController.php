<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostHideController extends Controller
{
    public function store(Request $request, Post $post): RedirectResponse
    {
        $post->hiddenBy()->syncWithoutDetaching([$request->user()->id]);

        return back()->with('status', 'Publication masquée de votre fil.');
    }
}
