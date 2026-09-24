import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';
import { useLogoutConfirm } from '../../lib/useLogoutConfirm';

/**
 * Account avatar + dropdown menu. Rendered two ways: floating at the
 * middle-left of the viewport alongside the quick-edit pencil on public
 * pages (see app.jsx, default `side`/`align`), and inline at the end of
 * CommunityHeader for the espace étudiant (`side="bottom" align="end"`) —
 * app.jsx hides its own floating copy on community pages so the two never
 * show up at once. Hidden inside /console, where AdminHeader already has
 * its own profile menu.
 */
export default function FloatingAccountButton({ size = 'h-12 w-12', side = 'right', align = 'center' }) {
    const { props, url } = usePage();
    const { t } = useTranslations();
    const { requestLogout } = useLogoutConfirm();
    const user = props.auth?.user;
    // Permission-based, not the legacy `role` column — covers every role with
    // console access (super-admin, scolarite, ...), not just literal "admin".
    const hasConsoleAccess = (props.auth?.permissions ?? []).includes('dashboard.view');
    const hasPendingPreinscription = props.hasPendingPreinscription;

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
                className={`flex ${size} items-center justify-center overflow-hidden rounded-full transition hover:scale-105 focus:outline-none`}
                aria-label={t('profil.mon_compte', 'Mon compte')}
            >
                <img
                    src={user.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent side={side} align={align}>
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
                {hasPendingPreinscription && (
                    <DropdownMenuItem asChild>
                        <Link href="/mon-dossier">{t('profil.mon_dossier', 'Mon dossier de préinscription')}</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t('nav.deconnexion', 'Déconnexion')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
