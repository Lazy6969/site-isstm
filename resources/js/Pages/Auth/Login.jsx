import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn, XCircle } from 'lucide-react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';
import { useTranslations } from '../../lib/useTranslations';

export default function Login() {
    const { t } = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [errorModal, setErrorModal] = useState('');

    function submit(e) {
        e.preventDefault();
        // Read the failure straight off this submit's own onError callback
        // rather than only off the shared `errors` state read in JSX below —
        // this fires exactly once per failed attempt, so the modal can't be
        // missed the way an inline banner further down the page could be.
        post('/login', {
            onError: (formErrors) => {
                if (formErrors.email) {
                    setErrorModal(formErrors.email);
                }
            },
        });
    }

    return (
        <AuthLayout title={t('auth.connexion_titre', 'Connexion')} subtitle={t('auth.connexion_soustitre', 'Accédez à votre espace ISSTM.')}>
            <Head title="Connexion" />

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
                <TextField
                    id="password"
                    label={t('auth.mot_de_passe', 'Mot de passe')}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                        />
                        {t('auth.se_souvenir', 'Se souvenir de moi')}
                    </label>
                    <Link href="/mot-de-passe-oublie" className="font-medium text-isstm-navy hover:underline dark:text-isstm-gold">
                        {t('auth.mot_de_passe_oublie', 'Mot de passe oublié ?')}
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    {t('nav.se_connecter', 'Se connecter')}
                </button>
            </form>

            {errorModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setErrorModal('')}
                >
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                            {t('auth.connexion_echouee', 'Connexion impossible')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{errorModal}</p>
                        <button
                            type="button"
                            onClick={() => setErrorModal('')}
                            className="mt-5 w-full rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            {t('auth.reessayer', 'Réessayer')}
                        </button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
