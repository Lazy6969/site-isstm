<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivated extends Notification
{
    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = route('login');

        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre compte a été réactivé',
                    'lines' => [
                        'Bonjour '.e($notifiable->name).',',
                        "Bonne nouvelle : votre compte étudiant à l'ISSTM Mahajanga a été réactivé par la scolarité.",
                        'Vous pouvez dès maintenant vous connecter avec votre adresse e-mail et votre mot de passe habituel.',
                    ],
                    'button' => ['text' => 'Me connecter', 'url' => $loginUrl],
                ],
            ],
        ])->subject('Votre compte a été réactivé — ISSTM Mahajanga');
    }
}
