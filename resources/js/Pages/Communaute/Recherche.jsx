import { Head, Link, useForm } from '@inertiajs/react';
import { MessageSquareText, Search, Users } from 'lucide-react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

export default function Recherche({ query, results }) {
    const { t } = useTranslations();
    const { data, setData, get, processing } = useForm({ q: query ?? '' });
    const sections = Object.entries(results ?? {}).filter(([, items]) => items.length > 0);
    const totalResults = sections.reduce((sum, [, items]) => sum + items.length, 0);

    const sectionMeta = {
        publications: { label: t('recherche.publications', 'Publications'), icon: MessageSquareText },
        personnes: { label: t('recherche.personnes', 'Personnes'), icon: Users },
    };

    function search(e) {
        e.preventDefault();
        get('/communaute/recherche', { preserveState: true, preserveScroll: true });
    }

    return (
        <AppLayout title={t('recherche.communaute_titre', 'Recherche dans la communauté')}>
            <Head title="Recherche — Communauté" />

            <p className="mb-6 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                {t('recherche.communaute_soustitre', 'Retrouvez une publication ou un compte de la communauté ISSTM.')}
            </p>

            <form onSubmit={search} className="mb-8 flex gap-2">
                <input
                    type="search"
                    value={data.q}
                    onChange={(e) => setData('q', e.target.value)}
                    placeholder={t('recherche.communaute_placeholder', 'Rechercher une publication ou une personne…')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-isstm-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-isstm-navy-dark disabled:opacity-50"
                >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    {t('nav.rechercher', 'Rechercher')}
                </button>
            </form>

            {query === '' ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">{t('recherche.invite', 'Saisissez un mot-clé pour commencer.')}</p>
            ) : totalResults === 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    {t('recherche.aucun_resultat', 'Aucun résultat pour')} « {query} ».
                </p>
            ) : (
                <div className="space-y-10">
                    {sections.map(([key, items]) => {
                        const meta = sectionMeta[key] ?? { label: key, icon: Search };
                        const SectionIcon = meta.icon;

                        return (
                            <section key={key}>
                                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-isstm-navy dark:text-white">
                                    <SectionIcon className="h-4 w-4" aria-hidden="true" />
                                    {meta.label}
                                </h2>
                                <Card className="overflow-hidden">
                                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {items.map((item) => (
                                            <li key={item.url + item.title}>
                                                <Link href={item.url} className="block px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
