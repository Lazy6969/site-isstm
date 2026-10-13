<?php

namespace App\Notifications;

use App\EcolageStatus;
use App\Models\EcolagePayment;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a student what became of a versement they declared. Sent synchronously
 * (not queued) like the other decision e-mails — this environment can't keep a
 * queue worker running.
 */
class EcolagePaymentReviewed extends Notification
{
    public function __construct(public EcolagePayment $payment) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $amount = number_format($this->payment->amount, 0, ',', ' ').' Ar';
        $accepted = $this->payment->status === EcolageStatus::Valide;

        $message = (new MailMessage)
            ->subject($accepted ? 'Votre versement a été validé — ISSTM Mahajanga' : "Votre versement n'a pas pu être validé — ISSTM Mahajanga")
            ->greeting("Bonjour {$notifiable->name},");

        if ($accepted) {
            return $message
                ->line("Votre versement de {$amount} (référence {$this->payment->reference}) a été validé par la scolarité.")
                ->action('Voir mes versements', route('ecolage.index'));
        }

        $message->line("Votre versement de {$amount} (référence {$this->payment->reference}) n'a pas pu être validé.");

        if ($this->payment->motif_refus) {
            $message->line("Motif : {$this->payment->motif_refus}");
        }

        return $message
            ->line('Vous pouvez déclarer à nouveau votre versement avec des justificatifs corrects.')
            ->action('Déclarer un versement', route('ecolage.index'));
    }
}
