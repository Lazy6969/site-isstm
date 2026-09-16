import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

export default function Show({ album }) {
    const [active, setActive] = useState(null);
    const photos = album.photos ?? [];

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={album.title} />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-5xl px-6">
                    <Link href="/galerie" className="text-sm text-white/70 hover:text-white hover:underline">
                        ← Toute la galerie
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold">{album.title}</h1>
                    {album.description && <p className="mt-2 max-w-2xl text-white/80">{album.description}</p>}
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                        <button
                            key={photo.id}
                            type="button"
                            onClick={() => setActive(index)}
                            className="h-40 rounded-xl bg-cover bg-center transition hover:opacity-90 sm:h-48"
                            style={{ backgroundImage: `url('/${photo.image_path}')` }}
                            aria-label={photo.title ?? 'Voir la photo'}
                        />
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
                    <button
                        type="button"
                        onClick={() => setActive(null)}
                        className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                    >
                        Fermer ✕
                    </button>
                </div>
            )}

            <Footer />
        </div>
    );
}
