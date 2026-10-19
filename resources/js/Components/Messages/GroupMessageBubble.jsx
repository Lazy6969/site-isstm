import { Link, router } from '@inertiajs/react';
import { Forward, Reply, SmilePlus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import AttachmentPreview from './AttachmentPreview';
import ForwardMessageDialog from './ForwardMessageDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';
import { linkifyParts } from '../../lib/linkify';
import { useConfirm } from '../../lib/useConfirm';

const LONG_PRESS_MS = 500;

const REACTIONS = [
    { value: 'like', emoji: '👍' },
    { value: 'love', emoji: '❤️' },
    { value: 'haha', emoji: '😂' },
    { value: 'wouah', emoji: '😮' },
    { value: 'triste', emoji: '😢' },
    { value: 'grr', emoji: '😡' },
];

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/**
 * Class-group chat bubble — brought to feature parity with MessageBubble
 * (1-to-1 DMs): reactions, reply, forward (to a DM), profile links, and the
 * same mobile long-press reveal. Own/other alignment already matches DMs
 * (own on the right via flex-row-reverse); the sender's avatar/name stay
 * visible only for other members' messages, since a group has more than one
 * other participant unlike a DM thread.
 */
export default function GroupMessageBubble({ message: m, isOwn, canModerate, conversations, friends, onReply }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const [actionsOpen, setActionsOpen] = useState(false);
    const [forwardOpen, setForwardOpen] = useState(false);
    const bubbleRef = useRef(null);
    const longPressTimer = useRef(null);

    // On touch devices there is no hover, so the action row stays invisible
    // forever without this — mirrors the same long-press pattern as
    // MessageBubble (1-to-1 DMs).
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

    function react(type) {
        router.post(`/groupes/messages/${m.id}/reaction`, { type }, { preserveScroll: true });
    }

    const totalReactions = Object.values(m.reactions ?? {}).reduce((sum, n) => sum + n, 0);
    const topReactions = REACTIONS.filter((r) => (m.reactions?.[r.value] ?? 0) > 0);
    const canDeleteForEveryone = isOwn || canModerate;

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
                <Link href={`/profil/${m.sender_id}`} className="flex-shrink-0">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={m.sender_avatar_path ? `/storage/${m.sender_avatar_path}` : undefined} alt="" />
                        <AvatarFallback>{m.sender_name?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>
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
                {!isOwn && (
                    <Link href={`/profil/${m.sender_id}`} className="px-1 text-[11px] font-medium text-slate-400 hover:underline">
                        {m.sender_name}
                    </Link>
                )}

                {m.reply_to && (
                    <div className={`mb-1 rounded-lg border-l-2 border-community-accent bg-slate-50 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400 ${isOwn ? 'text-right' : ''}`}>
                        <span className="font-medium">{m.reply_to.sender_name}</span> · {m.reply_to.body ?? t('messages.message_supprime_court', 'message supprimé')}
                    </div>
                )}

                <div className={`flex items-end gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {m.body && (
                        <p className={`min-w-0 rounded-2xl px-3.5 py-2 text-sm break-all ${isOwn ? 'bg-isstm-navy text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
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

                    <div className={`flex items-center gap-0.5 transition ${actionsOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t('communaute.reactions_titre', 'Réactions')}>
                                <SmilePlus className="h-3.5 w-3.5" aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="flex w-auto gap-1 p-1.5">
                                {REACTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => react(r.value)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition hover:scale-125 ${m.my_reaction === r.value ? 'bg-isstm-navy/10' : ''}`}
                                    >
                                        {r.emoji}
                                    </button>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            onClick={() => {
                                setActionsOpen(false);
                                onReply();
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            aria-label={t('messages.repondre', 'Répondre')}
                        >
                            <Reply className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                            onClick={() => {
                                setActionsOpen(false);
                                setForwardOpen(true);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            aria-label={t('messages.transferer', 'Transférer')}
                        >
                            <Forward className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"
                                aria-label={t('communaute.supprimer', 'Supprimer')}
                            >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                                <DropdownMenuItem onSelect={hide}>{t('messages.supprimer_pour_moi', 'Supprimer pour moi')}</DropdownMenuItem>
                                {canDeleteForEveryone && (
                                    <DropdownMenuItem onSelect={unsend} className="text-red-600 hover:!text-red-700">
                                        {t('messages.supprimer_pour_tous', 'Supprimer pour tout le monde')}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {m.attachments.map((a) => (
                    <AttachmentPreview key={a.id} attachment={a} />
                ))}

                {totalReactions > 0 && (
                    <div className={`mt-0.5 flex items-center gap-0.5 text-xs ${isOwn ? 'justify-end' : ''}`}>
                        {topReactions.map((r) => (
                            <span key={r.value}>{r.emoji}</span>
                        ))}
                        <span className="text-slate-400">{totalReactions}</span>
                    </div>
                )}

                <div className={`mt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 ${isOwn ? 'justify-end' : ''}`}>
                    <span>{formatTime(m.created_at)}</span>
                </div>
            </div>

            <ForwardMessageDialog open={forwardOpen} onClose={() => setForwardOpen(false)} messageId={m.id} conversations={conversations} friends={friends} sourceType="groupe" />
        </div>
    );
}
