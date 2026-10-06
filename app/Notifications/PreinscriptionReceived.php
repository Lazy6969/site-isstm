<?php

namespace App\Notifications;

use App\Models\Candidat;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The only e-mail a candidate gets right after submitting their dossier —
 * no password-setup link here, since nothing worth protecting with a real
 * password exists yet (the account stays accessible through the session
 * that's already logged in). That link only comes later, in
 * PreinscriptionAccepted, once the dossier is actually approved.
 *
 * Sent synchronously (not ShouldQueue): this dev environment can't keep a
 * `queue:work` process running continuously, which left queued candidate
 * e-mails stuck undelivered — sending inline guarantees delivery without
 * depending on a worker being up.
 */
class PreinscriptionReceived extends Notification
{
    public function __construct(public Candidat $preinscription) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $numero = $this->preinscription->numero_dossier;
        $dossierUrl = route('dossier.suivi', $numero ? ['numero' => $numero] : []);

        return (new MailMessage)->view('emails.trilingual', [
            'sections' => [
                'fr' => [
                    'heading' => 'Votre préinscription a bien été reçue',
                    'lines' => [
                        "Bonjour {$notifiable->name},",
                        "Nous avons bien reçu votre dossier de préinscription à l'ISSTM Mahajanga. Il sera examiné par notre service de la scolarité, qui vous tiendra informé(e) par e-mail de la décision.",
                        $numero ? "Numéro de dossier : <strong>{$numero}</strong>" : '',
                    ],
                    'button' => ['text' => 'Voir le suivi de mon dossier', 'url' => $dossierUrl],
                ],
                'en' => [
                    'heading' => 'Your application has been received',
                    'lines' => [
                        "Hello {$notifiable->name},",
                        'We have received your ISSTM Mahajanga pre-registration application. It will be reviewed by our admissions office, who will let you know their decision by e-mail.',
                        $numero ? "File number: <strong>{$numero}</strong>" : '',
                    ],
                    'button' => ['text' => 'Track my application', 'url' => $dossierUrl],
                ],
                'mg' => [
                    'heading' => 'Voaray ny fisoratana anaranao',
                    'lines' => [
                        "Manao ahoana {$notifiable->name},",
                        "Efa noraisinay ny taratasinao fisoratana anarana mialoha ao amin'ny ISSTM Mahajanga. Hodinihin'ny sampandraharaha momba ny fampianarana izany, ary hampahafantarina anao amin'ny mailaka ny fanapahan-kevitra.",
                        $numero ? "Laharan'ny antontan-taratasy: <strong>{$numero}</strong>" : '',
                    ],
                    'button' => ['text' => "Jereo ny fivoaran'ny antontan-taratasiko", 'url' => $dossierUrl],
                ],
            ],
        ])->subject('Votre préinscription a bien été reçue — ISSTM Mahajanga');
    }
}
