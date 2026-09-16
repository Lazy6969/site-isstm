import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '../../Components/Auth/AuthLayout';
import TextField from '../../Components/Form/TextField';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/mot-de-passe-oublie');
    }

    return (
        <AuthLayout
            title="Mot de passe oublié"
            subtitle="Indiquez votre e-mail, nous vous enverrons un lien de réinitialisation."
        >
            <Head title="Mot de passe oublié" />

            {flash?.status ? (
                <div>
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.status}</p>
                    <Link href="/login" className="mt-4 inline-block text-sm font-medium text-isstm-navy hover:underline">
                        ← Retour à la connexion
                    </Link>
                </div>
            ) : (
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                        Envoyer le lien
                    </button>

                    <Link href="/login" className="block text-center text-sm font-medium text-isstm-navy hover:underline">
                        ← Retour à la connexion
                    </Link>
                </form>
            )}
        </AuthLayout>
    );
}
