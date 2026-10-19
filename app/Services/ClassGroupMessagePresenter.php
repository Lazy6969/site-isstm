<?php

namespace App\Services;

use App\Models\ClassGroupMessage;
use App\Models\ClassGroupMessageReaction;
use App\Models\User;
use App\ReactionType;

/**
 * Shapes a ClassGroupMessage for the frontend — shared by ConversationController
 * (the unified /messages panel) and ClassGroupController (the group's own
 * /groupes/{group} page) so both present reply/reactions identically.
 * Callers must eager-load ['sender', 'attachments', 'replyTo.sender', 'reactions.user'].
 */
class ClassGroupMessagePresenter
{
    /**
     * @return array<string, mixed>
     */
    public function present(ClassGroupMessage $message, User $viewer): array
    {
        $reactionCounts = $message->reactions->countBy(fn (ClassGroupMessageReaction $reaction) => $reaction->type->value);
        $myReaction = $message->reactions->firstWhere('user_id', $viewer->id);

        return [
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
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'sender_name' => $message->replyTo->sender->name,
                'body' => $message->replyTo->deleted_for_everyone_at ? null : $message->replyTo->body,
            ] : null,
            'reactions' => collect(ReactionType::cases())
                ->mapWithKeys(fn (ReactionType $type) => [$type->value => $reactionCounts->get($type->value, 0)]),
            'my_reaction' => $myReaction?->type->value,
        ];
    }
}
