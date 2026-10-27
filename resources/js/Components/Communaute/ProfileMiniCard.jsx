import { Link } from '@inertiajs/react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

/**
 * Left sidebar's own entry point to the viewer's profile — an avatar, name
 * and role/filière, distinct from the right sidebar's "Paramètres du profil"
 * shortcut (ShortcutsSidebar), which links to the settings screen rather
 * than the public profile page.
 */
export default function ProfileMiniCard({ profile }) {
    if (!profile) {
        return null;
    }

    return (
        <Link
            href="/profil"
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
        >
            <span className="relative flex-shrink-0">
                <Avatar className="h-11 w-11">
                    <AvatarImage src={profile.avatar_path ? `/storage/${profile.avatar_path}` : undefined} alt="" />
                    <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                </Avatar>
                {profile.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />}
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{profile.name}</p>
                <p className="truncate text-xs text-slate-400">
                    {profile.role_label}
                    {profile.filiere ? ` · ${profile.filiere}` : ''}
                </p>
            </div>
        </Link>
    );
}
