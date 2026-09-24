import { router } from '@inertiajs/react';
import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

const STORY_DURATION_MS = 5000;

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
 * author's group at the ends.
 */
export default function StoryViewer({ groups, groupIndex, storyIndex, onNavigate, onClose, onDeleted }) {
    const { t } = useTranslations();
    const group = groups[groupIndex];
    const story = group?.stories[storyIndex];
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!story || paused) {
            return undefined;
        }

        const timer = setTimeout(goNext, STORY_DURATION_MS);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupIndex, storyIndex, paused]);

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

    function remove() {
        if (!window.confirm(t('stories.confirmer_suppression', 'Supprimer cette story ?'))) {
            return;
        }
        router.delete(`/stories/${story.id}`, {
            preserveScroll: true,
            onSuccess: () => onDeleted(story.id),
        });
    }

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
                <button type="button" onClick={goPrev} aria-label={t('stories.precedent', 'Story précédente')} className="absolute inset-y-0 left-0 w-1/3" />
                <button type="button" onClick={goNext} aria-label={t('stories.suivant', 'Story suivante')} className="absolute inset-y-0 right-0 w-1/3" />
            </div>

            {story.caption && (
                <p className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] text-center text-sm text-white/90">{story.caption}</p>
            )}
        </div>
    );
}
