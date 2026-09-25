import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import PostCard from '../../Components/Communaute/PostCard';
import PostCardSkeleton from '../../Components/Loading/PostCardSkeleton';
import { useTranslations } from '../../lib/useTranslations';

export default function Archives({ posts }) {
    const { t } = useTranslations();
    const [pageLoading, setPageLoading] = useState(false);

    function goToPage(url) {
        if (url) {
            router.get(url, {}, { preserveScroll: true, onStart: () => setPageLoading(true), onFinish: () => setPageLoading(false) });
        }
    }

    return (
        <AppLayout title={t('communaute.mes_archives', 'Publications archivées')}>
            <Head title="Publications archivées" />

            <Link href="/communaute" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('communaute.retour_fil', 'Retour au fil')}
            </Link>

            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                {t('communaute.archives_description', 'Ces publications sont masquées du fil communautaire mais restent visibles ici, uniquement pour vous.')}
            </p>

            <div className="space-y-6">
                {pageLoading && [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}

                {!pageLoading && posts.data.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                        {t('communaute.aucune_archive', "Vous n'avez archivé aucune publication.")}
                    </p>
                )}
                {!pageLoading && posts.data.map((p) => <PostCard key={p.id} post={p} />)}
            </div>

            {(posts.prev_page_url || posts.next_page_url) && (
                <div className="mt-8 flex justify-center gap-3">
                    <button
                        disabled={!posts.prev_page_url}
                        onClick={() => goToPage(posts.prev_page_url)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                        {t('pagination.precedent', 'Précédent')}
                    </button>
                    <button
                        disabled={!posts.next_page_url}
                        onClick={() => goToPage(posts.next_page_url)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                        {t('pagination.suivant', 'Suivant')}
                    </button>
                </div>
            )}
        </AppLayout>
    );
}
