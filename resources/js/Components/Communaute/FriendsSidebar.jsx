import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Left sidebar's "Amis" preview — the viewer's own accepted friends, distinct
 * from the right sidebar's "Vous connaissez peut-être…" (SuggestionsSidebar,
 * people NOT yet friended) and from MessagesSidebar/GroupsSidebar (chat
 * threads, not the friend list itself).
 */
export default function FriendsSidebar({ friends }) {
    const { t } = useTranslations();

    if (friends.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-isstm-navy dark:text-white">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {t('communaute.amis_court', 'Amis')}
                </h2>
                <Link href="/amis" className="text-xs font-medium text-slate-400 hover:text-isstm-navy dark:hover:text-white">
                    {t('communaute.voir_tout', 'Tout voir')}
                </Link>
            </div>

            <div className="space-y-0.5">
                {friends.slice(0, 5).map((friend) => (
                    <Link
                        key={friend.id}
                        href={`/profil/${friend.id}`}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={friend.avatar_path ? `/storage/${friend.avatar_path}` : undefined} alt="" />
                            <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{friend.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
