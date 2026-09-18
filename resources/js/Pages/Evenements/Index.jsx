import { Head } from '@inertiajs/react';
import { Calendar, ClipboardList, GraduationCap, MapPin, PenSquare, Sun } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

const categoryIcons = {
    general: Calendar,
    examen: PenSquare,
    ceremonie: GraduationCap,
    atelier: ClipboardList,
    vacances: Sun,
    inscription: ClipboardList,
};

function formatDay(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit' });
}

function formatMonth(value) {
    return new Date(value).toLocaleDateString('fr-FR', { month: 'short' });
}

export default function Index({ evenements }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Événements" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-3xl font-bold">{t('evenements.titre', 'Événements à venir')}</h1>
                    <p className="mt-2 text-white/80">{t('evenements.soustitre', "Le calendrier des prochains rendez-vous de l'ISSTM.")}</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                {evenements.length === 0 ? (
                    <Card className="p-8 text-center text-sm text-slate-500">
                        {t('evenements.aucun_resultat', "Aucun événement à venir n'est programmé pour le moment.")}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {evenements.map((event) => {
                            const CategoryIcon = categoryIcons[event.categorie] ?? Calendar;
                            return (
                                <Card key={event.id} className="flex gap-4 p-5">
                                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-isstm-navy text-white">
                                        <span className="text-lg font-bold leading-none">{formatDay(event.date_debut)}</span>
                                        <span className="text-xs uppercase">{formatMonth(event.date_debut)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-isstm-navy">
                                            <CategoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                            {event.categorie}
                                        </span>
                                        <h2 className="mt-1 font-semibold text-slate-700">{event.titre}</h2>
                                        {event.lieu && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
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
            </main>

            <Footer />
        </div>
    );
}
