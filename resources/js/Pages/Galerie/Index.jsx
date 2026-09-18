import { Head, Link } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card, CardContent } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ albums }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Galerie" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-3xl font-bold">{t('nav.galerie', 'Galerie')}</h1>
                    <p className="mt-2 text-white/80">{t('galerie.soustitre', "Les temps forts de la vie à l'ISSTM, en images.")}</p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {albums.map((album) => (
                        <Link key={album.slug} href={`/galerie/${album.slug}`} className="group block">
                            <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                <div
                                    className="relative h-48 bg-cover bg-center"
                                    style={album.cover_image ? { backgroundImage: `url('/${album.cover_image}')` } : undefined}
                                >
                                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                                        <Camera className="h-3 w-3" aria-hidden="true" />
                                        {album.photos_count} photo{album.photos_count > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <CardContent className="p-5">
                                    {album.category && <Badge>{album.category.name_fr}</Badge>}
                                    <h2 className="mt-3 text-lg font-semibold text-isstm-navy">{album.title}</h2>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {formatDate(album.event_date)}
                                        {album.location ? ` · ${album.location}` : ''}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
