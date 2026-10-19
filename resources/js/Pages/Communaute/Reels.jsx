import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MessageSquareText, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';
import { useAutoplayVideos } from '../../lib/useAutoplayVideos';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * One full-height video tile. When autoplay is on (see /parametres), it
 * plays while mostly visible in the scroll container and pauses otherwise;
 * off, it stays paused and shows native controls so a visitor can still
 * start it by hand.
 */
function ReelTile({ video, muted, onToggleMute, autoplay }) {
    const { t } = useTranslations();
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const el = videoRef.current;
        if (!el || !autoplay) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.play().catch(() => {});
                } else {
                    el.pause();
                }
            },
            { threshold: 0.6 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [autoplay]);

    return (
        <div ref={containerRef} className="relative h-full w-full flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-black">
            <video
                ref={videoRef}
                src={`/storage/${video.path}`}
                loop
                muted={muted}
                playsInline
                controls={!autoplay}
                className="h-full w-full object-contain"
            />

            <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? t('communaute.reels_activer_son', 'Activer le son') : t('communaute.reels_couper_son', 'Couper le son')}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            >
                {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            </button>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                <Link href={`/profil/${video.post.user.id}`} className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 ring-2 ring-white/70">
                        <AvatarImage src={video.post.user.avatar_path ? `/storage/${video.post.user.avatar_path}` : undefined} alt="" />
                        <AvatarFallback>{video.post.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{video.post.user.name}</p>
                        <p className="text-xs text-white/70">{formatDate(video.post.created_at)}</p>
                    </div>
                </Link>
                {video.post.body && <p className="mt-2 line-clamp-2 text-sm text-white/90">{video.post.body}</p>}
                <Link
                    href={`/communaute/${video.post.id}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
                >
                    <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('communaute.voir_publication', 'Voir la publication')}
                </Link>
            </div>
        </div>
    );
}

export default function Reels({ videos }) {
    const { t } = useTranslations();
    const [muted, setMuted] = useState(true);
    const [autoplay] = useAutoplayVideos();

    function loadMore() {
        if (videos.next_page_url) {
            router.get(videos.next_page_url, {}, { preserveScroll: true, preserveState: true, only: ['videos'] });
        }
    }

    return (
        <AppLayout>
            <Head title={t('communaute.reels_titre', 'Reels')} />

            <Link href="/communaute" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('communaute.retour_fil', 'Retour au fil')}
            </Link>

            {videos.data.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                    {t('communaute.aucun_reel', 'Aucune vidéo pour le moment.')}
                </p>
            ) : (
                <div
                    className="mx-auto flex max-w-md snap-y snap-mandatory flex-col gap-4 overflow-y-auto scroll-smooth"
                    style={{ height: 'calc(100vh - 220px)' }}
                >
                    {videos.data.map((video) => (
                        <ReelTile key={video.id} video={video} muted={muted} onToggleMute={() => setMuted((v) => !v)} autoplay={autoplay} />
                    ))}

                    {videos.next_page_url && (
                        <button
                            type="button"
                            onClick={loadMore}
                            className="flex-shrink-0 snap-start rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-isstm-navy dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            {t('communaute.charger_plus', 'Charger plus de Reels')}
                        </button>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
