import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

export default function Index({ filieres }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Filières" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-3xl font-bold">Nos filières</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        L'ISSTM forme des ingénieurs et techniciens dans un large éventail de disciplines
                        scientifiques et techniques.
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filieres.map((filiere) => (
                        <Link
                            key={filiere.slug}
                            href={`/filieres/${filiere.slug}`}
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url('/${filiere.image_path}')` }} />
                            <div className="p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    {filiere.mention && (
                                        <span className="rounded-full bg-isstm-navy/10 px-3 py-1 text-xs font-semibold text-isstm-navy">
                                            {filiere.mention}
                                        </span>
                                    )}
                                    {filiere.niveaux && (
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                            {filiere.niveaux}
                                        </span>
                                    )}
                                </div>
                                <h2 className="mt-3 text-lg font-semibold text-isstm-navy">{filiere.nom}</h2>
                                <p className="mt-2 line-clamp-3 text-sm text-slate-500">{filiere.description}</p>
                                <span className="mt-3 inline-block text-sm font-medium text-isstm-navy group-hover:underline">
                                    En savoir plus →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
