<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPostPublished extends Notification
{
    use Queueable;

    public function __construct(public Post $post) {}

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
            'type' => 'nouvelle_publication',
            'post_id' => $this->post->id,
            'actor_id' => $this->post->user_id,
        ];
    }
}
