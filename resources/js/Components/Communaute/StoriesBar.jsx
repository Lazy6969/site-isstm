import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import StoriesBarSkeleton from '../Loading/StoriesBarSkeleton';
import StoryViewer from './StoryViewer';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Horizontal row of 24h-expiring stories at the top of the fil communautaire
 * — rectangular cards (Facebook/Instagram-style, not circular avatars) so the
 * photo itself is visible at a glance. A "Créer une story" card for the
 * current user, then one card per other author with at least one active
 * story. Fetched separately from the page's Inertia props (like
 * NotificationBell) since stories expire independently of a full page reload.
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
                className="relative h-44 w-28 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 transition disabled:opacity-50 dark:ring-slate-700"
            >
                <img
                    src={user?.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                    alt=""
                    className="h-2/3 w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-white dark:bg-slate-800" />
                <span className="absolute left-1/2 top-2/3 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-community-accent text-white ring-4 ring-white dark:ring-slate-800">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="absolute inset-x-1 bottom-1.5 truncate text-center text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    {t('stories.creer', 'Créer une story')}
                </span>
            </button>

            {myGroup && myGroup.stories.length > 0 && (
                <button
                    type="button"
                    onClick={() => setViewer({ groupIndex: groups.indexOf(myGroup), storyIndex: 0 })}
                    className="relative h-44 w-28 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm ring-2 ring-community-accent"
                >
                    <img src={`/storage/${myGroup.stories[0].media_path}`} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                    <span className="absolute inset-x-2 bottom-2 truncate text-left text-xs font-semibold text-white">
                        {t('stories.mes_stories', 'Mes stories')}
                    </span>
                </button>
            )}

            {otherGroups.map((group) => (
                <button
                    key={group.user.id}
                    type="button"
                    onClick={() => setViewer({ groupIndex: groups.indexOf(group), storyIndex: 0 })}
                    className="relative h-44 w-28 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm ring-2 ring-community-accent"
                >
                    <img src={`/storage/${group.stories[0].media_path}`} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                    <img
                        src={group.user.avatar_path ? `/storage/${group.user.avatar_path}` : '/images/logo-isstm.jpg'}
                        alt=""
                        className="absolute left-2 top-2 h-8 w-8 rounded-full object-cover ring-2 ring-community-accent"
                    />
                    <span className="absolute inset-x-2 bottom-2 truncate text-left text-xs font-semibold text-white">{group.user.name}</span>
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
