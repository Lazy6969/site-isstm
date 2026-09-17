<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CommentReplied extends Notification
{
    use Queueable;

    public function __construct(public Comment $reply) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'reponse_commentaire',
            'post_id' => $this->reply->post_id,
            'comment_id' => $this->reply->id,
            'actor_id' => $this->reply->user_id,
        ];
    }
}
