import { Head, usePage } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

const categoryLabels = {
    public: 'Public',
    etudiant: 'Étudiants',
};

export default function Index({ documents }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Documents administratifs" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">Documents administratifs</h1>
                    <p className="mt-2 text-white/80">Formulaires et documents à télécharger.</p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {documents.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
                        Aucun document n'est disponible pour le moment.
                    </p>
                ) : (
                    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                        {documents.map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between gap-4 px-6 py-4">
                                <div>
                                    <p className="font-medium text-slate-700">{doc.title}</p>
                                    <span className="mt-1 inline-block rounded-full bg-isstm-navy/10 px-2.5 py-0.5 text-xs font-medium text-isstm-navy">
                                        {categoryLabels[doc.category] ?? doc.category}
                                    </span>
                                </div>
                                <a
                                    href={`/${doc.file_path}`}
                                    download
                                    className="shrink-0 rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                                >
                                    Télécharger
                                </a>
                            </li>
                        ))}
                    </ul>
                )}

                {!auth?.user && (
                    <p className="mt-6 text-center text-sm text-slate-500">
                        Connectez-vous pour accéder aux documents réservés aux étudiants.
                    </p>
                )}
            </main>

            <Footer />
        </div>
    );
}
