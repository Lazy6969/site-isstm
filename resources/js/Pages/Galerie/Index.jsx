import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ albums }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Galerie" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-3xl font-bold">Galerie</h1>
                    <p className="mt-2 text-white/80">Les temps forts de la vie à l'ISSTM, en images.</p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {albums.map((album) => (
                        <Link
                            key={album.slug}
                            href={`/galerie/${album.slug}`}
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div
                                className="relative h-48 bg-cover bg-center"
                                style={album.cover_image ? { backgroundImage: `url('/${album.cover_image}')` } : undefined}
                            >
                                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                                    {album.photos_count} photo{album.photos_count > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="p-5">
                                {album.category && (
                                    <span className="rounded-full bg-isstm-navy/10 px-3 py-1 text-xs font-semibold text-isstm-navy">
                                        {album.category.name_fr}
                                    </span>
                                )}
                                <h2 className="mt-3 text-lg font-semibold text-isstm-navy">{album.title}</h2>
                                <p className="mt-1 text-xs text-slate-400">
                                    {formatDate(album.event_date)}
                                    {album.location ? ` · ${album.location}` : ''}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
