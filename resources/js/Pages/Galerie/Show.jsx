import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { useTranslations } from '../../lib/useTranslations';

export default function Show({ album }) {
    const { t } = useTranslations();
    const [active, setActive] = useState(null);
    const photos = album.photos ?? [];

    function showPrevious() {
        setActive((current) => (current - 1 + photos.length) % photos.length);
    }

    function showNext() {
        setActive((current) => (current + 1) % photos.length);
    }

    // Arrow keys scroll through photos, Escape closes — same shortcuts a
    // browser's own image viewer uses, on top of the on-screen buttons below.
    useEffect(() => {
        if (active === null) {
            return;
        }

        function onKeyDown(e) {
            if (e.key === 'ArrowLeft') showPrevious();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'Escape') setActive(null);
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, photos.length]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={album.title} />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white sm:py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <Link href="/galerie" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('galerie.toute_la_galerie', 'Toute la galerie')}
                    </Link>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{album.title}</h1>
                    {album.description && <p className="mt-2 max-w-2xl text-white/80">{album.description}</p>}
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                        <div key={photo.id} className="h-40 overflow-hidden rounded-xl sm:h-48">
                            <button
                                type="button"
                                onClick={() => setActive(index)}
                                className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 hover:scale-110"
                                style={{ backgroundImage: `url('/${photo.image_path}')` }}
                                aria-label={photo.title ?? t('galerie.voir_photo', 'Voir la photo')}
                            />
                        </div>
                    ))}
                </div>
            </main>

            {active !== null && photos[active] && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6"
                    onClick={() => setActive(null)}
                >
                    <img
                        src={`/${photos[active].image_path}`}
                        alt={photos[active].alt_text ?? ''}
                        className="max-h-[80vh] max-w-full rounded-lg object-contain"
                    />
                    {photos[active].title && <p className="mt-4 text-sm text-white/80">{photos[active].title}</p>}

                    {photos.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showPrevious();
                                }}
                                aria-label={t('galerie.photo_precedente', 'Photo précédente')}
                                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                            >
                                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showNext();
                                }}
                                aria-label={t('galerie.photo_suivante', 'Photo suivante')}
                                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                            >
                                <ChevronRight className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </>
                    )}

                    <div className="absolute right-6 top-6 flex items-center gap-2">
                        <a
                            href={`/${photos[active].image_path}`}
                            download
                            onClick={(e) => e.stopPropagation()}
                            aria-label={t('galerie.telecharger', 'Télécharger')}
                            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                        >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            {t('galerie.telecharger', 'Télécharger')}
                        </a>
                        <button
                            type="button"
                            onClick={() => setActive(null)}
                            aria-label={t('galerie.fermer', 'Fermer')}
                            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                            {t('galerie.fermer', 'Fermer')}
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
