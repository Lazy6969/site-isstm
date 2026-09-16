import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

function Fact({ label, value }) {
    if (!value) return null;

    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-slate-700">{value}</dd>
        </div>
    );
}

export default function Show({ bloc }) {
    const images = bloc.images ?? [];

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={bloc.nom} />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <Link href="/campus" className="text-sm text-white/70 hover:text-white hover:underline">
                        ← Tous les blocs
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold">{bloc.nom}</h1>
                    {bloc.signification && <p className="mt-2 max-w-2xl text-white/80">{bloc.signification}</p>}
                    {bloc.slogan && <p className="mt-3 text-sm italic text-isstm-gold">« {bloc.slogan} »</p>}
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {images.length > 0 && (
                    <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {images.map((image) => (
                            <div key={image} className="h-40 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('/${image}')` }} />
                        ))}
                    </div>
                )}

                <dl className="grid grid-cols-1 gap-6 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2">
                    <Fact label="Fondation" value={bloc.fondation} />
                    <Fact label="Fondateurs" value={bloc.fondateurs} />
                    <Fact label="Danses" value={bloc.danse} />
                    <Fact label="Ce qui les distingue" value={bloc.mampiavaka} />
                </dl>

                <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {bloc.objectifs && (
                        <div>
                            <h2 className="text-lg font-semibold text-isstm-navy">Objectifs</h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{bloc.objectifs}</p>
                        </div>
                    )}
                    {bloc.activites && (
                        <div>
                            <h2 className="text-lg font-semibold text-isstm-navy">Activités</h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{bloc.activites}</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
