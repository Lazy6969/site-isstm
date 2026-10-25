<?php

namespace App\Notifications;

use App\Models\PasswordResetRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to every admin holding `security.manage` when a student asks for a
 * password reset — shows up in the admin bell and points at the Sécurité screen.
 */
class PasswordResetRequested extends Notification
{
    use Queueable;

    public function __construct(public PasswordResetRequest $request) {}

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
            'type' => 'demande_reinitialisation',
            'actor_id' => $this->request->user_id,
            'candidate_name' => $this->request->user->name,
        ];
    }
}
