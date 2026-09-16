import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

const sectionLabels = {
    filieres: 'Filières',
    enseignants: 'Enseignants',
    actualites: 'Actualités',
    campus: 'Campus',
};

export default function Index({ query, results }) {
    const [term, setTerm] = useState(query ?? '');
    const sections = Object.entries(results ?? {}).filter(([, items]) => items.length > 0);
    const totalResults = sections.reduce((sum, [, items]) => sum + items.length, 0);

    function submit(e) {
        e.preventDefault();
        router.get('/recherche', { q: term }, { preserveState: true });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Recherche" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-3xl font-bold">Recherche</h1>
                    <form onSubmit={submit} className="mt-5 flex gap-2">
                        <input
                            type="search"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            placeholder="Rechercher une filière, un enseignant, une actualité…"
                            className="w-full rounded-full border-0 px-5 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-isstm-gold"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="shrink-0 rounded-full bg-isstm-gold px-6 py-3 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                        >
                            Rechercher
                        </button>
                    </form>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                {query === '' ? (
                    <p className="text-center text-sm text-slate-500">Saisissez un mot-clé pour commencer.</p>
                ) : totalResults === 0 ? (
                    <p className="text-center text-sm text-slate-500">
                        Aucun résultat pour « {query} ».
                    </p>
                ) : (
                    <div className="space-y-10">
                        {sections.map(([key, items]) => (
                            <section key={key}>
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                                    {sectionLabels[key] ?? key}
                                </h2>
                                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                                    {items.map((item) => (
                                        <li key={item.url + item.title}>
                                            <Link href={item.url} className="block px-5 py-3 transition hover:bg-slate-50">
                                                <p className="font-medium text-slate-700">{item.title}</p>
                                                {item.subtitle && (
                                                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{item.subtitle}</p>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
