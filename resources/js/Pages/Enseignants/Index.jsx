import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ teachers }) {
    const { t } = useTranslations();
    const [filter, setFilter] = useState('all');

    const categoryLabels = {
        permanent: t('enseignants.permanent', 'Permanent'),
        vacataire: t('enseignants.vacataire', 'Vacataire'),
    };

    const filtered = useMemo(
        () => (filter === 'all' ? teachers : teachers.filter((teacher) => teacher.category === filter)),
        [teachers, filter],
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Enseignants" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('enseignants.titre', 'Corps enseignant')}</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        {t(
                            'enseignants.soustitre',
                            'Une équipe pédagogique permanente et vacataire au service de la réussite des étudiants.',
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <Tabs value={filter} onValueChange={setFilter} className="mb-8">
                    <TabsList>
                        <TabsTrigger value="all">{t('enseignants.tous', 'Tous')}</TabsTrigger>
                        <TabsTrigger value="permanent">{t('enseignants.permanents', 'Permanents')}</TabsTrigger>
                        <TabsTrigger value="vacataire">{t('enseignants.vacataires', 'Vacataires')}</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((teacher) => (
                        <Card key={teacher.id} className="flex items-center gap-4 p-5">
                            <Avatar className="h-16 w-16 flex-shrink-0 ring-2 ring-isstm-navy/10">
                                <AvatarImage src={teacher.photo_path ? `/${teacher.photo_path}` : undefined} alt="" />
                                <AvatarFallback>{teacher.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-isstm-navy dark:text-white">{teacher.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{teacher.specialty}</p>
                                <Badge className="mt-1">{categoryLabels[teacher.category] ?? teacher.category}</Badge>
                            </div>
                        </Card>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400">{t('enseignants.aucun_resultat', 'Aucun enseignant dans cette catégorie.')}</p>
                )}
            </main>

            <Footer />
        </div>
    );
}
