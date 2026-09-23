import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import { useTranslations } from '../../lib/useTranslations';

export default function VerifyEmail({ status }) {
    const { flash } = usePage().props;
    const { t } = useTranslations();
    const [sending, setSending] = useState(false);

    function resend() {
        setSending(true);
        router.post('/verifier-email', {}, { onFinish: () => setSending(false) });
    }

    const message = flash?.status ?? status;

    return (
        <AuthLayout
            title={t('auth.verifier_email_titre', 'Votre dossier a bien été reçu !')}
            subtitle={t(
                'auth.verifier_email_soustitre',
                "Il ne reste qu'une étape : un lien vient d'être envoyé à votre adresse e-mail. Cliquez dessus pour activer votre compte et suivre votre dossier.",
            )}
        >
            <Head title="Vérifiez votre e-mail" />

            <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-isstm-navy/10 dark:bg-white/10">
                    <MailCheck className="h-8 w-8 text-isstm-navy dark:text-white" aria-hidden="true" />
                </div>

                {message && (
                    <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {message}
                    </p>
                )}

                <button
                    type="button"
                    onClick={resend}
                    disabled={sending}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    {sending
                        ? t('auth.envoi_en_cours', 'Envoi en cours…')
                        : t('auth.renvoyer_email_verification', "Renvoyer l'e-mail de vérification")}
                </button>

                <Link href="/login" className="mt-4 text-sm font-medium text-isstm-navy hover:underline dark:text-isstm-gold">
                    {t('auth.retour_connexion', 'Retour à la connexion')}
                </Link>
            </div>
        </AuthLayout>
    );
}
