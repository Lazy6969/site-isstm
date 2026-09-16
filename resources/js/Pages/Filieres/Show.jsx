import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

function Section({ title, text }) {
    if (!text) return null;

    return (
        <section className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-semibold text-isstm-navy">{title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{text}</p>
        </section>
    );
}

export default function Show({ filiere }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={filiere.nom} />
            <SiteHeader />

            <div
                className="relative h-72 bg-cover bg-center"
                style={{ backgroundImage: `url('/${filiere.image_path}')` }}
            >
                <div className="absolute inset-0 bg-isstm-navy-dark/70" />
                <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-end px-6 pb-8 text-white">
                    <Link href="/filieres" className="mb-3 text-sm text-white/80 hover:underline">
                        ← Toutes les filières
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {filiere.mention && (
                            <span className="rounded-full bg-isstm-gold px-3 py-1 text-xs font-semibold text-isstm-navy-dark">
                                {filiere.mention}
                            </span>
                        )}
                        {filiere.niveaux && (
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{filiere.niveaux}</span>
                        )}
                    </div>
                    <h1 className="mt-3 text-3xl font-bold">{filiere.nom}</h1>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
                <p className="text-base leading-relaxed text-slate-700">{filiere.description}</p>
                <Section title="Débouchés professionnels" text={filiere.debouches} />
                <Section title="Un peu d'histoire" text={filiere.historique} />
                <Section title="Pourquoi choisir cette filière ?" text={filiere.avantages} />
            </main>

            <Footer />
        </div>
    );
}
