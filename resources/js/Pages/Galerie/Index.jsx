import { Head, Link } from '@inertiajs/react';
import { Camera, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import ListGridToggle from '../../Components/Layout/ListGridToggle';
import { Card, CardContent } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ albums }) {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return albums;
        return albums.filter(
            (album) => album.title.toLowerCase().includes(query) || (album.location ?? '').toLowerCase().includes(query),
        );
    }, [albums, search]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Galerie" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('nav.galerie', 'Galerie')}</h1>
                    <p className="mt-2 text-white/80">{t('galerie.soustitre', "Les temps forts de la vie à l'ISSTM, en images.")}</p>
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
                            placeholder={t('galerie.rechercher', 'Rechercher dans la galerie...')}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-isstm-gold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <ListGridToggle view={view} onChange={setView} />
                </div>

                {filtered.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                        {t('galerie.aucun_resultat', 'Aucun album ne correspond à votre recherche.')}
                    </p>
                ) : (
                    <div className={view === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
                        {filtered.map((album) =>
                            view === 'grid' ? (
                                <Link key={album.slug} href={`/galerie/${album.slug}`} className="group block">
                                    <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                        <div
                                            className="relative h-48 bg-cover bg-center"
                                            style={album.cover_image ? { backgroundImage: `url('/${album.cover_image}')` } : undefined}
                                        >
                                            <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                                                <Camera className="h-3 w-3" aria-hidden="true" />
                                                {album.photos_count} photo{album.photos_count > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <CardContent className="p-5">
                                            {album.category && <Badge>{album.category.name_fr}</Badge>}
                                            <h2 className="mt-3 text-lg font-semibold text-isstm-navy dark:text-white">{album.title}</h2>
                                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                                {formatDate(album.event_date)}
                                                {album.location ? ` · ${album.location}` : ''}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ) : (
                                <Link key={album.slug} href={`/galerie/${album.slug}`} className="group block">
                                    <Card className="flex items-center gap-4 overflow-hidden p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                                        <div
                                            className="h-20 w-28 flex-shrink-0 rounded-lg bg-cover bg-center"
                                            style={album.cover_image ? { backgroundImage: `url('/${album.cover_image}')` } : undefined}
                                        />
                                        <div className="min-w-0 flex-1">
                                            {album.category && <Badge>{album.category.name_fr}</Badge>}
                                            <h2 className="mt-1.5 text-base font-semibold text-isstm-navy dark:text-white">{album.title}</h2>
                                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                                {formatDate(album.event_date)}
                                                {album.location ? ` · ${album.location}` : ''}
                                            </p>
                                        </div>
                                        <span className="flex flex-shrink-0 items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                            <Camera className="h-3 w-3" aria-hidden="true" />
                                            {album.photos_count}
                                        </span>
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
