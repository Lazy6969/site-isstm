<?php

namespace App\Notifications;

use App\Models\FriendRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FriendRequestReceived extends Notification
{
    use Queueable;

    public function __construct(public FriendRequest $friendRequest) {}

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
            'type' => 'demande_ami',
            'friend_request_id' => $this->friendRequest->id,
            'actor_id' => $this->friendRequest->sender_id,
        ];
    }
}
