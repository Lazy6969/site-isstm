import { router, useForm } from '@inertiajs/react';
import { Check, FileText, Forward, Pencil, Reply, SmilePlus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import ForwardMessageDialog from './ForwardMessageDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';

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

export default function MessageBubble({ message: m, isOwn, isLastOwnMessage, conversations, onReply }) {
    const { t } = useTranslations();
    const [editing, setEditing] = useState(false);
    const [forwardOpen, setForwardOpen] = useState(false);
    const editForm = useForm({ body: m.body ?? '' });

    const totalReactions = Object.values(m.reactions ?? {}).reduce((sum, n) => sum + n, 0);
    const topReactions = REACTIONS.filter((r) => (m.reactions?.[r.value] ?? 0) > 0);

    function hideMessage() {
        router.delete(`/messages/message/${m.id}`, { preserveScroll: true });
    }

    function unsendMessage() {
        if (confirm(t('messages.confirmer_suppression', 'Supprimer ce message pour tout le monde ?'))) {
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
                <p className="max-w-xs rounded-2xl border border-dashed border-slate-200 px-3.5 py-2 text-xs italic text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    {t('messages.message_supprime', 'Ce message a été supprimé.')}
                </p>
            </div>
        );
    }

    return (
        <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs">
                {m.reply_to && (
                    <div className={`mb-1 rounded-lg border-l-2 border-community-accent bg-slate-50 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400 ${isOwn ? 'text-right' : ''}`}>
                        <span className="font-medium">{m.reply_to.sender_name}</span> · {m.reply_to.body ?? t('messages.message_supprime_court', 'message supprimé')}
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
                                <p className={`rounded-2xl px-3.5 py-2 text-sm ${isOwn ? 'bg-isstm-navy text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                                    {m.body}
                                </p>
                            )}

                            <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
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
                                <button onClick={onReply} className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t('messages.repondre', 'Répondre')}>
                                    <Reply className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                                <button onClick={() => setForwardOpen(true)} className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t('messages.transferer', 'Transférer')}>
                                    <Forward className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                                {isOwn && m.body && (
                                    <button onClick={() => setEditing(true)} className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t('communaute.modifier', 'Modifier')}>
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                )}
                                {isOwn && (
                                    <button onClick={unsendMessage} className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700" aria-label={t('communaute.supprimer', 'Supprimer')}>
                                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

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
                    <button onClick={hideMessage} className="opacity-0 hover:underline group-hover:opacity-100">
                        {t('messages.masquer', 'Masquer')}
                    </button>
                </div>
                {isLastOwnMessage && m.read_at && (
                    <p className="mt-0.5 text-right text-[11px] text-slate-400 dark:text-slate-500">
                        {t('messages.vu_a', 'Vu à')} {formatHourMinute(m.read_at)}
                    </p>
                )}
            </div>

            <ForwardMessageDialog open={forwardOpen} onClose={() => setForwardOpen(false)} messageId={m.id} conversations={conversations} />
        </div>
    );
}
