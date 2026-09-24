<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\MessageReaction;
use App\Models\User;
use App\ReactionType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->render($request);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();
        abort_unless($conversation->involves($user), 403);

        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->render($request, $conversation);
    }

    /**
     * Polled every few seconds while a conversation is open — whether the
     * other participant is online (User::isOnline(), refreshed by the
     * `activity` middleware) and currently typing (see typing() below).
     */
    public function status(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        abort_unless($conversation->involves($user), 403);

        $other = $conversation->otherUser($user);

        return response()->json([
            'online' => $other->isOnline(),
            'typing' => Cache::has($this->typingCacheKey($conversation, $other)),
        ]);
    }

    /**
     * Pinged (debounced) by the message textarea while the user types — sets
     * a short-lived flag the other participant's status() poll picks up.
     * Never persisted: a stale tab just stops refreshing it and it expires.
     */
    public function typing(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        abort_unless($conversation->involves($user), 403);

        Cache::put($this->typingCacheKey($conversation, $user), true, now()->addSeconds(5));

        return response()->json(['status' => 'ok']);
    }

    private function typingCacheKey(Conversation $conversation, User $user): string
    {
        return "typing:{$conversation->id}:{$user->id}";
    }

    public function store(Request $request, User $friend): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isFriendsWith($friend), 422, 'Vous devez être ami avec cette personne pour lui écrire.');

        [$userOneId, $userTwoId] = [$user->id, $friend->id];
        if ($userOneId > $userTwoId) {
            [$userOneId, $userTwoId] = [$userTwoId, $userOneId];
        }

        $conversation = Conversation::firstOrCreate([
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);

        return redirect()->route('messages.show', $conversation);
    }

    private function render(Request $request, ?Conversation $active = null): Response
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with(['userOne', 'userTwo'])
            ->withCount(['messages as unread_count' => fn ($query) => $query
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')])
            ->with(['messages' => fn ($query) => $query->latest()->limit(1)])
            ->get()
            ->map(fn (Conversation $conversation) => [
                'id' => $conversation->id,
                'user' => [
                    'id' => $conversation->otherUser($user)->id,
                    'name' => $conversation->otherUser($user)->name,
                    'avatar_path' => $conversation->otherUser($user)->avatar_path,
                    'online' => $conversation->otherUser($user)->isOnline(),
                ],
                'last_message' => $conversation->messages->first()?->body,
                'last_message_at' => $conversation->messages->first()?->created_at,
                'unread_count' => $conversation->unread_count,
            ])
            ->sortByDesc('last_message_at')
            ->values();

        $data = [
            'conversations' => $conversations,
            'friends' => $user->friends()->map(fn (User $friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'avatar_path' => $friend->avatar_path,
                'online' => $friend->isOnline(),
            ]),
        ];

        if ($active !== null) {
            $data['activeConversation'] = [
                'id' => $active->id,
                'user' => [
                    'id' => $active->otherUser($user)->id,
                    'name' => $active->otherUser($user)->name,
                    'avatar_path' => $active->otherUser($user)->avatar_path,
                    'online' => $active->otherUser($user)->isOnline(),
                ],
            ];

            $data['messages'] = Message::query()
                ->where('conversation_id', $active->id)
                ->whereDoesntHave('hiddenFor', fn ($query) => $query->where('users.id', $user->id))
                ->with(['attachments', 'replyTo.sender', 'forwardedFrom.sender', 'reactions.user:id,name'])
                ->orderBy('created_at')
                ->get()
                ->map(fn (Message $message) => $this->presentMessage($message, $user));

            $data['media'] = MessageAttachment::query()
                ->whereHas('message', fn ($query) => $query->where('conversation_id', $active->id))
                ->where('file_type', 'image')
                ->latest()
                ->get(['id', 'path', 'original_name']);
        }

        return Inertia::render('Messages/Index', $data);
    }

    /**
     * @return array<string, mixed>
     */
    private function presentMessage(Message $message, User $viewer): array
    {
        $reactionCounts = $message->reactions->countBy(fn (MessageReaction $reaction) => $reaction->type->value);
        $myReaction = $message->reactions->firstWhere('user_id', $viewer->id);

        return [
            'id' => $message->id,
            'sender_id' => $message->sender_id,
            'body' => $message->body,
            'created_at' => $message->created_at,
            'read_at' => $message->read_at,
            'edited_at' => $message->edited_at,
            'deleted_at' => $message->deleted_at,
            'attachments' => $message->attachments->map(fn (MessageAttachment $attachment) => [
                'id' => $attachment->id,
                'path' => $attachment->path,
                'original_name' => $attachment->original_name,
                'file_type' => $attachment->file_type,
            ]),
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'sender_name' => $message->replyTo->sender->name,
                'body' => $message->replyTo->deleted_at ? null : $message->replyTo->body,
            ] : null,
            'forwarded_from_sender' => $message->forwardedFrom?->sender->name,
            'reactions' => collect(ReactionType::cases())
                ->mapWithKeys(fn (ReactionType $type) => [$type->value => $reactionCounts->get($type->value, 0)]),
            'my_reaction' => $myReaction?->type->value,
        ];
    }
}
