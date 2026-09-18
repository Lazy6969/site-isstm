import { Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import Partenaires from '../../Components/Home/Partenaires';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ articles, partenaires }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Actualités" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-3xl font-bold">Actualités</h1>
                    <p className="mt-2 text-white/80">Toute l'actualité de l'ISSTM.</p>
                </div>
            </div>

            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-6 py-4">
                    <Link
                        href="/evenements"
                        className="inline-flex items-center gap-2 rounded-full bg-isstm-navy/5 px-4 py-2 text-sm font-medium text-isstm-navy transition hover:bg-isstm-navy/10"
                    >
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        Voir les événements à venir
                    </Link>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                {articles.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
                        Aucune actualité publiée pour le moment.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/actualites/${article.slug}`}
                                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div
                                    className="h-44 bg-cover bg-center"
                                    style={article.image_path ? { backgroundImage: `url('/${article.image_path}')` } : undefined}
                                />
                                <div className="p-5">
                                    {article.category && (
                                        <span className="rounded-full bg-isstm-navy/10 px-3 py-1 text-xs font-semibold text-isstm-navy">
                                            {article.category.name_fr}
                                        </span>
                                    )}
                                    <h2 className="mt-3 text-lg font-semibold text-isstm-navy">{article.title}</h2>
                                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{article.excerpt}</p>
                                    <p className="mt-3 text-xs text-slate-400">{formatDate(article.published_at)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Partenaires partenaires={partenaires} />

            <Footer />
        </div>
    );
}
