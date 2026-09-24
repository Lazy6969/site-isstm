import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import Skeleton from '../Loading/Skeleton';
import { useTranslations } from '../../lib/useTranslations';

export default function ReactionsListDialog({ open, onClose, postId }) {
    const { t } = useTranslations();
    const [reactions, setReactions] = useState(null);

    useEffect(() => {
        if (!open) return;
        setReactions(null);
        fetch(`/communaute/${postId}/reactions`, { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((json) => setReactions(json.reactions));
    }, [open, postId]);

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('communaute.reactions_titre', 'Réactions')}</DialogTitle>
                </DialogHeader>
                <div className="max-h-80 space-y-1 overflow-y-auto">
                    {reactions === null &&
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 py-2">
                                <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
                                <Skeleton className="h-3.5 w-32" />
                            </div>
                        ))}
                    {reactions?.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">{t('communaute.aucune_reaction', 'Aucune réaction pour le moment.')}</p>
                    )}
                    {reactions?.map((r) => (
                        <Link key={r.user.id} href={`/profil/${r.user.id}`} className="flex items-center gap-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
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
            </DialogContent>
        </Dialog>
    );
}
