import { router } from '@inertiajs/react';
import { Eye, Heart, Send, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import StoryReactionsDialog from './StoryReactionsDialog';
import { useTranslations } from '../../lib/useTranslations';
import { xsrfToken } from '../../lib/csrf';
import { useConfirm } from '../../lib/useConfirm';

const STORY_DURATION_MS = 5000;

const REACTIONS = [
    { value: 'like', emoji: '👍' },
    { value: 'love', emoji: '❤️' },
    { value: 'haha', emoji: '😂' },
    { value: 'wouah', emoji: '😮' },
    { value: 'triste', emoji: '😢' },
    { value: 'grr', emoji: '😡' },
];

function timeAgo(dateString) {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;

    return `${Math.floor(hours / 24)} j`;
}

/**
 * Full-screen story viewer: one segmented progress bar per story in the
 * current author's group, auto-advancing every 5s, with left/right tap
 * zones to move within the group and roll over into the next/previous
 * author's group at the ends. Non-owners can react (a Facebook-style emoji
 * picker) and reply, which starts/continues a direct conversation with the
 * story's author; the author instead sees a reaction-count badge that opens
 * the (owner-only) list of who reacted with what.
 */
export default function StoryViewer({ groups, groupIndex, storyIndex, onNavigate, onClose, onDeleted }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const group = groups[groupIndex];
    const story = group?.stories[storyIndex];
    const [paused, setPaused] = useState(false);
    const [myReaction, setMyReaction] = useState(story?.my_reaction ?? null);
    const [reactionsCount, setReactionsCount] = useState(story?.reactions_count ?? 0);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [reactionsDialogOpen, setReactionsDialogOpen] = useState(false);
    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const replyInputRef = useRef(null);

    useEffect(() => {
        setMyReaction(story?.my_reaction ?? null);
        setReactionsCount(story?.reactions_count ?? 0);
        setPickerOpen(false);
        setReply('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [story?.id]);

    useEffect(() => {
        if (!story || paused) {
            return undefined;
        }

        const timer = setTimeout(goNext, STORY_DURATION_MS);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupIndex, storyIndex, paused]);

    useEffect(() => {
        if (!story || story.can_manage) return;

        fetch(`/stories/${story.id}/vue`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [story?.id]);

    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        }
        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupIndex, storyIndex]);

    if (!story) {
        return null;
    }

    function goNext() {
        if (storyIndex + 1 < group.stories.length) {
            onNavigate(groupIndex, storyIndex + 1);
        } else if (groupIndex + 1 < groups.length) {
            onNavigate(groupIndex + 1, 0);
        } else {
            onClose();
        }
    }

    function goPrev() {
        if (storyIndex > 0) {
            onNavigate(groupIndex, storyIndex - 1);
        } else if (groupIndex > 0) {
            onNavigate(groupIndex - 1, groups[groupIndex - 1].stories.length - 1);
        }
    }

    async function remove() {
        if (!(await confirmAction({ message: t('stories.confirmer_suppression', 'Supprimer cette story ?'), title: 'Supprimer cette story ?', confirmLabel: 'Supprimer' }))) {
            return;
        }
        router.delete(`/stories/${story.id}`, {
            preserveScroll: true,
            onSuccess: () => onDeleted(story.id),
        });
    }

    function react(type) {
        const wasReacted = myReaction === type;
        setMyReaction(wasReacted ? null : type);
        setReactionsCount((count) => count + (wasReacted ? -1 : myReaction ? 0 : 1));
        setPickerOpen(false);

        fetch(`/stories/${story.id}/reaction`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
            body: JSON.stringify({ type }),
        }).catch(() => {});
    }

    function sendReply(e) {
        e.preventDefault();
        if (!reply.trim() || sendingReply) return;

        setSendingReply(true);
        router.post(
            `/stories/${story.id}/repondre`,
            { body: reply },
            { onFinish: () => setSendingReply(false) },
        );
    }

    const activeReaction = REACTIONS.find((r) => r.value === myReaction);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            <div className="flex gap-1 px-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
                {group.stories.map((s, i) => (
                    <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                        {i < storyIndex && <div className="h-full w-full bg-white" />}
                        {i === storyIndex && (
                            <div
                                key={`${groupIndex}-${storyIndex}-${paused}`}
                                className="h-full bg-white"
                                style={{
                                    animation: paused ? 'none' : `story-progress ${STORY_DURATION_MS}ms linear forwards`,
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <img
                        src={group.user.avatar_path ? `/storage/${group.user.avatar_path}` : '/images/logo-isstm.jpg'}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40"
                    />
                    <div className="text-white">
                        <p className="text-sm font-semibold">{group.user.name}</p>
                        <p className="text-xs text-white/70">{timeAgo(story.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {story.views_count != null && (
                        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90">
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            {story.views_count}
                        </span>
                    )}
                    {story.can_manage && reactionsCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setReactionsDialogOpen(true)}
                            className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20"
                        >
                            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                            {reactionsCount}
                        </button>
                    )}
                    {story.can_manage && (
                        <button
                            type="button"
                            onClick={remove}
                            aria-label={t('stories.supprimer', 'Supprimer')}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('stories.fermer', 'Fermer')}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                <img
                    src={`/storage/${story.media_path}`}
                    alt={story.caption ?? ''}
                    className="max-h-full max-w-full object-contain"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                />
                {!pickerOpen && (
                    <>
                        <button type="button" onClick={goPrev} aria-label={t('stories.precedent', 'Story précédente')} className="absolute inset-y-0 left-0 w-1/3" />
                        <button type="button" onClick={goNext} aria-label={t('stories.suivant', 'Story suivante')} className="absolute inset-y-0 right-0 w-1/3" />
                    </>
                )}
            </div>

            {story.caption && (
                <p className="px-4 pb-3 text-center text-sm text-white/90">{story.caption}</p>
            )}

            {!story.can_manage && (
                <form
                    onSubmit={sendReply}
                    className="flex items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-1"
                >
                    <input
                        ref={replyInputRef}
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onFocus={() => setPaused(true)}
                        onBlur={() => setPaused(false)}
                        placeholder={t('stories.repondre_placeholder', 'Répondre à la story…')}
                        maxLength={2000}
                        className="h-11 flex-1 min-w-0 rounded-full border border-white/30 bg-transparent px-4 text-sm text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
                    />

                    <div className="relative flex-shrink-0">
                        {pickerOpen && (
                            <div className="absolute bottom-full right-0 mb-2 flex gap-1 rounded-full bg-white p-1.5 shadow-xl">
                                {REACTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => react(r.value)}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:scale-125 ${
                                            myReaction === r.value ? 'bg-isstm-navy/10' : ''
                                        }`}
                                    >
                                        {r.emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => (activeReaction ? react(activeReaction.value) : setPickerOpen((v) => !v))}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setPickerOpen((v) => !v);
                            }}
                            aria-label={t('stories.reagir', 'Réagir')}
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                        >
                            {activeReaction ? <span className="text-lg">{activeReaction.emoji}</span> : <Heart className="h-5 w-5" aria-hidden="true" />}
                        </button>
                    </div>

                    {reply.trim() && (
                        <button
                            type="submit"
                            disabled={sendingReply}
                            aria-label={t('communaute.envoyer', 'Envoyer')}
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-isstm-gold text-isstm-navy-dark transition hover:brightness-110 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </form>
            )}

            <StoryReactionsDialog open={reactionsDialogOpen} onClose={() => setReactionsDialogOpen(false)} storyId={story.id} />
        </div>
    );
}
