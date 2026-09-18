import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';
import { useTranslations } from '../../lib/useTranslations';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const { t } = useTranslations();
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/mot-de-passe-oublie');
    }

    return (
        <AuthLayout
            title={t('auth.mot_de_passe_oublie_titre', 'Mot de passe oublié')}
            subtitle={t('auth.mot_de_passe_oublie_soustitre', 'Indiquez votre e-mail, nous vous enverrons un lien de réinitialisation.')}
        >
            <Head title="Mot de passe oublié" />

            {flash?.status ? (
                <div>
                    <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {flash.status}
                    </p>
                    <Link href="/login" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-isstm-gold">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('auth.retour_connexion', 'Retour à la connexion')}
                    </Link>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <TextField
                        id="email"
                        label={t('auth.email', 'Adresse e-mail')}
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        autoFocus
                        required
                    />

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        {t('auth.envoyer_lien', 'Envoyer le lien')}
                    </button>

                    <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-isstm-gold">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('auth.retour_connexion', 'Retour à la connexion')}
                    </Link>
                </form>
            )}
        </AuthLayout>
    );
}
