import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import EditableText from '../../Components/QuickEdit/EditableText';
import { Card } from '../../Components/ui/card';
import { Skeleton } from '../../Components/ui/skeleton';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ query, results }) {
    const { t } = useTranslations();
    const { content } = usePage().props;
    const [term, setTerm] = useState(query ?? '');
    const [loading, setLoading] = useState(false);
    const sections = Object.entries(results ?? {}).filter(([, items]) => items.length > 0);
    const totalResults = sections.reduce((sum, [, items]) => sum + items.length, 0);

    const sectionLabels = {
        filieres: t('nav.filieres', 'Filières'),
        enseignants: t('nav.enseignants', 'Enseignants'),
        actualites: t('nav.actualites', 'Actualités'),
        campus: t('nav.campus', 'Campus'),
        galerie: t('nav.galerie', 'Galerie'),
        evenements: t('nav.evenements', 'Événements'),
        documents: t('nav.documents', 'Documents'),
    };

    function submit(e) {
        e.preventDefault();
        router.get(
            '/recherche',
            { q: term },
            { preserveState: true, onStart: () => setLoading(true), onFinish: () => setLoading(false) },
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Recherche" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="recherche_titre">
                            {content.recherche_titre ?? t('nav.recherche', 'Recherche')}
                        </EditableText>
                    </h1>
                    <form onSubmit={submit} className="mt-5 flex gap-2">
                        <input
                            type="search"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            placeholder={t('recherche.placeholder', 'Rechercher une filière, un enseignant, une actualité…')}
                            className="w-full rounded-full border-0 px-5 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-isstm-gold"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="flex shrink-0 items-center gap-2 rounded-full bg-isstm-gold px-6 py-3 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                        >
                            <Search className="h-4 w-4" aria-hidden="true" />
                            {t('nav.rechercher', 'Rechercher')}
                        </button>
                    </form>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                {loading ? (
                    <div className="space-y-10">
                        {[0, 1].map((section) => (
                            <section key={section}>
                                <Skeleton className="mb-3 h-3.5 w-24" />
                                <Card className="overflow-hidden">
                                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {[0, 1, 2].map((row) => (
                                            <li key={row} className="space-y-2 px-5 py-3">
                                                <Skeleton className="h-3.5 w-2/3" />
                                                <Skeleton className="h-3 w-1/3" />
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </section>
                        ))}
                    </div>
                ) : query === '' ? (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">{t('recherche.invite', 'Saisissez un mot-clé pour commencer.')}</p>
                ) : totalResults === 0 ? (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('recherche.aucun_resultat', 'Aucun résultat pour')} « {query} ».
                    </p>
                ) : (
                    <div className="space-y-10">
                        {sections.map(([key, items]) => (
                            <section key={key}>
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                                    {sectionLabels[key] ?? key}
                                </h2>
                                <Card className="overflow-hidden">
                                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {items.map((item) => (
                                            <li key={item.url + item.title}>
                                                <Link href={item.url} className="block px-5 py-3 transition hover:bg-slate-50">
                                                    <p className="font-medium text-slate-700 dark:text-slate-200">{item.title}</p>
                                                    {item.subtitle && (
                                                        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
