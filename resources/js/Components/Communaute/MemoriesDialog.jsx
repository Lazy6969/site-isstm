import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import Skeleton from '../Loading/Skeleton';
import { useTranslations } from '../../lib/useTranslations';

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * "Souvenirs" — the viewer's own posts published on this same day in a past
 * year (see PostController::memories), fetched only when the dialog opens
 * since most days have nothing to show.
 */
export default function MemoriesDialog({ open, onClose }) {
    const { t } = useTranslations();
    const [memories, setMemories] = useState(null);

    useEffect(() => {
        if (!open) return;
        setMemories(null);
        fetch('/communaute/souvenirs', { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((json) => setMemories(json.memories));
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        {t('communaute.souvenirs_titre', 'Souvenirs')}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                    {memories === null &&
                        [...Array(2)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3.5 w-40" />
                                <Skeleton className="h-28 w-full rounded-xl" />
                            </div>
                        ))}
                    {memories?.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">
                            {t('communaute.aucun_souvenir', 'Aucun souvenir pour aujourd’hui. Revenez une autre fois !')}
                        </p>
                    )}
                    {memories?.map((memory) => (
                        <a
                            key={memory.id}
                            href={`/communaute/${memory.id}`}
                            className="block rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                        >
                            <p className="text-xs font-medium text-isstm-navy dark:text-white">
                                {t('communaute.il_y_a_ans', 'Il y a {count} an(s) · {date}')
                                    .replace('{count}', memory.years_ago)
                                    .replace('{date}', formatDate(memory.created_at))}
                            </p>
                            {memory.media[0]?.type === 'image' && (
                                <img src={`/storage/${memory.media[0].path}`} alt="" className="mt-2 max-h-48 w-full rounded-lg object-cover" />
                            )}
                            {memory.body && <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{memory.body}</p>}
                        </a>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
