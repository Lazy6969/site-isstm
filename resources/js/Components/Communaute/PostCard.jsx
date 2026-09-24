import { Link, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, FileText, Heart, Send, ThumbsUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CommentItem from './CommentItem';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const COLLAPSED_COMMENT_COUNT = 3;

export default function PostCard({ post }) {
    const { t } = useTranslations();
    const { data, setData, post: submitComment, processing, reset } = useForm({ body: '', parent_id: null });
    const [showAllComments, setShowAllComments] = useState(false);

    function react(type) {
        router.post(`/communaute/${post.id}/reaction`, { type }, { preserveScroll: true });
    }

    function submitTopLevelComment(e) {
        e.preventDefault();
        submitComment(`/communaute/${post.id}/commentaires`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function destroyPost() {
        if (confirm(t('communaute.confirmer_suppression_post', 'Supprimer cette publication ?'))) {
            router.delete(`/communaute/${post.id}`, { preserveScroll: true });
        }
    }

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/profil/${post.user.id}`}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post.user.avatar_path ? `/storage/${post.user.avatar_path}` : undefined} alt="" />
                            <AvatarFallback>{post.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link href={`/profil/${post.user.id}`} className="font-semibold text-slate-800 hover:text-isstm-navy">
                            {post.user.name}
                        </Link>
                        <p className="text-xs text-slate-400">
                            {post.user.role_label} · {formatDate(post.created_at)}
                        </p>
                    </div>
                </div>
                <Badge>{post.type_label}</Badge>
            </div>

            {post.body && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{post.body}</p>}

            {post.media.length > 0 && (
                <div className={`mt-4 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {post.media.map((media) => (
                        <div
                            key={media.id}
                            className={`overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 ${post.media.length > 1 ? 'aspect-square' : ''}`}
                        >
                            {media.type === 'image' && (
                                <img
                                    src={`/storage/${media.path}`}
                                    alt=""
                                    className={`w-full ${post.media.length > 1 ? 'h-full object-cover' : 'max-h-[600px] object-contain'}`}
                                />
                            )}
                            {media.type === 'video' && (
                                <video
                                    src={`/storage/${media.path}`}
                                    controls
                                    className={`w-full ${post.media.length > 1 ? 'h-full object-cover' : 'max-h-[600px]'}`}
                                />
                            )}
                            {media.type === 'pdf' && (
                                <a
                                    href={`/storage/${media.path}`}
                                    target="_blank"
                                    rel="noopener"
                                    className="flex items-center gap-2 p-4 text-sm font-medium text-isstm-navy hover:underline"
                                >
                                    <FileText className="h-4 w-4" aria-hidden="true" />
                                    {t('communaute.voir_document', 'Voir le document')}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm">
                <button
                    onClick={() => react('like')}
                    className={`flex items-center gap-1.5 font-medium transition ${post.my_reaction === 'like' ? 'text-isstm-navy' : 'text-slate-500 hover:text-isstm-navy'}`}
                >
                    <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                    {t('communaute.jaime', "J'aime")} {post.likes > 0 && <span className="text-xs">({post.likes})</span>}
                </button>
                <button
                    onClick={() => react('love')}
                    className={`flex items-center gap-1.5 font-medium transition ${post.my_reaction === 'love' ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                >
                    <Heart className="h-4 w-4" aria-hidden="true" />
                    {t('communaute.jadore', "J'adore")} {post.loves > 0 && <span className="text-xs">({post.loves})</span>}
                </button>
                {post.can_manage && (
                    <button onClick={destroyPost} className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('communaute.supprimer', 'Supprimer')}
                    </button>
                )}
            </div>

            <div className="mt-2 border-t border-slate-100 pt-3">
                {(showAllComments ? post.comments : post.comments.slice(0, COLLAPSED_COMMENT_COUNT)).map((comment) => (
                    <CommentItem key={comment.id} postId={post.id} comment={comment} />
                ))}

                {post.comments.length > COLLAPSED_COMMENT_COUNT && (
                    <button
                        type="button"
                        onClick={() => setShowAllComments((v) => !v)}
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-isstm-navy hover:underline dark:text-white"
                    >
                        {showAllComments ? (
                            <>
                                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('communaute.reduire_commentaires', 'Réduire les commentaires')}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('communaute.voir_tous_commentaires', 'Voir les {count} commentaires').replace('{count}', post.comments.length)}
                            </>
                        )}
                    </button>
                )}

                <form onSubmit={submitTopLevelComment} className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder={t('communaute.ecrire_commentaire', 'Écrire un commentaire…')}
                        className="w-full rounded-full border border-slate-300 px-3.5 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                    />
                    <button
                        disabled={processing || !data.body}
                        className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('communaute.envoyer', 'Envoyer')}
                    </button>
                </form>
            </div>
        </Card>
    );
}
