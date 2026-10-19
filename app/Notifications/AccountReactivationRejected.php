<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivationRejected extends Notification
{
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
        $motifLine = $this->motif !== null && $this->motif !== '' ? 'Motif : '.e($this->motif) : '';

        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre compte a été refusé',
                    'lines' => [
                        'Bonjour '.e($notifiable->name).',',
                        "Après étude de votre demande, la scolarité de l'ISSTM Mahajanga n'est pas en mesure de réactiver votre compte pour le moment.",
                        $motifLine,
                        "N'hésitez pas à contacter la scolarité pour plus d'informations.",
                    ],
                ],
            ],
        ])->subject('Votre demande de réactivation — ISSTM Mahajanga');
    }
}
