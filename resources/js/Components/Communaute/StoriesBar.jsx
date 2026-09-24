import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import StoriesBarSkeleton from '../Loading/StoriesBarSkeleton';
import StoryViewer from './StoryViewer';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Horizontal ring of 24h-expiring stories at the top of the fil communautaire
 * — a "Créer une story" tile for the current user, then one tile per other
 * author with at least one active story. Fetched separately from the page's
 * Inertia props (like NotificationBell) since stories expire independently
 * of a full page reload.
 */
export default function StoriesBar() {
    const { auth } = usePage().props;
    const { t } = useTranslations();
    const user = auth?.user;
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewer, setViewer] = useState(null);
    const fileInputRef = useRef(null);

    function load() {
        setLoading(true);
        fetch('/stories', { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((json) => setGroups(json.groups))
            .finally(() => setLoading(false));
    }

    useEffect(load, []);

    function onFileSelected(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setUploading(true);
        router.post(
            '/stories',
            { media: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: load,
                onFinish: () => setUploading(false),
            },
        );
    }

    function onDeleted(storyId) {
        setGroups((prev) =>
            prev
                .map((group) => ({ ...group, stories: group.stories.filter((s) => s.id !== storyId) }))
                .filter((group) => group.stories.length > 0),
        );
        setViewer(null);
    }

    if (loading) {
        return <StoriesBarSkeleton />;
    }

    const myGroup = groups.find((g) => g.is_mine);
    const otherGroups = groups.filter((g) => !g.is_mine);

    return (
        <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelected} className="hidden" />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-shrink-0 flex-col items-center gap-1.5 disabled:opacity-50"
            >
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full ring-2 ring-community-accent">
                    <img
                        src={user?.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                        alt=""
                        className="h-full w-full rounded-full object-cover p-0.5"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-community-accent text-white ring-2 ring-white dark:ring-slate-900">
                        <Plus className="h-3 w-3" aria-hidden="true" />
                    </span>
                </span>
                <span className="max-w-16 truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t('stories.creer', 'Votre story')}
                </span>
            </button>

            {myGroup && myGroup.stories.length > 0 && (
                <button
                    type="button"
                    onClick={() => setViewer({ groupIndex: groups.indexOf(myGroup), storyIndex: 0 })}
                    className="flex flex-shrink-0 flex-col items-center gap-1.5"
                >
                    <span className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-community-accent">
                        <img src={`/storage/${myGroup.stories[0].media_path}`} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="max-w-16 truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {t('stories.mes_stories', 'Mes stories')}
                    </span>
                </button>
            )}

            {otherGroups.map((group) => (
                <button
                    key={group.user.id}
                    type="button"
                    onClick={() => setViewer({ groupIndex: groups.indexOf(group), storyIndex: 0 })}
                    className="flex flex-shrink-0 flex-col items-center gap-1.5"
                >
                    <span className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-community-accent">
                        <img src={`/storage/${group.stories[0].media_path}`} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="max-w-16 truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">{group.user.name}</span>
                </button>
            ))}

            {viewer && (
                <StoryViewer
                    groups={groups}
                    groupIndex={viewer.groupIndex}
                    storyIndex={viewer.storyIndex}
                    onNavigate={(groupIndex, storyIndex) => setViewer({ groupIndex, storyIndex })}
                    onClose={() => setViewer(null)}
                    onDeleted={onDeleted}
                />
            )}
        </div>
    );
}
