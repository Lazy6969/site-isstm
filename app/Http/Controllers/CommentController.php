<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Notifications\CommentReplied;
use App\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        abort_if($post->comments_disabled, 403, 'Les commentaires sont désactivés pour cette publication.');

        $comment = $post->comments()->create([
            'parent_id' => $request->validated('parent_id'),
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        if ($comment->parent_id !== null) {
            $parent = $comment->parent;
            if ($parent->user_id !== $comment->user_id) {
                $parent->user->notify(new CommentReplied($comment));
            }
        }

        return back()->with('status', 'Commentaire ajouté.');
    }

    public function update(UpdateCommentRequest $request, Comment $comment): RedirectResponse
    {
        $comment->update(['body' => $request->validated('body'), 'edited_at' => now()]);

        return back()->with('status', 'Commentaire modifié.');
    }

    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasLegacyRole(Role::Admin) || $comment->user_id === $user->id, 403);

        $comment->delete();

        return back()->with('status', 'Commentaire supprimé.');
    }
}
