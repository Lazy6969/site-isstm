<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = route('login');

        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre compte a été réactivé',
                    'lines' => [
                        "Bonjour {$notifiable->name},",
                        "Bonne nouvelle : votre compte étudiant à l'ISSTM Mahajanga a été réactivé par la scolarité.",
                        'Vous pouvez dès maintenant vous connecter avec votre adresse e-mail et votre mot de passe habituel.',
                    ],
                    'button' => ['text' => 'Me connecter', 'url' => $loginUrl],
                ],
                'en' => [
                    'heading' => 'Your account has been reactivated',
                    'lines' => [
                        "Hello {$notifiable->name},",
                        "Good news: your student account at ISSTM Mahajanga has been reactivated by the registrar's office.",
                        'You can now log in with your e-mail address and your usual password.',
                    ],
                    'button' => ['text' => 'Log in', 'url' => $loginUrl],
                ],
                'mg' => [
                    'heading' => 'Novohana indray ny kaontinao',
                    'lines' => [
                        "Manao ahoana {$notifiable->name},",
                        "Vaovao tsara: novohan'ny sampan-draharaha momba ny fianarana indray ny kaontinao mpianatra ao amin'ny ISSTM Mahajanga.",
                        "Afaka miditra amin'ny alalan'ny adiresy mailakao sy ny tenimiafinao mahazatra izao ianao.",
                    ],
                    'button' => ['text' => 'Hiditra', 'url' => $loginUrl],
                ],
            ],
        ])->subject('Votre compte a été réactivé — ISSTM Mahajanga');
    }
}
