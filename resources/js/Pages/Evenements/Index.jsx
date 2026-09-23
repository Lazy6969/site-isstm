import { Head } from '@inertiajs/react';
import { Calendar, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import EventCalendar from '../../Components/Evenements/EventCalendar';
import { CATEGORY_META } from '../../Components/Evenements/categoryMeta';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

function formatDay(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit' });
}

function formatMonth(value) {
    return new Date(value).toLocaleDateString('fr-FR', { month: 'short' });
}

export default function Index({ evenements, calendrier }) {
    const { t } = useTranslations();
    const [category, setCategory] = useState('tous');

    const upcoming = useMemo(
        () => evenements.filter((event) => category === 'tous' || event.categorie === category),
        [evenements, category],
    );

    const availableCategories = useMemo(
        () => [...new Set(evenements.map((event) => event.categorie))],
        [evenements],
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Événements" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('evenements.titre', 'Événements à venir')}</h1>
                    <p className="mt-2 text-white/80">{t('evenements.soustitre', "Le calendrier des prochains rendez-vous de l'ISSTM.")}</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
                {calendrier.length > 0 && <EventCalendar evenements={calendrier} />}

                <section>
                    {availableCategories.length > 1 && (
                        <div className="mb-5 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setCategory('tous')}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                    category === 'tous'
                                        ? 'bg-isstm-navy text-white'
                                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                                }`}
                            >
                                {t('evenements.filtre_tous', 'Tous')}
                            </button>
                            {availableCategories.map((cat) => {
                                const meta = CATEGORY_META[cat] ?? CATEGORY_META.general;
                                const Icon = meta.icon;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                                            category === cat
                                                ? 'text-white'
                                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                                        }`}
                                        style={category === cat ? { backgroundColor: meta.color } : undefined}
                                    >
                                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {upcoming.length === 0 ? (
                        <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            {t('evenements.aucun_resultat', "Aucun événement à venir n'est programmé pour le moment.")}
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {upcoming.map((event) => {
                                const meta = CATEGORY_META[event.categorie] ?? CATEGORY_META.general;
                                const CategoryIcon = meta.icon ?? Calendar;
                                return (
                                    <Card key={event.id} className="flex gap-4 p-5">
                                        <div
                                            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                                            style={{ backgroundColor: meta.color }}
                                        >
                                            <span className="text-lg font-bold leading-none">{formatDay(event.date_debut)}</span>
                                            <span className="text-xs uppercase">{formatMonth(event.date_debut)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-isstm-navy capitalize dark:text-white">
                                                <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                                {event.categorie}
                                            </span>
                                            <h2 className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{event.titre}</h2>
                                            {event.lieu && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                                    {event.lieu}
                                                </p>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
