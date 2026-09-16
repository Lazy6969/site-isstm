import { Head } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

const categoryIcons = {
    general: '📅',
    examen: '📝',
    ceremonie: '🎓',
    atelier: '🧑‍🏫',
    vacances: '🏖️',
    inscription: '📋',
};

function formatDay(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit' });
}

function formatMonth(value) {
    return new Date(value).toLocaleDateString('fr-FR', { month: 'short' });
}

export default function Index({ evenements }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Événements" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-3xl font-bold">Événements à venir</h1>
                    <p className="mt-2 text-white/80">Le calendrier des prochains rendez-vous de l'ISSTM.</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                {evenements.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
                        Aucun événement à venir n'est programmé pour le moment.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {evenements.map((event) => (
                            <div key={event.id} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-isstm-navy text-white">
                                    <span className="text-lg font-bold leading-none">{formatDay(event.date_debut)}</span>
                                    <span className="text-xs uppercase">{formatMonth(event.date_debut)}</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-xs font-medium text-isstm-navy">
                                        {categoryIcons[event.categorie] ?? '📅'} {event.categorie}
                                    </span>
                                    <h2 className="mt-1 font-semibold text-slate-700">{event.titre}</h2>
                                    {event.lieu && <p className="mt-1 text-sm text-slate-500">📍 {event.lieu}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
