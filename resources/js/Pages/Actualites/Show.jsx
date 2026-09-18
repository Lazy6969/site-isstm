import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Show({ article }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={article.title} />
            <SiteHeader />

            <div
                className="relative h-72 bg-cover bg-center"
                style={article.image_path ? { backgroundImage: `url('/${article.image_path}')` } : undefined}
            >
                <div className="absolute inset-0 bg-isstm-navy-dark/70" />
                <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-6 pb-8 text-white">
                    <Link href="/actualites" className="mb-3 flex items-center gap-1.5 text-sm text-white/80 hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('actualites.toutes_les_actualites', 'Toutes les actualités')}
                    </Link>
                    {article.category && (
                        <div className="mb-2 w-fit">
                            <Badge variant="gold">{article.category.name_fr}</Badge>
                        </div>
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
