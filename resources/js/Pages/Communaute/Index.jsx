import { Head, Link, router, useForm } from '@inertiajs/react';
import { Archive, Bookmark, Paperclip, Send } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import PostCard from '../../Components/Communaute/PostCard';
import StoriesBar from '../../Components/Communaute/StoriesBar';
import PostCardSkeleton from '../../Components/Loading/PostCardSkeleton';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ posts, canPublish, postTypes }) {
    const { t } = useTranslations();
    const { data, setData, post, processing, errors, reset } = useForm({ type: 'autre', body: '', media: [] });
    const [pageLoading, setPageLoading] = useState(false);

    function submit(e) {
        e.preventDefault();
        post('/communaute', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function goToPage(url) {
        if (url) {
            router.get(
                url,
                {},
                { preserveScroll: true, onStart: () => setPageLoading(true), onFinish: () => setPageLoading(false) },
            );
        }
    }

    return (
        <AppLayout title={t('communaute.titre', 'Fil communautaire')}>
            <Head title="Communauté" />

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[200px_1fr]">
                <aside className="hidden lg:sticky lg:top-20 lg:block">
                    <nav className="space-y-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <Link
                            href="/communaute/enregistres"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                        >
                            <Bookmark className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {t('communaute.enregistres_court', 'Enregistrés')}
                        </Link>
                        {canPublish && (
                            <Link
                                href="/communaute/archives"
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                            >
                                <Archive className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                {t('communaute.archives_court', 'Archivés')}
                            </Link>
                        )}
                    </nav>
                </aside>

                <div className="min-w-0">
                    <div className="mb-4 flex justify-end gap-4 lg:hidden">
                        {canPublish && (
                            <Link
                                href="/communaute/archives"
                                className="flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white"
                            >
                                <Archive className="h-4 w-4" aria-hidden="true" />
                                {t('communaute.archives_court', 'Archivés')}
                            </Link>
                        )}
                        <Link
                            href="/communaute/enregistres"
                            className="flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white"
                        >
                            <Bookmark className="h-4 w-4" aria-hidden="true" />
                            {t('communaute.enregistres_court', 'Enregistrés')}
                        </Link>
                    </div>

                    <StoriesBar />

                    {canPublish && (
                <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
                    <div className="flex gap-3">
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {postTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <label className="flex flex-1 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Paperclip className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            <input type="file" multiple onChange={(e) => setData('media', Array.from(e.target.files))} className="flex-1 text-sm" />
                        </label>
                    </div>
                    <textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={3}
                        placeholder={t('communaute.placeholder_publication', 'Partager une actualité avec la communauté…')}
                        className="mt-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
                    />
                    {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
                    <div className="mt-3 flex justify-end">
                        <button
                            disabled={processing}
                            className="flex items-center gap-2 rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-isstm-navy-dark disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" aria-hidden="true" />
                            {t('communaute.publier', 'Publier')}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {pageLoading && [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}

                {!pageLoading && posts.data.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                        {t('communaute.aucune_publication', 'Aucune publication pour le moment.')}
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
                </div>
            </div>
        </AppLayout>
    );
}
