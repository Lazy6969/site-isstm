<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivationRejected extends Notification implements ShouldQueue
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
        $motifLine = $this->motif !== null && $this->motif !== '' ? "Motif : {$this->motif}" : '';
        $motifLineEn = $this->motif !== null && $this->motif !== '' ? "Reason: {$this->motif}" : '';
        $motifLineMg = $this->motif !== null && $this->motif !== '' ? "Antony: {$this->motif}" : '';

        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre compte a été refusé',
                    'lines' => [
                        "Bonjour {$notifiable->name},",
                        "Après étude de votre demande, la scolarité de l'ISSTM Mahajanga n'est pas en mesure de réactiver votre compte pour le moment.",
                        $motifLine,
                        "N'hésitez pas à contacter la scolarité pour plus d'informations.",
                    ],
                ],
                'en' => [
                    'heading' => 'Your account request was declined',
                    'lines' => [
                        "Hello {$notifiable->name},",
                        "After reviewing your request, ISSTM Mahajanga's registrar's office is unable to reactivate your account at this time.",
                        $motifLineEn,
                        'Feel free to contact the registrar\'s office for more information.',
                    ],
                ],
                'mg' => [
                    'heading' => 'Nolavina ny kaontinao',
                    'lines' => [
                        "Manao ahoana {$notifiable->name},",
                        "Rehefa nodinihina ny fangatahanao, dia tsy afaka mamerina ny kaontinao amin'izao fotoana izao ny sampan-draharaha momba ny fianarana ao amin'ny ISSTM Mahajanga.",
                        $motifLineMg,
                        "Aza misalasala mifandray amin'ny sampan-draharaha momba ny fianarana raha mila fanazavana fanampiny.",
                    ],
                ],
            ],
        ])->subject('Votre demande de réactivation — ISSTM Mahajanga');
    }
}
