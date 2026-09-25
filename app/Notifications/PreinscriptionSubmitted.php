<?php

namespace App\Notifications;

use App\Models\Preinscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to every admin holding `preinscriptions.manage` when a candidate
 * submits a dossier — the admin-side counterpart of the community bell,
 * through the same generic notifiable/database-notifications setup.
 */
class PreinscriptionSubmitted extends Notification
{
    use Queueable;

    public function __construct(public Preinscription $preinscription) {}

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
            'type' => 'nouvelle_preinscription',
            'preinscription_id' => $this->preinscription->id,
            'actor_id' => $this->preinscription->user_id,
            'candidate_name' => trim("{$this->preinscription->nom} {$this->preinscription->prenoms}"),
        ];
    }
}
