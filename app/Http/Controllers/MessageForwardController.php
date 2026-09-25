<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageForwardRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;

class MessageForwardController extends Controller
{
    public function store(StoreMessageForwardRequest $request, Message $message): RedirectResponse
    {
        $user = $request->user();
        $target = Conversation::findOrFail($request->validated('conversation_id'));
        abort_unless($target->involves($user), 403);

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
