import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, LogIn } from 'lucide-react';
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

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <AuthLayout title={t('auth.connexion_titre', 'Connexion')} subtitle={t('auth.connexion_soustitre', 'Accédez à votre espace ISSTM.')}>
            <Head title="Connexion" />

            {errors.email && (
                <p className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {errors.email}
                </p>
            )}

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
        </AuthLayout>
    );
}
