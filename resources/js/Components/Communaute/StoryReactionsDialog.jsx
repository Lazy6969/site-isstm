import { Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import Skeleton from '../Loading/Skeleton';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Who reacted to a story, and with what — shown only to the story's own
 * author (see StoryReactionListController), the same way Facebook/Instagram
 * never reveal a story's reactions to anyone but its author. A bespoke
 * overlay rather than the shared ui/Dialog: that component's z-50 would
 * render behind StoryViewer's own full-screen z-[100] overlay.
 */
export default function StoryReactionsDialog({ open, onClose, storyId }) {
    const { t } = useTranslations();
    const [reactions, setReactions] = useState(null);

    useEffect(() => {
        if (!open) return;
        setReactions(null);
        fetch(`/stories/${storyId}/reactions`, { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((json) => setReactions(json.reactions));
    }, [open, storyId]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
            <div
                className="max-h-[70vh] w-full max-w-sm overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl dark:bg-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
                    <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t('stories.reactions_titre', 'Réactions à la story')}</h2>
                    <button type="button" onClick={onClose} aria-label={t('stories.fermer', 'Fermer')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="max-h-96 space-y-1 overflow-y-auto p-2">
                    {reactions === null &&
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
                                <Skeleton className="h-3.5 w-32" />
                            </div>
                        ))}
                    {reactions?.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">{t('stories.aucune_reaction', 'Aucune réaction pour le moment.')}</p>
                    )}
                    {reactions?.map((r) => (
                        <Link key={r.user.id} href={`/profil/${r.user.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div className="relative">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={r.user.avatar_path ? `/storage/${r.user.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{r.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-1 -right-1 text-sm">{r.emoji}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.user.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
