<?php

namespace App\Notifications;

use App\Models\ReactivationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to every admin holding `reactivations.manage` when a former student
 * asks for their account back — the admin-side counterpart of the community
 * bell, same shape as PreinscriptionSubmitted.
 */
class ReactivationRequested extends Notification
{
    use Queueable;

    public function __construct(public ReactivationRequest $reactivation) {}

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
            'type' => 'nouvelle_reactivation',
            'reactivation_id' => $this->reactivation->id,
            'actor_id' => $this->reactivation->user_id,
            'candidate_name' => $this->reactivation->user->name,
        ];
    }
}
