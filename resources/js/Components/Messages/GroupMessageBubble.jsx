import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import AttachmentPreview from './AttachmentPreview';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';
import { linkifyParts } from '../../lib/linkify';
import { useConfirm } from '../../lib/useConfirm';

const LONG_PRESS_MS = 500;

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
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const [actionsOpen, setActionsOpen] = useState(false);
    const bubbleRef = useRef(null);
    const longPressTimer = useRef(null);

    // On touch devices there is no hover, so the delete control stays
    // invisible forever without this — mirrors the same long-press pattern
    // as MessageBubble (1-to-1 DMs).
    useEffect(() => {
        if (!actionsOpen) return undefined;

        function onOutside(e) {
            if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
                setActionsOpen(false);
            }
        }
        document.addEventListener('mousedown', onOutside);
        document.addEventListener('touchstart', onOutside);
        return () => {
            document.removeEventListener('mousedown', onOutside);
            document.removeEventListener('touchstart', onOutside);
        };
    }, [actionsOpen]);

    function startLongPress() {
        longPressTimer.current = setTimeout(() => {
            setActionsOpen(true);
            navigator.vibrate?.(15);
        }, LONG_PRESS_MS);
    }

    function cancelLongPress() {
        clearTimeout(longPressTimer.current);
    }

    function hide() {
        router.delete(`/groupes/messages/${m.id}`, { data: { scope: 'me' }, preserveScroll: true });
    }

    async function unsend() {
        if (await confirmAction({ message: t('messages.confirmer_suppression', 'Supprimer ce message pour tout le monde ?'), title: 'Supprimer pour tout le monde ?', confirmLabel: 'Supprimer' })) {
            router.delete(`/groupes/messages/${m.id}`, { data: { scope: 'everyone' }, preserveScroll: true });
        }
    }

    if (m.deleted_for_everyone) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <p className="max-w-[75%] rounded-2xl border border-dashed border-slate-200 px-3.5 py-2 text-xs italic break-words text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    {t('messages.message_supprime', 'Ce message a été supprimé.')}
                </p>
            </div>
        );
    }

    return (
        <div className={`group flex min-w-0 items-end gap-2 ${isOwn ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
            {!isOwn && (
                <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={m.sender_avatar_path ? `/storage/${m.sender_avatar_path}` : undefined} alt="" />
                    <AvatarFallback>{m.sender_name?.[0]}</AvatarFallback>
                </Avatar>
            )}
            <div
                ref={bubbleRef}
                className="min-w-0 max-w-[75%]"
                onTouchStart={startLongPress}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setActionsOpen((v) => !v);
                }}
            >
                {!isOwn && <p className="px-1 text-[11px] font-medium text-slate-400">{m.sender_name}</p>}
                {m.body && (
                    <p className={`rounded-2xl px-3.5 py-2 text-sm break-all ${isOwn ? 'bg-isstm-navy text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                        {linkifyParts(m.body).map((part) =>
                            part.url ? (
                                <a key={part.key} href={part.url} target="_blank" rel="noopener" className="underline">
                                    {part.url}
                                </a>
                            ) : (
                                <span key={part.key}>{part.text}</span>
                            ),
                        )}
                    </p>
                )}
                {m.attachments.map((a) => (
                    <AttachmentPreview key={a.id} attachment={a} />
                ))}
                <div className={`mt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 ${isOwn ? 'justify-end' : ''}`}>
                    <span>{formatTime(m.created_at)}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={`flex items-center transition hover:text-red-600 ${actionsOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            aria-label={t('communaute.supprimer', 'Supprimer')}
                        >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                            <DropdownMenuItem onSelect={hide}>{t('messages.supprimer_pour_moi', 'Supprimer pour moi')}</DropdownMenuItem>
                            {isOwn && (
                                <DropdownMenuItem onSelect={unsend} className="text-red-600 hover:!text-red-700">
                                    {t('messages.supprimer_pour_tous', 'Supprimer pour tout le monde')}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
