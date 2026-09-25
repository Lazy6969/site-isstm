import { Head, useForm } from '@inertiajs/react';
import { KeyRound, LogIn } from 'lucide-react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';

export default function DepartmentLogin({ department, label }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        access_key: '',
    });

    function submit(e) {
        e.preventDefault();
        post(`/login`);
    }

    return (
        <AuthLayout title={`Espace ${label}`} subtitle="Accès réservé — identifiant, mot de passe et clé d'accès du département.">
            <Head title={`Connexion — ${label}`} />

            <form onSubmit={submit} className="space-y-4">
                <TextField
                    id="email"
                    label="Adresse e-mail"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    autoFocus
                    required
                />
                <TextField
                    id="password"
                    label="Mot de passe"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />
                <TextField
                    id="access_key"
                    label="Clé d'accès du département"
                    type="password"
                    value={data.access_key}
                    onChange={(e) => setData('access_key', e.target.value)}
                    error={errors.access_key}
                    required
                />

                <p className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <KeyRound className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    Clé fournie et gérée par le Super Administrateur — si elle est désactivée, l'accès est refusé même avec le bon mot de passe.
                </p>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Se connecter — {label}
                </button>
            </form>
        </AuthLayout>
    );
}
