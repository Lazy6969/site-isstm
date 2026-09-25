import { Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Bookmark,
    ChevronDown,
    ChevronUp,
    Copy,
    Download,
    Eye,
    FileText,
    Flag,
    Globe,
    MessageSquareOff,
    MessageSquareText,
    MoreHorizontal,
    Pencil,
    Pin,
    PinOff,
    Send,
    Share2,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CommentItem from './CommentItem';
import ExpandableText from './ExpandableText';
import ReportPostDialog from './ReportPostDialog';
import EditPostDialog from './EditPostDialog';
import ReactionsListDialog from './ReactionsListDialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';

const REACTIONS = [
    { value: 'like', emoji: '👍', labelKey: 'communaute.jaime', label: "J'aime" },
    { value: 'love', emoji: '❤️', labelKey: 'communaute.jadore', label: "J'adore" },
    { value: 'haha', emoji: '😂', labelKey: 'communaute.haha', label: 'Haha' },
    { value: 'wouah', emoji: '😮', labelKey: 'communaute.wouah', label: 'Wouah' },
    { value: 'triste', emoji: '😢', labelKey: 'communaute.triste', label: 'Triste' },
    { value: 'grr', emoji: '😡', labelKey: 'communaute.grr', label: 'Grr' },
];

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function MediaGrid({ media, compact = false }) {
    if (media.length === 0) return null;

    if (media.length === 1 && media[0].type === 'image') {
        return (
            <div className="mt-3 flex justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900">
                <a href={`/storage/${media[0].path}`} download>
                    <img
                        src={`/storage/${media[0].path}`}
                        alt=""
                        className={`h-auto w-auto max-w-full ${compact ? 'max-h-72' : 'max-h-[600px]'} object-contain`}
                    />
                </a>
            </div>
        );
    }

    return (
        <div className={`mt-3 grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {media.map((m) => (
                <div key={m.id} className={`overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 ${media.length > 1 ? 'aspect-square' : ''}`}>
                    {m.type === 'image' && (
                        <a href={`/storage/${m.path}`} download className="block h-full w-full">
                            <img
                                src={`/storage/${m.path}`}
                                alt=""
                                className={`w-full ${media.length > 1 ? 'h-full object-cover' : `${compact ? 'max-h-72' : 'max-h-[600px]'} object-contain`}`}
                            />
                        </a>
                    )}
                    {m.type === 'video' && (
                        <div className="relative">
                            <video
                                src={`/storage/${m.path}`}
                                controls
                                className={`w-full ${media.length > 1 ? 'h-full object-cover' : compact ? 'max-h-72' : 'max-h-[600px]'}`}
                            />
                            <a
                                href={`/storage/${m.path}`}
                                download
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
                                aria-label="Télécharger la vidéo"
                            >
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        </div>
                    )}
                    {m.type === 'pdf' && (
                        <div className="flex items-center gap-2 p-4 text-sm font-medium text-isstm-navy">
                            <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            <a href={`/storage/${m.path}`} target="_blank" rel="noopener" className="hover:underline">
                                Voir le document
                            </a>
                            <a href={`/storage/${m.path}`} download className="ml-auto flex-shrink-0" aria-label="Télécharger le document">
                                <Download className="h-4 w-4" aria-hidden="true" />
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function SharedPostPreview({ post }) {
    return (
        <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
                <Link href={`/profil/${post.user.id}`}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={post.user.avatar_path ? `/storage/${post.user.avatar_path}` : undefined} alt="" />
                        <AvatarFallback>{post.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div>
                    <Link href={`/profil/${post.user.id}`} className="text-sm font-semibold text-slate-800 hover:text-isstm-navy dark:text-slate-100">
                        {post.user.name}
                    </Link>
                    <p className="text-xs text-slate-400">{formatDate(post.created_at)}</p>
                </div>
            </div>
            {post.body && <ExpandableText text={post.body} className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200" />}
            <MediaGrid media={post.media} compact />
        </div>
    );
}

const COLLAPSED_COMMENT_COUNT = 1;
const HOVER_CLOSE_DELAY_MS = 300;

export default function PostCard({ post, highlightCommentId = null }) {
    const { t } = useTranslations();
    const { data, setData, post: submitComment, processing, reset } = useForm({ body: '', parent_id: null });
    const [showAllComments, setShowAllComments] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [reactionsOpen, setReactionsOpen] = useState(false);
    const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
    const reactionCloseTimer = useRef(null);

    useEffect(() => {
        if (highlightCommentId) {
            setShowAllComments(true);
        }
    }, [highlightCommentId]);

    function openReactionPicker() {
        clearTimeout(reactionCloseTimer.current);
        setReactionPickerOpen(true);
    }

    function scheduleCloseReactionPicker() {
        reactionCloseTimer.current = setTimeout(() => setReactionPickerOpen(false), HOVER_CLOSE_DELAY_MS);
    }

    const totalReactions = Object.values(post.reactions).reduce((sum, n) => sum + n, 0);
    const topReactions = REACTIONS.filter((r) => post.reactions[r.value] > 0)
        .sort((a, b) => post.reactions[b.value] - post.reactions[a.value])
        .slice(0, 3);
    const activeReaction = REACTIONS.find((r) => r.value === post.my_reaction);

    function react(type) {
        router.post(`/communaute/${post.id}/reaction`, { type }, { preserveScroll: true });
    }

    function toggleSave() {
        router.post(`/communaute/${post.id}/enregistrer`, {}, { preserveScroll: true });
    }

    function hidePost() {
        router.post(`/communaute/${post.id}/masquer`, {}, { preserveScroll: true });
    }

    function sharePost() {
        router.post('/communaute', { type: post.type, shared_post_id: post.id }, { preserveScroll: true });
    }

    function copyLink() {
        navigator.clipboard?.writeText(`${window.location.origin}/communaute/${post.id}`);
    }

    function toggleArchive() {
        router.post(`/communaute/${post.id}/archiver`, {}, { preserveScroll: true });
    }

    function togglePin() {
        router.post(`/communaute/${post.id}/epingler`, {}, { preserveScroll: true });
    }

    function toggleComments() {
        router.post(`/communaute/${post.id}/commentaires-toggle`, {}, { preserveScroll: true });
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
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                            <Link href={`/profil/${post.user.id}`} className="hover:text-isstm-navy">
                                {post.user.name}
                            </Link>
                            {post.mood && <span className="font-normal"> {t('communaute.se_sent', 'se sent')} {post.mood}</span>}
                            {post.tagged_users?.length > 0 && (
                                <span className="font-normal">
                                    {' '}
                                    {t('communaute.avec', 'avec')}{' '}
                                    {post.tagged_users.map((u, i) => (
                                        <span key={u.id}>
                                            <Link href={`/profil/${u.id}`} className="font-semibold hover:text-isstm-navy">
                                                {u.name}
                                            </Link>
                                            {i < post.tagged_users.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </span>
                            )}
                            {post.location && (
                                <span className="font-normal">
                                    {' '}
                                    {t('communaute.a', 'à')} <span className="font-semibold">{post.location}</span>
                                </span>
                            )}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                            {post.user.role_label} · {formatDate(post.created_at)}
                            {post.edited_at && ` · ${t('communaute.modifie', 'Modifié')}`}
                            {post.visibility === 'amis' ? (
                                <Users className="ml-1 h-3 w-3" aria-hidden="true">
                                    <title>{t('communaute.visibilite_amis', 'Amis')}</title>
                                </Users>
                            ) : (
                                <Globe className="ml-1 h-3 w-3" aria-hidden="true">
                                    <title>{t('communaute.visibilite_public', 'Public')}</title>
                                </Globe>
                            )}
                            {post.views_count > 0 && (
                                <span className="ml-1 flex items-center gap-0.5">
                                    <Eye className="h-3 w-3" aria-hidden="true" />
                                    {post.views_count}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {post.is_pinned && (
                        <Badge variant="gold">
                            <Pin className="h-3 w-3" aria-hidden="true" />
                            {t('communaute.epingle', 'Épinglé')}
                        </Badge>
                    )}
                    <Badge>{post.type_label}</Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                            aria-label={t('communaute.plus_options', "Plus d'options")}
                        >
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={toggleSave}>
                                <Bookmark className="h-4 w-4" aria-hidden="true" />
                                {post.is_saved
                                    ? t('communaute.retirer_enregistrement', 'Retirer des enregistrements')
                                    : t('communaute.enregistrer', 'Enregistrer')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={copyLink}>
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                {t('communaute.copier_lien', 'Copier le lien')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={hidePost}>
                                {t('communaute.masquer_publication', 'Masquer cette publication')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setReportOpen(true)}>
                                <Flag className="h-4 w-4" aria-hidden="true" />
                                {t('communaute.signaler', 'Signaler')}
                            </DropdownMenuItem>
                            {post.can_manage && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                                        <Pencil className="h-4 w-4" aria-hidden="true" />
                                        {t('communaute.modifier', 'Modifier')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={togglePin}>
                                        {post.is_pinned ? (
                                            <>
                                                <PinOff className="h-4 w-4" aria-hidden="true" />
                                                {t('communaute.desepingler', 'Désépingler')}
                                            </>
                                        ) : (
                                            <>
                                                <Pin className="h-4 w-4" aria-hidden="true" />
                                                {t('communaute.epingler', 'Épingler en haut du fil')}
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={toggleArchive}>
                                        {post.is_archived ? (
                                            <>
                                                <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                                                {t('communaute.desarchiver', 'Désarchiver')}
                                            </>
                                        ) : (
                                            <>
                                                <Archive className="h-4 w-4" aria-hidden="true" />
                                                {t('communaute.archiver', 'Archiver')}
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={toggleComments}>
                                        {post.comments_disabled ? (
                                            <>
                                                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                                                {t('communaute.reactiver_commentaires', 'Réactiver les commentaires')}
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquareOff className="h-4 w-4" aria-hidden="true" />
                                                {t('communaute.desactiver_commentaires', 'Désactiver les commentaires')}
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={destroyPost} className="text-red-600">
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        {t('communaute.supprimer', 'Supprimer')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {post.body && <ExpandableText text={post.body} className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200" />}

            {post.shared_post ? <SharedPostPreview post={post.shared_post} /> : <MediaGrid media={post.media} />}

            {(totalReactions > 0 || post.comments.length > 0) && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    {totalReactions > 0 ? (
                        <button type="button" onClick={() => setReactionsOpen(true)} className="flex items-center gap-1.5 hover:underline">
                            <span className="flex -space-x-1">
                                {topReactions.map((r) => (
                                    <span key={r.value} className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] ring-1 ring-white dark:bg-slate-800">
                                        {r.emoji}
                                    </span>
                                ))}
                            </span>
                            {totalReactions}
                        </button>
                    ) : (
                        <span />
                    )}
                    {post.comments.length > 0 && (
                        <button type="button" onClick={() => setShowAllComments(true)} className="hover:underline">
                            {t('communaute.nombre_commentaires', '{count} commentaires').replace('{count}', post.comments.length)}
                        </button>
                    )}
                </div>
            )}

            <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-sm dark:border-slate-700">
                <div className="relative" onMouseEnter={openReactionPicker} onMouseLeave={scheduleCloseReactionPicker}>
                    {reactionPickerOpen && (
                        <div className="absolute bottom-full left-0 z-10 mb-1 flex w-auto gap-1 rounded-full bg-white p-1.5 shadow-xl ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                            {REACTIONS.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => {
                                        react(r.value);
                                        setReactionPickerOpen(false);
                                    }}
                                    title={t(r.labelKey, r.label)}
                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:scale-125 ${
                                        post.my_reaction === r.value ? 'bg-isstm-navy/10' : ''
                                    }`}
                                >
                                    {r.emoji}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => react(post.my_reaction ?? 'like')}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition ${
                            activeReaction ? 'text-isstm-navy dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <span aria-hidden="true">{activeReaction?.emoji ?? '👍'}</span>
                        {activeReaction ? t(activeReaction.labelKey, activeReaction.label) : t('communaute.jaime', "J'aime")}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={sharePost}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    {t('communaute.partager', 'Partager')}
                </button>
            </div>

            <div className="mt-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                {(showAllComments ? post.comments : post.comments.slice(0, COLLAPSED_COMMENT_COUNT)).map((comment) => (
                    <CommentItem
                        key={comment.id}
                        postId={post.id}
                        comment={comment}
                        showReplies={showAllComments}
                        highlightCommentId={highlightCommentId}
                    />
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

                {post.comments_disabled ? (
                    <p className="mt-3 text-xs text-slate-400">{t('communaute.commentaires_desactives', 'Les commentaires sont désactivés pour cette publication.')}</p>
                ) : (
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
                )}
            </div>

            <ReportPostDialog open={reportOpen} onClose={() => setReportOpen(false)} postId={post.id} />
            <EditPostDialog open={editOpen} onClose={() => setEditOpen(false)} post={post} />
            <ReactionsListDialog open={reactionsOpen} onClose={() => setReactionsOpen(false)} postId={post.id} />
        </Card>
    );
}
