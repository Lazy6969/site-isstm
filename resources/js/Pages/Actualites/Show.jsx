import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Show({ article }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={article.title} />
            <SiteHeader />

            <div
                className="relative h-72 bg-cover bg-center"
                style={article.image_path ? { backgroundImage: `url('/${article.image_path}')` } : undefined}
            >
                <div className="absolute inset-0 bg-isstm-navy-dark/70" />
                <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-6 pb-8 text-white">
                    <Link href="/actualites" className="mb-3 text-sm text-white/80 hover:underline">
                        ← Toutes les actualités
                    </Link>
                    {article.category && (
                        <span className="mb-2 inline-block w-fit rounded-full bg-isstm-gold px-3 py-1 text-xs font-semibold text-isstm-navy-dark">
                            {article.category.name_fr}
                        </span>
                    )}
                    <h1 className="text-3xl font-bold">{article.title}</h1>
                    <p className="mt-2 text-sm text-white/70">
                        {formatDate(article.published_at)}
                        {article.author ? ` · ${article.author}` : ''}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                <div className="whitespace-pre-line text-base leading-relaxed text-slate-700">{article.content}</div>
            </main>

            <Footer />
        </div>
    );
}
