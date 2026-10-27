import { Link, router } from '@inertiajs/react';
import { UserPlus, UsersRound } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Compact "Vous connaissez peut-être…" widget at the bottom of the right
 * sidebar, below MessagesSidebar/GroupsSidebar — a short preview of the same
 * suggestions the Amis hub shows in full (see FriendSuggestionService).
 */
export default function SuggestionsSidebar({ suggestions }) {
    const { t } = useTranslations();

    function addFriend(userId) {
        router.post(`/amis/${userId}`, {}, { preserveScroll: true });
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-isstm-navy dark:text-white">
                    <UsersRound className="h-4 w-4" aria-hidden="true" />
                    {t('communaute.suggestions_titre', 'Vous connaissez peut-être…')}
                </h2>
                <Link href="/amis" className="text-xs font-medium text-slate-400 hover:text-isstm-navy dark:hover:text-white">
                    {t('communaute.voir_tout', 'Tout voir')}
                </Link>
            </div>

            <div className="space-y-0.5">
                {suggestions.map((user) => (
                    <div key={user.id} className="flex items-center gap-2.5 rounded-xl px-2 py-2">
                        <Link href={`/profil/${user.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span className="relative flex-shrink-0">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                {user.online && <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</p>
                                <p className="truncate text-xs text-slate-400">{user.role_label}{user.filiere ? ` · ${user.filiere}` : ''}</p>
                            </div>
                        </Link>
                        {user.status === 'aucune' && (
                            <button
                                type="button"
                                onClick={() => addFriend(user.id)}
                                aria-label={`${t('amis.ajouter', 'Ajouter')} ${user.name}`}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-isstm-navy text-white transition hover:bg-isstm-navy-dark"
                            >
                                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
