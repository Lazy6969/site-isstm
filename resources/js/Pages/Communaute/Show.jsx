import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import PostCard from '../../Components/Communaute/PostCard';
import { useTranslations } from '../../lib/useTranslations';

export default function Show({ post }) {
    const { t } = useTranslations();
    const highlightCommentId = useMemo(() => {
        const raw = new URLSearchParams(window.location.search).get('comment');

        return raw ? Number(raw) : null;
    }, []);

    return (
        <AppLayout>
            <Head title={t('communaute.publication', 'Publication')} />

            <Link href="/communaute" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('communaute.retour_fil', 'Retour au fil')}
            </Link>

            <div className="rounded-2xl ring-2 ring-blue-400/40 ring-offset-2 dark:ring-offset-slate-900">
                <PostCard post={post} highlightCommentId={highlightCommentId} />
            </div>
        </AppLayout>
    );
}
