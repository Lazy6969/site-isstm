<?php

namespace App\Notifications;

use App\Models\Inscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Sent to every admin holding `inscriptions.edit` when a student submits a
 * réinscription/redoublement dossier — the self-service counterpart of
 * PreinscriptionSubmitted, through the same database-notifications setup.
 */
class InscriptionDossierSubmitted extends Notification
{
    use Queueable;

    public function __construct(public Inscription $inscription) {}

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
            'type' => 'nouveau_dossier_inscription',
            'inscription_id' => $this->inscription->id,
            'actor_id' => $this->inscription->etudiant->user_id,
            'candidate_name' => $this->inscription->etudiant->user->name,
            'dossier_type' => $this->inscription->type?->value,
        ];
    }
}
