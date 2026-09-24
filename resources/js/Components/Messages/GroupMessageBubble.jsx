import { router } from '@inertiajs/react';
import { FileText, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/**
 * Lightweight bubble for class-group chat messages — deliberately simpler
 * than MessageBubble (1-to-1 DMs): no edit/reply/forward/reactions, since
 * ClassGroupMessage doesn't support them. Shows the sender's name/avatar
 * since a group has more than one other participant, unlike a DM thread.
 */
export default function GroupMessageBubble({ message: m, isOwn }) {
    const { t } = useTranslations();

    function hide() {
        router.delete(`/groupes/messages/${m.id}`, { data: { scope: 'me' }, preserveScroll: true });
    }

    function unsend() {
        if (confirm(t('messages.confirmer_suppression', 'Supprimer ce message pour tout le monde ?'))) {
            router.delete(`/groupes/messages/${m.id}`, { data: { scope: 'everyone' }, preserveScroll: true });
        }
    }

    if (m.deleted_for_everyone) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <p className="max-w-xs rounded-2xl border border-dashed border-slate-200 px-3.5 py-2 text-xs italic text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    {t('messages.message_supprime', 'Ce message a été supprimé.')}
                </p>
            </div>
        );
    }

    return (
        <div className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
            {!isOwn && (
                <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={m.sender_avatar_path ? `/storage/${m.sender_avatar_path}` : undefined} alt="" />
                    <AvatarFallback>{m.sender_name?.[0]}</AvatarFallback>
                </Avatar>
            )}
            <div className="max-w-xs">
                {!isOwn && <p className="px-1 text-[11px] font-medium text-slate-400">{m.sender_name}</p>}
                {m.body && (
                    <p className={`rounded-2xl px-3.5 py-2 text-sm ${isOwn ? 'bg-isstm-navy text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                        {m.body}
                    </p>
                )}
                {m.attachments.map((a) => (
                    <a key={a.id} href={`/storage/${a.path}`} target="_blank" rel="noopener" className="mt-1 block">
                        {a.file_type === 'image' ? (
                            <img src={`/storage/${a.path}`} alt="" className="max-h-48 rounded-lg" />
                        ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-isstm-navy dark:text-white underline">
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                {a.original_name}
                            </span>
                        )}
                    </a>
                ))}
                <div className={`mt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 ${isOwn ? 'justify-end' : ''}`}>
                    <span>{formatTime(m.created_at)}</span>
                    <button onClick={hide} className="opacity-0 hover:underline group-hover:opacity-100">
                        {t('messages.masquer', 'Masquer')}
                    </button>
                    {isOwn && (
                        <button onClick={unsend} className="opacity-0 hover:text-red-600 group-hover:opacity-100" aria-label={t('communaute.supprimer', 'Supprimer')}>
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
