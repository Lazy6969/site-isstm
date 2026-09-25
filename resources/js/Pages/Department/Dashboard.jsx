import { Head, router, usePage } from '@inertiajs/react';
import { ExternalLink, LogOut } from 'lucide-react';

const STAT_LABELS = {
    etudiants: 'Étudiants',
    inscriptions: 'Inscriptions',
    classes: 'Niveaux',
    preinscriptions_en_attente: 'Préinscriptions en attente',
};

export default function Dashboard({ label, stats, links }) {
    const { auth } = usePage().props;

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Head title={`Espace ${label}`} />

            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <img src="/images/logo-isstm.svg" alt="ISSTM" className="h-9 w-auto" />
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Espace {label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Connecté en tant que {auth.user?.name}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Déconnexion
                </button>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Bienvenue, {auth.user?.name}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Espace {label} — accès distinct de l'administration principale, protégé par une clé propre à ce département.
                </p>

                {stats && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{STAT_LABELS[key] ?? key}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Accès rapide</p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {links.map((link) => (
                            <a
                                key={link.url}
                                href={link.url}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-isstm-navy/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                                {link.label}
                                <ExternalLink className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                    {!stats && (
                        <p className="mt-4 text-xs text-slate-400">
                            Fonctionnalités dédiées à l'espace {label} à venir — en attendant, utilisez le tableau de bord de l'administration
                            ci-dessus.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
