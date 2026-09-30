<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InscriptionRefused extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ?string $motif = null) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Votre dossier d\'inscription — ISSTM Mahajanga')
            ->greeting("Bonjour {$notifiable->name},")
            ->line('Après étude de votre dossier, nous ne sommes malheureusement pas en mesure de le valider.');

        if ($this->motif !== null && $this->motif !== '') {
            $message->line("Motif : {$this->motif}");
        }

        return $message->line("N'hésitez pas à nous contacter pour toute question.");
    }
}
