<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageForwardRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;

class MessageForwardController extends Controller
{
    public function store(StoreMessageForwardRequest $request, Message $message): RedirectResponse
    {
        $user = $request->user();

        if ($request->filled('user_id')) {
            $friend = User::findOrFail($request->validated('user_id'));
            abort_unless($user->isFriendsWith($friend), 422, 'Vous devez être ami avec cette personne pour lui écrire.');

            [$userOneId, $userTwoId] = [$user->id, $friend->id];
            if ($userOneId > $userTwoId) {
                [$userOneId, $userTwoId] = [$userTwoId, $userOneId];
            }

            $target = Conversation::firstOrCreate(['user_one_id' => $userOneId, 'user_two_id' => $userTwoId]);
        } else {
            $target = Conversation::findOrFail($request->validated('conversation_id'));
            abort_unless($target->involves($user), 403);
        }

        $forwarded = Message::create([
            'conversation_id' => $target->id,
            'sender_id' => $user->id,
            'forwarded_from_id' => $message->id,
            'body' => $message->body,
        ]);

        $target->otherUser($user)->notify(new NewMessageReceived($forwarded));

        return back()->with('status', 'Message transféré.');
    }
}
