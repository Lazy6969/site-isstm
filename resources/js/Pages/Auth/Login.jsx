import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';

export default function Login() {
    const { flash } = usePage().props;
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
        <AuthLayout title="Connexion" subtitle="Accédez à votre espace ISSTM.">
            <Head title="Connexion" />

            {flash?.status && (
                <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.status}</p>
            )}

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

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                        />
                        Se souvenir de moi
                    </label>
                    <Link href="/mot-de-passe-oublie" className="font-medium text-isstm-navy hover:underline">
                        Mot de passe oublié ?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    Se connecter
                </button>
            </form>
        </AuthLayout>
    );
}
