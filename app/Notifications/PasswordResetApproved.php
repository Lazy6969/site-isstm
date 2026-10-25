<?php

namespace App\Notifications;

use App\Models\PasswordResetRequest;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells the student their reset request was accepted and gives them the
 * temporary password to sign in with, until they choose their own.
 */
class PasswordResetApproved extends Notification
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
                    'heading' => 'Votre mot de passe a été réinitialisé',
                    'lines' => [
                        'Bonjour '.e($notifiable->name).',',
                        "Votre demande de réinitialisation de mot de passe a été acceptée par l'administration de l'ISSTM Mahajanga.",
                        'Votre mot de passe temporaire est : <strong>'.PasswordResetRequest::TEMPORARY_PASSWORD.'</strong>',
                        'Connectez-vous avec votre adresse e-mail et ce mot de passe, puis modifiez-le immédiatement depuis votre profil (Changer le mot de passe).',
                    ],
                    'button' => ['text' => 'Me connecter', 'url' => route('login')],
                ],
            ],
        ])->subject('Votre mot de passe a été réinitialisé — ISSTM Mahajanga');
    }
}
