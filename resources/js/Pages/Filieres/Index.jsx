import { Link } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import ListGridToggle from '../../Components/Layout/ListGridToggle';
import SeoHead from '../../Components/QuickEdit/SeoHead';
import { Card, CardContent } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ filieres }) {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [mention, setMention] = useState('');
    const [view, setView] = useState('grid');

    const mentions = useMemo(
        () => [...new Set(filieres.map((f) => f.mention).filter(Boolean))].sort(),
        [filieres],
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return filieres.filter((filiere) => {
            const matchesQuery = !query || filiere.nom.toLowerCase().includes(query) || (filiere.description ?? '').toLowerCase().includes(query);
            const matchesMention = !mention || filiere.mention === mention;
            return matchesQuery && matchesMention;
        });
    }, [filieres, search, mention]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <SeoHead
                seoKey="filieres"
                defaultTitle="Filières"
                defaultDescription="Découvrez les filières d'ingénieurs et de techniciens de l'ISSTM Mahajanga : mentions, programmes et débouchés."
            />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('filieres.titre', 'Nos filières')}</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        {t(
                            'filieres.soustitre',
                            "L'ISSTM forme des ingénieurs et techniciens dans un large éventail de disciplines scientifiques et techniques.",
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('filieres.rechercher', 'Rechercher une filière...')}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-isstm-gold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {mentions.length > 1 && (
                            <select
                                value={mention}
                                onChange={(e) => setMention(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-isstm-gold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                                <option value="">{t('filieres.toutes_mentions', 'Toutes les mentions')}</option>
                                {mentions.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        )}
                        <ListGridToggle view={view} onChange={setView} />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                        {t('filieres.aucun_resultat', 'Aucune filière ne correspond à votre recherche.')}
                    </p>
                ) : (
                    <div className={view === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
                        {filtered.map((filiere) =>
                            view === 'grid' ? (
                                <Link key={filiere.slug} href={`/filieres/${filiere.slug}`} className="group block">
                                    <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                        <div className="h-40 overflow-hidden">
                                            <div
                                                className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: `url('/${filiere.image_path}')` }}
                                            />
                                        </div>
                                        <CardContent className="p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {filiere.mention && <Badge>{filiere.mention}</Badge>}
                                                {filiere.niveaux && <Badge variant="outline">{filiere.niveaux}</Badge>}
                                            </div>
                                            <h2 className="mt-3 text-lg font-semibold text-isstm-navy dark:text-white">{filiere.nom}</h2>
                                            <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{filiere.description}</p>
                                            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-isstm-navy group-hover:underline dark:text-white">
                                                {t('filieres.en_savoir_plus', 'En savoir plus')}
                                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                            </span>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ) : (
                                <Link key={filiere.slug} href={`/filieres/${filiere.slug}`} className="group block">
                                    <Card className="flex items-center gap-4 overflow-hidden p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                                        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                                            <div
                                                className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: `url('/${filiere.image_path}')` }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {filiere.mention && <Badge>{filiere.mention}</Badge>}
                                                {filiere.niveaux && <Badge variant="outline">{filiere.niveaux}</Badge>}
                                            </div>
                                            <h2 className="mt-1.5 text-base font-semibold text-isstm-navy dark:text-white">{filiere.nom}</h2>
                                            <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{filiere.description}</p>
                                        </div>
                                        <ArrowRight
                                            className="h-4 w-4 flex-shrink-0 text-isstm-navy opacity-0 transition group-hover:opacity-100 dark:text-white"
                                            aria-hidden="true"
                                        />
                                    </Card>
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
