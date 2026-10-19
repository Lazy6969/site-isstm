import { router, useForm } from '@inertiajs/react';
import { Check, Clapperboard, Forward, Pencil, Reply, SmilePlus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ForwardMessageDialog from './ForwardMessageDialog';
import AttachmentPreview from './AttachmentPreview';
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatHourMinute(dateString) {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message: m, isOwn, isLastOwnMessage, conversations, friends, onReply }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const [editing, setEditing] = useState(false);
    const [forwardOpen, setForwardOpen] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const editForm = useForm({ body: m.body ?? '' });
    const bubbleRef = useRef(null);
    const longPressTimer = useRef(null);

    const totalReactions = Object.values(m.reactions ?? {}).reduce((sum, n) => sum + n, 0);
    const topReactions = REACTIONS.filter((r) => (m.reactions?.[r.value] ?? 0) > 0);

    // On touch devices there is no hover, so the action row (react/reply/
    // forward/edit/delete) stays invisible forever without this: a long
    // press reveals it, mirroring the timed-press pattern used for
    // multi-select in Notifications/Index.jsx, plus a short vibration.
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
        if (editing) return;
        longPressTimer.current = setTimeout(() => {
            setActionsOpen(true);
            navigator.vibrate?.(15);
        }, LONG_PRESS_MS);
    }

    function cancelLongPress() {
        clearTimeout(longPressTimer.current);
    }

    function hideMessage() {
        router.delete(`/messages/message/${m.id}`, { preserveScroll: true });
    }

    async function unsendMessage() {
        if (await confirmAction({ message: t('messages.confirmer_suppression', 'Supprimer ce message pour tout le monde ?'), title: 'Supprimer pour tout le monde ?', confirmLabel: 'Supprimer' })) {
            router.post(`/messages/message/${m.id}/supprimer`, {}, { preserveScroll: true });
        }
    }

    function react(type) {
        router.post(`/messages/message/${m.id}/reaction`, { type }, { preserveScroll: true });
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.patch(`/messages/message/${m.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    }

    if (m.deleted_at) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <p className="max-w-[75%] rounded-2xl border border-dashed border-slate-200 px-3.5 py-2 text-xs italic break-words text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    {t('messages.message_supprime', 'Ce message a été supprimé.')}
                </p>
            </div>
        );
    }

    return (
        <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                ref={bubbleRef}
                className="max-w-[75%]"
                onTouchStart={startLongPress}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setActionsOpen((v) => !v);
                }}
            >
                {m.reply_to && (
                    <div className={`mb-1 rounded-lg border-l-2 border-community-accent bg-slate-50 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400 ${isOwn ? 'text-right' : ''}`}>
                        <span className="font-medium">{m.reply_to.sender_name}</span> · {m.reply_to.body ?? t('messages.message_supprime_court', 'message supprimé')}
                    </div>
                )}

                {m.story_reply && (
                    <div className={`mb-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 ${isOwn ? 'flex-row-reverse text-right' : ''}`}>
                        <img
                            src={`/storage/${m.story_reply.media_path}`}
                            alt=""
                            className="h-10 w-10 flex-shrink-0 rounded-md object-cover ring-1 ring-black/5"
                        />
                        <span className="flex items-center gap-1">
                            <Clapperboard className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                            {isOwn
                                ? t('messages.vous_avez_repondu_story', 'Vous avez répondu à sa story')
                                : t('messages.a_repondu_story', 'A répondu à votre story')}
                        </span>
                    </div>
                )}

                {m.forwarded_from_sender && (
                    <p className={`mb-0.5 flex items-center gap-1 text-[11px] italic text-slate-400 ${isOwn ? 'justify-end' : ''}`}>
                        <Forward className="h-3 w-3" aria-hidden="true" />
                        {t('messages.transfere_de', 'Transféré de')} {m.forwarded_from_sender}
                    </p>
                )}

                <div className={`flex items-end gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {editing ? (
                        <form onSubmit={submitEdit} className="flex items-center gap-1.5">
                            <input
                                type="text"
                                autoFocus
                                value={editForm.data.body}
                                onChange={(e) => editForm.setData('body', e.target.value)}
                                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                            />
                            <button type="submit" className="text-emerald-600" aria-label={t('profil.enregistrer', 'Enregistrer')}>
                                <Check className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setEditing(false)} className="text-slate-400" aria-label={t('nav.annuler', 'Annuler')}>
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </form>
                    ) : (
                        <>
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
                                {isOwn && m.body && (
                                    <button
                                        onClick={() => {
                                            setActionsOpen(false);
                                            setEditing(true);
                                        }}
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        aria-label={t('communaute.modifier', 'Modifier')}
                                    >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"
                                        aria-label={t('communaute.supprimer', 'Supprimer')}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                                        <DropdownMenuItem onSelect={hideMessage}>
                                            {t('messages.supprimer_pour_moi', 'Supprimer pour moi')}
                                        </DropdownMenuItem>
                                        {isOwn && (
                                            <DropdownMenuItem onSelect={unsendMessage} className="text-red-600 hover:!text-red-700">
                                                {t('messages.supprimer_pour_tous', 'Supprimer pour tout le monde')}
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    )}
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
                    {m.edited_at && <span>· {t('communaute.modifie', 'Modifié')}</span>}
                </div>
                {isLastOwnMessage && m.read_at && (
                    <p className="mt-0.5 text-right text-[11px] text-slate-400 dark:text-slate-500">
                        {t('messages.vu_a', 'Vu à')} {formatHourMinute(m.read_at)}
                    </p>
                )}
            </div>

            <ForwardMessageDialog open={forwardOpen} onClose={() => setForwardOpen(false)} messageId={m.id} conversations={conversations} friends={friends} />
        </div>
    );
}
