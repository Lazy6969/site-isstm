<?php

namespace App\Services;

use App\Models\ClassGroupMember;
use App\Models\ClassGroupMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Collection;

class ConversationListBuilder
{
    /**
     * The unified list of 1-to-1 conversations and class-group chats for
     * $user, merged and sorted by last activity — shared by the /messages
     * page (ConversationController) and the community feed's right sidebar
     * (PostController) so both stay in sync without duplicating the query.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function forUser(User $user): Collection
    {
        $dms = Conversation::query()
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
                'kind' => 'dm',
                'user' => [
                    'id' => $conversation->otherUser($user)->id,
                    'name' => $conversation->otherUser($user)->name,
                    'avatar_path' => $conversation->otherUser($user)->avatar_path,
                    'online' => $conversation->otherUser($user)->isOnline(),
                ],
                'last_message' => $conversation->messages->first()?->body,
                'last_message_at' => $conversation->messages->first()?->created_at,
                'unread_count' => $conversation->unread_count,
            ]);

        $groups = ClassGroupMember::query()
            ->where('user_id', $user->id)
            ->where('is_banned', false)
            ->with('classGroup')
            ->get()
            ->map(function (ClassGroupMember $membership) use ($user) {
                $group = $membership->classGroup;
                $lastMessage = ClassGroupMessage::query()->where('class_group_id', $group->id)->latest()->first();

                return [
                    'id' => $group->id,
                    'kind' => 'groupe',
                    'name' => $group->name,
                    'last_message' => $lastMessage?->deleted_for_everyone_at ? null : $lastMessage?->body,
                    'last_message_at' => $lastMessage?->created_at,
                    'unread_count' => $group->unreadCountFor($user, $membership->last_read_at),
                ];
            });

        return $dms->concat($groups)->sortByDesc('last_message_at')->values();
    }
}
