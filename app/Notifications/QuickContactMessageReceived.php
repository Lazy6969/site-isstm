<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent to the Contact page's configurable recipient address
 * (contact_formulaire_email, editable via quick-edit — see
 * QuickContactController) when a visitor uses the quick-send form there.
 * A plain MailMessage rather than the trilingual template the candidate-
 * facing notifications use: this one is read by ISSTM staff, not a visitor
 * picking their own language. The default ->line()/->subject() builder
 * renders through Laravel's Markdown engine, which escapes HTML by default
 * (config('mail.markdown') → html_input: escape) — unlike the trilingual
 * view's raw {!! !!} output, so none of these visitor-supplied fields need
 * manual escaping here.
 *
 * Sent synchronously (not ShouldQueue), same reasoning as
 * PreinscriptionReceived: this dev environment can't keep a `queue:work`
 * process running continuously, which would leave the message undelivered.
 */
class QuickContactMessageReceived extends Notification
{
    public function __construct(
        public string $objet,
        public string $nom,
        public string $prenoms,
        public string $fromEmail,
        public ?string $telephone,
        public string $body,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Nouveau message via le site — {$this->objet}")
            ->replyTo($this->fromEmail, "{$this->prenoms} {$this->nom}")
            ->line('Un visiteur a utilisé le formulaire de contact rapide du site.')
            ->line("Objet : {$this->objet}")
            ->line("Expéditeur : {$this->prenoms} {$this->nom} ({$this->fromEmail})");

        if ($this->telephone) {
            $mail->line("Téléphone : {$this->telephone}");
        }

        return $mail->line('Message :')->line($this->body);
    }
}
