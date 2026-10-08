import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Share2 } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';
import { useToast } from '../../lib/useToast';
import { categoryBadgeStyle } from '../../lib/categoryBadgeStyle';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Show({ article, relatedArticles = [] }) {
    const { t } = useTranslations();
    const { toast } = useToast();

    async function share() {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: article.title, url });
            } catch {
                // The user cancelled the native share sheet — nothing to report.
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            toast(t('actualites.lien_copie', 'Lien copié dans le presse-papiers.'));
        } catch {
            toast(t('actualites.lien_copie_echec', "Impossible de copier le lien."), { type: 'error' });
        }
    }

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
                            <Badge variant="gold" style={categoryBadgeStyle(article.category.color)}>
                                {article.category.name_fr}
                            </Badge>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold sm:text-3xl">{article.title}</h1>
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-sm text-white/70">
                            {formatDate(article.published_at)}
                            {article.author ? ` · ${article.author}` : ''}
                        </p>
                        <button
                            type="button"
                            onClick={share}
                            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                        >
                            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('actualites.partager', 'Partager')}
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                <div className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-200">{article.content}</div>

                {relatedArticles.length > 0 && (
                    <div className="mt-14 border-t border-slate-200 pt-10 dark:border-slate-700">
                        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                            {t('actualites.articles_similaires', 'Articles similaires')}
                        </h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            {relatedArticles.map((related) => (
                                <Link
                                    key={related.slug}
                                    href={`/actualites/${related.slug}`}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700"
                                >
                                    <div className="h-28 overflow-hidden">
                                        <div
                                            className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={related.image_path ? { backgroundImage: `url('/${related.image_path}')` } : undefined}
                                        />
                                    </div>
                                    <div className="p-3.5">
                                        <h3 className="text-sm font-semibold text-isstm-navy dark:text-white">{related.title}</h3>
                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{related.excerpt}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
