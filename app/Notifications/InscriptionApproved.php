<?php

namespace App\Notifications;

use App\TypeInscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InscriptionApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public TypeInscription $type, public string $classe) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre dossier a été accepté — ISSTM Mahajanga')
            ->greeting("Félicitations {$notifiable->name} !")
            ->line("Votre dossier de {$this->type->label()} à l'ISSTM Mahajanga a été accepté.")
            ->line("Vous êtes désormais inscrit(e) en : **{$this->classe}**")
            ->action('Se connecter', route('login'));
    }
}
