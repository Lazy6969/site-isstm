<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Story;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StoryReplyController extends Controller
{
    /**
     * Replying to a story starts (or reuses) a direct conversation with its
     * author, even without an existing friendship first — every community
     * member can already see any active story (see StoryController::index),
     * so replying to one it shouldn't be gated behind being friends first,
     * the same way Instagram lets you message a story you watched without
     * following its author.
     */
    public function store(Request $request, Story $story): RedirectResponse
    {
        $user = $request->user();
        abort_if($story->user_id === $user->id, 422, 'Vous ne pouvez pas vous répondre à vous-même.');

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        [$userOneId, $userTwoId] = [$user->id, $story->user_id];
        if ($userOneId > $userTwoId) {
            [$userOneId, $userTwoId] = [$userTwoId, $userOneId];
        }

        $conversation = Conversation::firstOrCreate([
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'story_id' => $story->id,
            'body' => $validated['body'],
        ]);

        $story->user->notify(new NewMessageReceived($message));

        return redirect()->route('messages.show', $conversation)->with('status', 'Réponse envoyée.');
    }
}
