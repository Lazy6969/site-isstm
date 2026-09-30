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
     */
    public function toMail(object $notifiable): MailMessage
    {
        $passwordUrl = route('password.reset', [
            'token' => Password::createToken($notifiable),
            'email' => $notifiable->email,
        ]);

        return (new MailMessage)
            ->subject('Votre dossier a été accepté — ISSTM Mahajanga')
            ->greeting("Félicitations {$notifiable->name} !")
            ->line("Votre dossier de préinscription à l'ISSTM Mahajanga a été accepté.")
            ->line("Votre matricule étudiant est : **{$this->matricule}**")
            ->line('Votre compte étudiant est désormais actif. Définissez votre mot de passe ci-dessous, puis connectez-vous avec votre adresse e-mail pour accéder à votre espace étudiant.')
            ->action('Définir mon mot de passe', $passwordUrl)
            ->line('Si ce lien a expiré, utilisez « Mot de passe oublié » sur la page de connexion.');
    }
}
