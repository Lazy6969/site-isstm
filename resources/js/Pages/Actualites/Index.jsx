import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import ListGridToggle from '../../Components/Layout/ListGridToggle';
import SeoHead from '../../Components/QuickEdit/SeoHead';
import EditableText from '../../Components/QuickEdit/EditableText';
import { useTranslations } from '../../lib/useTranslations';
import { categoryBadgeStyle } from '../../lib/categoryBadgeStyle';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ articles }) {
    const { t } = useTranslations();
    const { content } = usePage().props;
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [view, setView] = useState('grid');

    const categories = useMemo(
        () => [...new Set(articles.map((a) => a.category?.name_fr).filter(Boolean))].sort(),
        [articles],
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return articles.filter((article) => {
            const matchesQuery =
                !query || article.title.toLowerCase().includes(query) || (article.excerpt ?? '').toLowerCase().includes(query);
            const matchesCategory = !category || article.category?.name_fr === category;
            return matchesQuery && matchesCategory;
        });
    }, [articles, search, category]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <SeoHead
                seoKey="actualites"
                defaultTitle="Actualités"
                defaultDescription="Toute l'actualité de l'ISSTM Mahajanga : vie universitaire, événements, conférences et annonces."
            />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="actualites_titre">
                            {content.actualites_titre ?? 'Actualités'}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="actualites_soustitre">
                            {content.actualites_soustitre ?? "Toute l'actualité de l'ISSTM."}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-8 flex justify-end">
                    <Link
                        href="/evenements"
                        className="inline-flex items-center gap-2 rounded-full bg-isstm-navy/5 px-4 py-2 text-sm font-medium text-isstm-navy transition hover:bg-isstm-navy/10 dark:text-white"
                    >
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        {t('actualites.voir_calendrier', 'Voir le calendrier des événements')}
                    </Link>
                </div>

                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('actualites.rechercher', 'Rechercher une actualité...')}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-isstm-gold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {categories.length > 1 && (
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-isstm-gold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                                <option value="">{t('actualites.toutes_categories', 'Toutes les catégories')}</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        )}
                        <ListGridToggle view={view} onChange={setView} />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                        {articles.length === 0
                            ? 'Aucune actualité publiée pour le moment.'
                            : t('actualites.aucun_resultat', 'Aucune actualité ne correspond à votre recherche.')}
                    </p>
                ) : (
                    <div className={view === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
                        {filtered.map((article) =>
                            view === 'grid' ? (
                                <Link
                                    key={article.slug}
                                    href={`/actualites/${article.slug}`}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700"
                                >
                                    <div className="h-36 overflow-hidden">
                                        <div
                                            className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={article.image_path ? { backgroundImage: `url('/${article.image_path}')` } : undefined}
                                        />
                                    </div>
                                    <div className="p-4 transition-transform duration-300 group-hover:scale-[1.03]">
                                        {article.category && (
                                            <span
                                                className="rounded-full bg-isstm-navy/10 px-2.5 py-0.5 text-[11px] font-semibold text-isstm-navy dark:text-white"
                                                style={categoryBadgeStyle(article.category.color)}
                                            >
                                                {article.category.name_fr}
                                            </span>
                                        )}
                                        <h2 className="mt-2 text-base font-semibold text-isstm-navy dark:text-white">{article.title}</h2>
                                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{article.excerpt}</p>
                                        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{formatDate(article.published_at)}</p>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    key={article.slug}
                                    href={`/actualites/${article.slug}`}
                                    className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700"
                                >
                                    <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                                        <div
                                            className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={article.image_path ? { backgroundImage: `url('/${article.image_path}')` } : undefined}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {article.category && (
                                            <span
                                                className="rounded-full bg-isstm-navy/10 px-2.5 py-0.5 text-[11px] font-semibold text-isstm-navy dark:text-white"
                                                style={categoryBadgeStyle(article.category.color)}
                                            >
                                                {article.category.name_fr}
                                            </span>
                                        )}
                                        <h2 className="mt-1 text-sm font-semibold text-isstm-navy dark:text-white">{article.title}</h2>
                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{article.excerpt}</p>
                                    </div>
                                    <p className="flex-shrink-0 text-[11px] text-slate-400 dark:text-slate-500">{formatDate(article.published_at)}</p>
                                </Link>
                            ),
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
