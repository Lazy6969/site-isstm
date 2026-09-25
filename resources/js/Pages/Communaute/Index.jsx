import { Head, Link, router, usePage } from '@inertiajs/react';
import { Archive, Bookmark, Image as ImageIcon, LayoutDashboard } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import PostCard from '../../Components/Communaute/PostCard';
import StoriesBar from '../../Components/Communaute/StoriesBar';
import ConversationsSidebar from '../../Components/Communaute/ConversationsSidebar';
import ComposePostModal from '../../Components/Communaute/ComposePostModal';
import PostCardSkeleton from '../../Components/Loading/PostCardSkeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';
import { greetingPeriod } from '../../lib/greeting';

const GREETINGS = {
    matin: { key: 'communaute.salutation_matin', fallback: 'Bonjour {name} 👋' },
    apresmidi: { key: 'communaute.salutation_apresmidi', fallback: 'Bonne après-midi {name} ☀️' },
    soir: { key: 'communaute.salutation_soir', fallback: 'Bonsoir {name} 🌙' },
};

export default function Index({ posts, canPublish, postTypes, friends, conversations }) {
    const { t } = useTranslations();
    const { auth } = usePage().props;
    const [pageLoading, setPageLoading] = useState(false);
    const [composeOpen, setComposeOpen] = useState(false);
    const greeting = useMemo(() => {
        const firstName = auth?.user?.name?.split(' ')[0] ?? '';
        const { key, fallback } = GREETINGS[greetingPeriod()];

        return t(key, fallback).replace('{name}', firstName);
    }, [auth?.user?.name, t]);

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
        <AppLayout title={greeting}>
            <Head title="Communauté" />

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_260px]">
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
                        <Link
                            href="/tableau-de-bord"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                        >
                            <LayoutDashboard className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {t('nav.tableau_bord', 'Tableau de bord')}
                        </Link>
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
                        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={auth?.user?.avatar_path ? `/storage/${auth.user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback>{auth?.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={() => setComposeOpen(true)}
                                className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                            >
                                {t('communaute.publier_statut', 'Publier un statut')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setComposeOpen(true)}
                                className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <ImageIcon className="h-5 w-5" aria-hidden="true" />
                                <span className="hidden sm:inline">{t('communaute.photo', 'Photo')}</span>
                            </button>
                        </div>
                    )}

                    <ComposePostModal
                        open={composeOpen}
                        onClose={() => setComposeOpen(false)}
                        postTypes={postTypes}
                        friends={friends ?? []}
                        user={auth?.user}
                    />

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

                <ConversationsSidebar conversations={conversations ?? []} />
            </div>
        </AppLayout>
    );
}
