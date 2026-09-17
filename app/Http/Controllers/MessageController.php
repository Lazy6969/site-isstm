<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\MediaType;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        abort_unless($conversation->involves($user), 403);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->validated('body'),
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $mediaType = MediaType::fromMimeType($file->getMimeType());

            $message->attachments()->create([
                'path' => $file->store('messages', 'public'),
                'original_name' => $file->getClientOriginalName(),
                'file_type' => $mediaType?->value ?? 'autre',
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return back();
    }

    public function destroy(Request $request, Message $message): RedirectResponse
    {
        $user = $request->user();
        abort_unless($message->conversation->involves($user), 403);

        $message->hiddenFor()->syncWithoutDetaching([$user->id]);

        return back()->with('status', 'Message masqué.');
    }
}
