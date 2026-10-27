import { router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';

/**
 * The viewer's own avatar at the far right of the feed's greeting banner —
 * square (unlike the round avatars used everywhere else) with a green dot
 * when `show_online_status` is on, since the dot here is a preview of what
 * other people see, not just a decoration. Clicking it opens the toggle for
 * that same preference (PATCH /profil/statut-en-ligne).
 */
export default function OnlineStatusBadge({ user }) {
    const { t } = useTranslations();

    if (!user) {
        return null;
    }

    function toggle() {
        router.patch('/profil/statut-en-ligne', {}, { preserveScroll: true });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative flex-shrink-0" aria-label={t('communaute.statut_en_ligne', 'Statut en ligne')}>
                    <span className="block h-12 w-12 overflow-hidden rounded-lg border-2 border-white shadow dark:border-slate-700">
                        {user.avatar_path ? (
                            <img src={`/storage/${user.avatar_path}`} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center bg-isstm-navy/10 text-sm font-semibold text-isstm-navy dark:bg-isstm-gold/15 dark:text-isstm-gold">
                                {user.name?.[0]}
                            </span>
                        )}
                    </span>
                    {user.show_online_status && (
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-800" aria-hidden="true" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={toggle}>
                    {user.show_online_status ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    {user.show_online_status
                        ? t('communaute.desactiver_statut_en_ligne', 'Désactiver le statut en ligne')
                        : t('communaute.activer_statut_en_ligne', 'Activer le statut en ligne')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
