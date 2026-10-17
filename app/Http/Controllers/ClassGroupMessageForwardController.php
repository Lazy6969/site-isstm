<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassGroupMessageForwardRequest;
use App\Models\ClassGroupMessage;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;

/**
 * Forwards a group-chat message out into a direct conversation. The
 * destination is always a `messages` row, so there is no FK to point
 * `forwarded_from_id` at (it only ever references another `messages` row) —
 * `forwarded_from_label` carries the "Transféré de {sender}" attribution
 * instead, without a real relation.
 */
class ClassGroupMessageForwardController extends Controller
{
    public function store(StoreClassGroupMessageForwardRequest $request, ClassGroupMessage $message): RedirectResponse
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
            'forwarded_from_label' => $message->sender->name,
            'body' => $message->body,
        ]);

        $target->otherUser($user)->notify(new NewMessageReceived($forwarded));

        return back()->with('status', 'Message transféré.');
    }
}
