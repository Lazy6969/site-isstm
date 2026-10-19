<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Password;

/**
 * Sent synchronously (not ShouldQueue) — see PreinscriptionReceived's
 * docblock for why: this dev environment can't keep a `queue:work` process
 * running continuously, which left this e-mail stuck undelivered.
 */
class PreinscriptionAccepted extends Notification
{
    public function __construct(public string $numeroDossier) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Carries its own password-setup link rather than pointing back at the one
     * sent when the account was opened: that first e-mail may never have been
     * read, and without a password the newly approved étudiant has no way in.
     * This is the only e-mail that ever carries this link — see
     * PreinscriptionReceived, sent at submission, which never does.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $passwordUrl = route('password.reset', [
            'token' => Password::createToken($notifiable),
            'email' => $notifiable->email,
        ]);

        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre dossier a été accepté',
                    'lines' => [
                        'Félicitations '.e($notifiable->name).' !',
                        "Votre dossier de préinscription à l'ISSTM Mahajanga a été accepté. Votre numéro de suivi de dossier est : <strong>{$this->numeroDossier}</strong>.",
                        'Définissez votre mot de passe ci-dessous, puis connectez-vous avec votre adresse e-mail pour accéder à votre espace étudiant.',
                        'Si ce lien a expiré, utilisez « Mot de passe oublié » sur la page de connexion.',
                    ],
                    'button' => ['text' => 'Définir mon mot de passe', 'url' => $passwordUrl],
                ],
            ],
        ])->subject('Votre dossier a été accepté — ISSTM Mahajanga');
    }
}
