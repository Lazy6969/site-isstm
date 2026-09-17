import { Link, router, useForm } from '@inertiajs/react';
import CommentItem from './CommentItem';

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function PostCard({ post }) {
    const { data, setData, post: submitComment, processing, reset } = useForm({ body: '', parent_id: null });

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
        if (confirm('Supprimer cette publication ?')) {
            router.delete(`/communaute/${post.id}`, { preserveScroll: true });
        }
    }

    return (
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/profil/${post.user.id}`}>
                        <img
                            src={post.user.avatar_path ? `/storage/${post.user.avatar_path}` : '/images/logo-isstm.jpg'}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                        />
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
                <span className="rounded-full bg-isstm-navy/10 px-2.5 py-1 text-xs font-semibold text-isstm-navy">{post.type_label}</span>
            </div>

            {post.body && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{post.body}</p>}

            {post.media.length > 0 && (
                <div className={`mt-4 grid gap-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {post.media.map((media) => (
                        <div key={media.id} className="overflow-hidden rounded-xl bg-slate-50">
                            {media.type === 'image' && <img src={`/storage/${media.path}`} alt="" className="max-h-96 w-full object-cover" />}
                            {media.type === 'video' && <video src={`/storage/${media.path}`} controls className="max-h-96 w-full" />}
                            {media.type === 'pdf' && (
                                <a href={`/storage/${media.path}`} target="_blank" rel="noopener" className="flex items-center gap-2 p-4 text-sm font-medium text-isstm-navy hover:underline">
                                    📄 Voir le document
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
                    👍 J'aime {post.likes > 0 && <span className="text-xs">({post.likes})</span>}
                </button>
                <button
                    onClick={() => react('love')}
                    className={`flex items-center gap-1.5 font-medium transition ${post.my_reaction === 'love' ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                >
                    ❤️ J'adore {post.loves > 0 && <span className="text-xs">({post.loves})</span>}
                </button>
                {post.can_manage && (
                    <button onClick={destroyPost} className="ml-auto text-xs font-medium text-slate-400 hover:text-red-600">
                        Supprimer
                    </button>
                )}
            </div>

            <div className="mt-2 border-t border-slate-100 pt-3">
                {post.comments.map((comment) => (
                    <CommentItem key={comment.id} postId={post.id} comment={comment} />
                ))}

                <form onSubmit={submitTopLevelComment} className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Écrire un commentaire…"
                        className="w-full rounded-full border border-slate-300 px-3.5 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                    />
                    <button disabled={processing || !data.body} className="rounded-full bg-isstm-navy px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                        Envoyer
                    </button>
                </form>
            </div>
        </article>
    );
}
