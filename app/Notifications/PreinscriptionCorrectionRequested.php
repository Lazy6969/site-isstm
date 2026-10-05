<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PreinscriptionCorrectionRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $commentaire) {}

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
            ->subject('Votre dossier de préinscription doit être complété — ISSTM Mahajanga')
            ->greeting("Bonjour {$notifiable->name},")
            ->line("La scolarité a examiné votre dossier de préinscription et a besoin d'informations ou de pièces complémentaires avant de pouvoir se prononcer.")
            ->line("Précisions : {$this->commentaire}")
            ->line('Connectez-vous pour compléter votre dossier et le soumettre à nouveau.')
            ->action('Compléter mon dossier', route('preinscription.create'));
    }
}
