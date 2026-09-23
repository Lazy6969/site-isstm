<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PreinscriptionAccepted extends Notification
{
    use Queueable;

    public function __construct(public string $matricule) {}

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
            ->line("Votre dossier de préinscription à l'ISSTM Mahajanga a été accepté.")
            ->line("Votre matricule étudiant est : **{$this->matricule}**")
            ->line('Vous pouvez dès à présent vous connecter avec votre e-mail et le mot de passe choisi lors de votre candidature pour accéder à votre espace étudiant.')
            ->action('Se connecter', route('login'));
    }
}
