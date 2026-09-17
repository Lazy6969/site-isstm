import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import PostCard from '../../Components/Communaute/PostCard';
import PostCardSkeleton from '../../Components/Loading/PostCardSkeleton';

export default function Index({ posts, canPublish, postTypes }) {
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
        <AppLayout title="Fil communautaire">
            <Head title="Communauté" />

            {canPublish && (
                <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex gap-3">
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {postTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setData('media', Array.from(e.target.files))}
                            className="flex-1 text-sm text-slate-500"
                        />
                    </div>
                    <textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={3}
                        placeholder="Partager une actualité avec la communauté…"
                        className="mt-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
                    />
                    {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
                    <div className="mt-3 flex justify-end">
                        <button
                            disabled={processing}
                            className="rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-isstm-navy-dark disabled:opacity-50"
                        >
                            Publier
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {pageLoading && [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}

                {!pageLoading && posts.data.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                        Aucune publication pour le moment.
                    </p>
                )}
                {!pageLoading && posts.data.map((p) => <PostCard key={p.id} post={p} />)}
            </div>

            {(posts.prev_page_url || posts.next_page_url) && (
                <div className="mt-8 flex justify-center gap-3">
                    <button
                        disabled={!posts.prev_page_url}
                        onClick={() => goToPage(posts.prev_page_url)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
                    >
                        Précédent
                    </button>
                    <button
                        disabled={!posts.next_page_url}
                        onClick={() => goToPage(posts.next_page_url)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </AppLayout>
    );
}
