import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Send, UserCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import BackButton from '../../Components/Layout/BackButton';
import Footer from '../../Components/Home/Footer';
import TextField from '../../Components/Form/TextField';
import { useTranslations } from '../../lib/useTranslations';

export default function Verifier() {
    const { flash } = usePage().props;
    const { t } = useTranslations();
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });
    const [errorModal, setErrorModal] = useState('');

    useEffect(() => {
        if (flash?.error) {
            setErrorModal(flash.error);
        }
    }, [flash?.error]);

    function submit(e) {
        e.preventDefault();
        post('/ancien-etudiant');
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Ancien étudiant — Réactivation de compte" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <BackButton />
                    <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                        <UserCheck className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                        {t('reactivation.titre', 'Ancien étudiant')}
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        {t(
                            'reactivation.soustitre',
                            'Indiquez votre adresse e-mail et votre mot de passe pour demander la réactivation de votre compte étudiant.',
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-md px-6 py-12">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                    {flash?.status ? (
                        <p className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {flash.status}
                        </p>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t(
                                    'reactivation.explication',
                                    "Indiquez l'adresse e-mail et le mot de passe de votre ancien compte étudiant pour transmettre votre demande à la scolarité. Vous recevrez un e-mail dès qu'elle sera examinée.",
                                )}
                            </p>
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
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                            >
                                <Send className="h-4 w-4" aria-hidden="true" />
                                {t('reactivation.envoyer', 'Envoyer ma demande')}
                            </button>
                            <Link href="/login" className="flex items-center justify-center text-sm font-medium text-isstm-navy hover:underline dark:text-isstm-gold">
                                {t('auth.se_connecter', 'Se connecter')}
                            </Link>
                        </form>
                    )}
                </div>
            </main>

            <Footer />

            {errorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setErrorModal('')}>
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Compte introuvable</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{errorModal}</p>
                        <button
                            type="button"
                            onClick={() => setErrorModal('')}
                            className="mt-5 w-full rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
