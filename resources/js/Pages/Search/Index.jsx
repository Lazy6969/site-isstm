import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ query, results }) {
    const { t } = useTranslations();
    const [term, setTerm] = useState(query ?? '');
    const sections = Object.entries(results ?? {}).filter(([, items]) => items.length > 0);
    const totalResults = sections.reduce((sum, [, items]) => sum + items.length, 0);

    const sectionLabels = {
        filieres: t('nav.filieres', 'Filières'),
        enseignants: t('nav.enseignants', 'Enseignants'),
        actualites: t('nav.actualites', 'Actualités'),
        campus: t('nav.campus', 'Campus'),
    };

    function submit(e) {
        e.preventDefault();
        router.get('/recherche', { q: term }, { preserveState: true });
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Recherche" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-3xl font-bold">{t('nav.recherche', 'Recherche')}</h1>
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
                {query === '' ? (
                    <p className="text-center text-sm text-slate-500">{t('recherche.invite', 'Saisissez un mot-clé pour commencer.')}</p>
                ) : totalResults === 0 ? (
                    <p className="text-center text-sm text-slate-500">
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
                                    <ul className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <li key={item.url + item.title}>
                                                <Link href={item.url} className="block px-5 py-3 transition hover:bg-slate-50">
                                                    <p className="font-medium text-slate-700">{item.title}</p>
                                                    {item.subtitle && (
                                                        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{item.subtitle}</p>
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
