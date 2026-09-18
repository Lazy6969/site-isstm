import { Head, useForm } from '@inertiajs/react';
import { Check, Circle, KeyRound } from 'lucide-react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';
import { useTranslations } from '../../lib/useTranslations';

export default function ResetPassword({ email, token }) {
    const { t } = useTranslations();
    const { data, setData, post, processing, errors } = useForm({
        email,
        token,
        password: '',
        password_confirmation: '',
    });

    const criteria = [
        { key: 'length', label: t('auth.critere_longueur', 'Au moins 8 caractères'), met: data.password.length >= 8 },
        { key: 'case', label: t('auth.critere_casse', 'Majuscule et minuscule'), met: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password) },
        { key: 'digit', label: t('auth.critere_chiffre', 'Au moins un chiffre'), met: /[0-9]/.test(data.password) },
    ];

    function submit(e) {
        e.preventDefault();
        post('/reinitialiser-mot-de-passe');
    }

    return (
        <AuthLayout
            title={t('auth.nouveau_mot_de_passe_titre', 'Nouveau mot de passe')}
            subtitle={t('auth.nouveau_mot_de_passe_soustitre', 'Choisissez un nouveau mot de passe pour votre compte.')}
        >
            <Head title="Réinitialiser le mot de passe" />

            <form onSubmit={submit} className="space-y-4">
                <TextField id="email" label={t('auth.email', 'Adresse e-mail')} type="email" value={data.email} readOnly className="bg-slate-50" />

                <TextField
                    id="password"
                    label={t('auth.nouveau_mot_de_passe', 'Nouveau mot de passe')}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    autoFocus
                    required
                />

                <ul className="space-y-1 text-xs">
                    {criteria.map((c) => (
                        <li key={c.key} className={`flex items-center gap-2 ${c.met ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {c.met ? (
                                <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                            ) : (
                                <Circle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                            )}
                            {c.label}
                        </li>
                    ))}
                </ul>

                <TextField
                    id="password_confirmation"
                    label={t('auth.confirmer_mot_de_passe', 'Confirmer le mot de passe')}
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    required
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    {t('auth.reinitialiser_mot_de_passe', 'Réinitialiser le mot de passe')}
                </button>
            </form>
        </AuthLayout>
    );
}
