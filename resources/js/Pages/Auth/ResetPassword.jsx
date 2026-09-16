import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';

export default function ResetPassword({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({
        email,
        token,
        password: '',
        password_confirmation: '',
    });

    const criteria = [
        { key: 'length', label: 'Au moins 8 caractères', met: data.password.length >= 8 },
        { key: 'case', label: 'Majuscule et minuscule', met: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password) },
        { key: 'digit', label: 'Au moins un chiffre', met: /[0-9]/.test(data.password) },
    ];

    function submit(e) {
        e.preventDefault();
        post('/reinitialiser-mot-de-passe');
    }

    return (
        <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe pour votre compte.">
            <Head title="Réinitialiser le mot de passe" />

            <form onSubmit={submit} className="space-y-4">
                <TextField id="email" label="Adresse e-mail" type="email" value={data.email} readOnly className="bg-slate-50" />

                <TextField
                    id="password"
                    label="Nouveau mot de passe"
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
                            <span className={`h-1.5 w-1.5 rounded-full ${c.met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {c.label}
                        </li>
                    ))}
                </ul>

                <TextField
                    id="password_confirmation"
                    label="Confirmer le mot de passe"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    required
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    Réinitialiser le mot de passe
                </button>
            </form>
        </AuthLayout>
    );
}
