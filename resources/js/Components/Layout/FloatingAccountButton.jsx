import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';
import { useLogoutConfirm } from '../../lib/useLogoutConfirm';

/**
 * Floating avatar/account menu, grouped at the middle-left of the viewport
 * with the quick-edit pencil (see app.jsx) instead of living in the header —
 * the header itself now only carries search/notifications/language/dark
 * mode. Hidden inside /console, where AdminHeader already has its own
 * profile menu.
 */
export default function FloatingAccountButton() {
    const { props, url } = usePage();
    const { t } = useTranslations();
    const { requestLogout } = useLogoutConfirm();
    const user = props.auth?.user;
    // Permission-based, not the legacy `role` column — covers every role with
    // console access (super-admin, scolarite, ...), not just literal "admin".
    const hasConsoleAccess = (props.auth?.permissions ?? []).includes('dashboard.view');

    if (!user || url.startsWith('/console')) {
        return null;
    }

    function logout(e) {
        e.preventDefault();
        requestLogout();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-lg ring-2 ring-white transition hover:scale-105 focus:outline-none"
                aria-label={t('profil.mon_compte', 'Mon compte')}
            >
                <img
                    src={user.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center">
                {hasConsoleAccess ? (
                    <DropdownMenuItem asChild>
                        <Link href="/console/dashboard">{t('nav.tableau_de_bord', 'Tableau de bord admin')}</Link>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link href={`/profil/${user.id}`}>{t('profil.voir_profil_public', 'Voir mon profil public')}</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/profil">{t('profil.modifier_profil', 'Modifier mon profil')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t('nav.deconnexion', 'Déconnexion')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
