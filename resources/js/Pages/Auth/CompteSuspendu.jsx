import { Head, Link } from '@inertiajs/react';
import { Ban, UserCheck } from 'lucide-react';
import AuthLayout from '../../Components/Auth/AuthLayout';

export default function CompteSuspendu() {
    return (
        <AuthLayout title="Compte suspendu">
            <Head title="Compte suspendu" />

            <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                    <Ban className="h-7 w-7 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    Votre compte est suspendu, veuillez faire une réinscription pour accéder à nouveau à votre compte.
                </p>

                <Link
                    href="/ancien-etudiant"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                    Faire une demande de réinscription
                </Link>
                <Link href="/login" className="mt-4 text-sm font-medium text-isstm-navy hover:underline dark:text-isstm-gold">
                    Retour à la connexion
                </Link>
            </div>
        </AuthLayout>
    );
}
