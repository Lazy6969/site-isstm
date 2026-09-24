import { Link, router, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Flattens a comment's reply tree into a single-level list, like
 * Facebook/Instagram: replying to a reply still threads server-side
 * (parent_id keeps pointing at the exact comment clicked), but every
 * descendant renders at the same indent under the top-level comment instead
 * of nesting deeper and deeper — a "@name" prefix keeps the context of who a
 * flattened reply was actually answering when that isn't the top-level author.
 */
function flattenReplies(replies, replyingToName) {
    return (replies ?? []).flatMap((reply) => [
        { ...reply, replyingToName },
        ...flattenReplies(reply.replies, reply.user.name),
    ]);
}

function CommentBubble({ postId, comment, replyingToName, indented, highlighted }) {
    const { t } = useTranslations();
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ body: '', parent_id: comment.id });
    const editForm = useForm({ body: comment.body });
    const bubbleRef = useRef(null);

    useEffect(() => {
        if (highlighted) {
            bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlighted]);

    function submitReply(e) {
        e.preventDefault();
        post(`/communaute/${postId}/commentaires`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setReplying(false);
            },
        });
    }

    function startEditing() {
        editForm.setData('body', comment.body);
        setEditing(true);
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.patch(`/commentaires/${comment.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    }

    function destroy() {
        if (confirm(t('communaute.confirmer_suppression_commentaire', 'Supprimer ce commentaire ?'))) {
            router.delete(`/commentaires/${comment.id}`, { preserveScroll: true });
        }
    }

    return (
        <div ref={bubbleRef} className={indented ? 'ml-8 mt-3' : 'mt-3'}>
            <div className="flex items-start gap-2.5">
                <Link href={`/profil/${comment.user.id}`} className="flex-shrink-0">
                    <Avatar className="mt-0.5 h-8 w-8">
                        <AvatarImage src={comment.user.avatar_path ? `/storage/${comment.user.avatar_path}` : undefined} alt="" />
                        <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                    <div className={highlighted ? 'inline-block rounded-2xl bg-blue-500/10 px-3.5 py-2 ring-2 ring-blue-400' : ''}>
                        <Link href={`/profil/${comment.user.id}`} className="text-sm font-semibold text-slate-800 hover:text-isstm-navy dark:text-slate-100">
                            {comment.user.name}
                        </Link>

                        {editing ? (
                            <form onSubmit={submitEdit} className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    value={editForm.data.body}
                                    onChange={(e) => editForm.setData('body', e.target.value)}
                                    className="w-full rounded-full border border-slate-300 px-3.5 py-1.5 text-[13px] focus:border-isstm-navy focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    disabled={editForm.processing}
                                    className="flex-shrink-0 rounded-full bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                >
                                    {t('communaute.enregistrer', 'Enregistrer')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="flex-shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-slate-600 dark:text-slate-400"
                                >
                                    {t('nav.annuler', 'Annuler')}
                                </button>
                            </form>
                        ) : (
                            <p className="text-[13px] text-slate-700 dark:text-slate-300">
                                {replyingToName && <span className="font-medium text-isstm-navy dark:text-white">@{replyingToName} </span>}
                                {comment.body}
                                {comment.edited_at && <span className="ml-1 text-[11px] text-slate-400">({t('communaute.modifie', 'Modifié')})</span>}
                            </p>
                        )}
                    </div>
                    {!editing && (
                        <div className="mt-1 flex gap-3 text-xs text-slate-400">
                            <button onClick={() => setReplying((v) => !v)} className="font-medium hover:text-isstm-navy">
                                {t('communaute.repondre', 'Répondre')}
                            </button>
                            {comment.can_manage && (
                                <button onClick={startEditing} className="font-medium hover:text-isstm-navy">
                                    {t('communaute.modifier', 'Modifier')}
                                </button>
                            )}
                            {comment.can_manage && (
                                <button onClick={destroy} className="font-medium hover:text-red-600">
                                    {t('communaute.supprimer', 'Supprimer')}
                                </button>
                            )}
                        </div>
                    )}

                    {replying && (
                        <form onSubmit={submitReply} className="mt-2 flex gap-2">
                            <input
                                type="text"
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder={t('communaute.votre_reponse', 'Votre réponse…')}
                                className="w-full rounded-full border border-slate-300 px-3.5 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                                autoFocus
                            />
                            <button
                                disabled={processing}
                                className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('communaute.envoyer', 'Envoyer')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CommentItem({ postId, comment, showReplies = true, highlightCommentId = null }) {
    const flatReplies = useMemo(() => flattenReplies(comment.replies, null), [comment.replies]);

    return (
        <>
            <CommentBubble postId={postId} comment={comment} indented={false} highlighted={comment.id === highlightCommentId} />
            {showReplies && flatReplies.map((reply) => (
                <CommentBubble
                    key={reply.id}
                    postId={postId}
                    comment={reply}
                    replyingToName={reply.replyingToName}
                    indented
                    highlighted={reply.id === highlightCommentId}
                />
            ))}
        </>
    );
}
