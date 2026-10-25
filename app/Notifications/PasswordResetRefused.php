<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetRefused extends Notification
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
        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre demande de réinitialisation a été refusée',
                    'lines' => [
                        'Bonjour '.e($notifiable->name).',',
                        "L'administration de l'ISSTM Mahajanga n'a pas pu donner suite à votre demande de réinitialisation de mot de passe.",
                        'Si vous pensez qu\'il s\'agit d\'une erreur, rapprochez-vous de la scolarité.',
                    ],
                ],
            ],
        ])->subject('Demande de réinitialisation refusée — ISSTM Mahajanga');
    }
}
