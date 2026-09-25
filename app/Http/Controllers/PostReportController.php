<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostReportRequest;
use App\Models\Post;
use App\Models\PostReport;
use Illuminate\Http\RedirectResponse;

class PostReportController extends Controller
{
    public function store(StorePostReportRequest $request, Post $post): RedirectResponse
    {
        PostReport::updateOrCreate(
            ['post_id' => $post->id, 'reporter_id' => $request->user()->id],
            ['reason' => $request->validated('reason')],
        );

        return back()->with('status', 'Signalement envoyé, merci.');
    }
}
