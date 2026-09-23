import { Link } from '@inertiajs/react';
import { ArrowRight, Newspaper } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useTranslations } from '../../lib/useTranslations';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Actualites({ articles }) {
    const { t } = useTranslations();

    if (articles.length === 0) return null;

    return (
        <section className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                            <Newspaper className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                            {t('accueil.actualites_titre', 'Dernières actualités')}
                        </h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            {t('accueil.actualites_soustitre', "Ce qui se passe en ce moment à l'ISSTM.")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {articles.map((article) => (
                        <Link key={article.slug} href={`/actualites/${article.slug}`}>
                            <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="h-36 overflow-hidden">
                                    <div
                                        className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={article.image_path ? { backgroundImage: `url('/${article.image_path}')` } : undefined}
                                    />
                                </div>
                                <CardContent className="p-4 transition-transform duration-300 group-hover:scale-[1.03]">
                                    {article.category && (
                                        <span className="rounded-full bg-isstm-navy/10 px-2.5 py-0.5 text-[11px] font-semibold text-isstm-navy dark:text-white">
                                            {article.category}
                                        </span>
                                    )}
                                    <h3 className="mt-2 text-base font-semibold text-isstm-navy group-hover:text-isstm-gold dark:text-white">
                                        {article.title}
                                    </h3>
                                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{article.excerpt}</p>
                                    <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{formatDate(article.published_at)}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/actualites"
                        className="inline-flex items-center gap-2 rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                    >
                        {t('actualites.toutes_les_actualites', 'Toutes les actualités')}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
