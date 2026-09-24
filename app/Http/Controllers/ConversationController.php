<?php

namespace App\Http\Controllers;

use App\Models\ClassGroup;
use App\Models\ClassGroupMessage;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\MessageReaction;
use App\Models\User;
use App\ReactionType;
use App\Services\ConversationListBuilder;
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
     * Opens a class group's chat inside the same unified /messages interface
     * as 1-to-1 conversations (merged conversation list, same chat panel
     * layout) — the group's own richer page (announcements, presence,
     * members, moderation) stays at /groupes/{group}, linked from here via
     * the "Plus" button rather than duplicated inline.
     */
    public function showGroup(Request $request, ClassGroup $group): Response
    {
        $user = $request->user();
        $membership = $group->memberFor($user);
        abort_if($membership === null || $membership->is_banned, 403);

        $membership->update(['last_read_at' => now()]);

        return $this->render($request, activeGroup: $group);
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

    private function render(Request $request, ?Conversation $active = null, ?ClassGroup $activeGroup = null): Response
    {
        $user = $request->user();

        $conversations = app(ConversationListBuilder::class)->forUser($user);

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
                'kind' => 'dm',
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
                ->latest()
                ->get(['id', 'path', 'original_name', 'file_type', 'created_at']);
        }

        if ($activeGroup !== null) {
            $data['activeConversation'] = [
                'id' => $activeGroup->id,
                'kind' => 'groupe',
                'name' => $activeGroup->name,
                'member_count' => $activeGroup->members()->where('is_banned', false)->count(),
            ];

            $data['groupMessages'] = ClassGroupMessage::query()
                ->where('class_group_id', $activeGroup->id)
                ->whereDoesntHave('hiddenFor', fn ($query) => $query->where('users.id', $user->id))
                ->with(['sender', 'attachments'])
                ->orderBy('created_at')
                ->get()
                ->map(fn (ClassGroupMessage $message) => [
                    'id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'sender_avatar_path' => $message->sender->avatar_path,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'deleted_for_everyone' => $message->deleted_for_everyone_at !== null,
                    'attachments' => $message->attachments->map(fn ($a) => [
                        'id' => $a->id,
                        'path' => $a->path,
                        'original_name' => $a->original_name,
                        'file_type' => $a->file_type,
                    ]),
                ]);
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
