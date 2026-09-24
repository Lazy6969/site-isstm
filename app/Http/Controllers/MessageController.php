<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\MediaType;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        abort_unless($conversation->involves($user), 403);

        $replyToId = $request->validated('reply_to_id');
        if ($replyToId !== null) {
            abort_unless(Message::where('id', $replyToId)->where('conversation_id', $conversation->id)->exists(), 422);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'reply_to_id' => $replyToId,
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

        $conversation->otherUser($user)->notify(new NewMessageReceived($message));

        return back();
    }

    public function update(UpdateMessageRequest $request, Message $message): RedirectResponse
    {
        $message->update([
            'body' => $request->validated('body'),
            'edited_at' => now(),
        ]);

        return back()->with('status', 'Message modifié.');
    }

    public function unsend(Request $request, Message $message): RedirectResponse
    {
        abort_unless($message->sender_id === $request->user()->id, 403);

        $message->update(['body' => null, 'deleted_at' => now()]);

        $message->attachments->each(function (MessageAttachment $attachment) {
            Storage::disk('public')->delete($attachment->path);
            $attachment->delete();
        });

        return back()->with('status', 'Message supprimé.');
    }

    public function destroy(Request $request, Message $message): RedirectResponse
    {
        $user = $request->user();
        abort_unless($message->conversation->involves($user), 403);

        $message->hiddenFor()->syncWithoutDetaching([$user->id]);

        return back()->with('status', 'Message masqué.');
    }
}
