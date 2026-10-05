<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Password;

class PreinscriptionAccepted extends Notification implements ShouldQueue
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
                        "Félicitations {$notifiable->name} !",
                        "Votre dossier de préinscription à l'ISSTM Mahajanga a été accepté. Votre matricule étudiant est : <strong>{$this->matricule}</strong>.",
                        'Définissez votre mot de passe ci-dessous, puis connectez-vous avec votre adresse e-mail pour accéder à votre espace étudiant.',
                        'Si ce lien a expiré, utilisez « Mot de passe oublié » sur la page de connexion.',
                    ],
                    'button' => ['text' => 'Définir mon mot de passe', 'url' => $passwordUrl],
                ],
                'en' => [
                    'heading' => 'Your application has been accepted',
                    'lines' => [
                        "Congratulations {$notifiable->name}!",
                        "Your ISSTM Mahajanga pre-registration application has been accepted. Your student ID is: <strong>{$this->matricule}</strong>.",
                        'Set your password below, then log in with your e-mail address to access your student space.',
                        'If this link has expired, use "Forgot password" on the login page.',
                    ],
                    'button' => ['text' => 'Set my password', 'url' => $passwordUrl],
                ],
                'mg' => [
                    'heading' => 'Noraisina ny antontan-taratasinao',
                    'lines' => [
                        "Arahaba {$notifiable->name}!",
                        "Noraisina ny taratasinao fisoratana anarana mialoha ao amin'ny ISSTM Mahajanga. Ny laharanao mpianatra dia: <strong>{$this->matricule}</strong>.",
                        "Mametraha ny tenimiafina eto ambany, avy eo midira amin'ny adiresy mailakao mba hidirana amin'ny toerana voatokana ho anao.",
                        "Raha lany daty io rohy io, ampiasao ny \"Hadino ny tenimiafina\" eo amin'ny pejy fidirana.",
                    ],
                    'button' => ['text' => 'Mametraka ny tenimiafiko', 'url' => $passwordUrl],
                ],
            ],
        ])->subject('Votre dossier a été accepté — ISSTM Mahajanga');
    }
}
