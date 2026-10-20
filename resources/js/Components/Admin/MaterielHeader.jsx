import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Search, ChevronDown, LogOut, User, Globe } from 'lucide-react';
import AdminProfilePanel from './AdminProfilePanel';
import DarkModeToggle from '../Layout/DarkModeToggle';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import { useLogoutConfirm } from '../../lib/useLogoutConfirm';
import { useTranslations } from '../../lib/useTranslations';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

/**
 * Dedicated header for the standalone /materiel space (MaterielLayout) —
 * same chrome/colors and the same account menu (profil/déconnexion, dark
 * mode, langue) as AdminHeader, so a responsable-materiel account gets the
 * exact same account controls as every other staff role, but with no
 * sidebar toggle (this space has no sidebar) and a search that filters the
 * matériel list itself instead of jumping to other console pages.
 */
export default function MaterielHeader({ search, onSearchChange, searchPlaceholder }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { requestLogout } = useLogoutConfirm();
    const { t } = useTranslations();
    const [profileOpen, setProfileOpen] = useState(false);

    function logout(e) {
        e.preventDefault();
        requestLogout();
    }

    return (
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-admin-border bg-admin-chrome/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            {onSearchChange && (
                <div className="relative w-full max-w-xl">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder ?? t('materiel.recherche_placeholder', 'Rechercher un matériel, un lieu...')}
                        className="h-10 w-full rounded-xl border border-admin-border bg-admin-card/70 pl-10 pr-3 text-sm text-admin-text placeholder:text-admin-muted outline-none transition-all duration-200 focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/10"
                    />
                </div>
            )}

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                            href="/"
                            className="flex h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-admin-chrome-text-secondary transition-colors duration-200 hover:bg-admin-chrome-hover hover:text-admin-chrome-text sm:px-3"
                        >
                            <Globe className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                            <span className="hidden sm:inline">{t('admin.header.view_site', 'Voir le site')}</span>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent>{t('materiel.header.retour_site_tooltip', 'Retourner sur le site public')}</TooltipContent>
                </Tooltip>

                <DarkModeToggle className="text-admin-chrome-text-secondary hover:bg-admin-chrome-hover hover:text-admin-chrome-text" />

                <LanguageSwitcher
                    hideLabelOnMobile
                    className="!border-admin-border !text-admin-chrome-text-secondary hover:!border-admin-accent hover:!text-admin-chrome-text"
                />

                {user && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-admin-chrome-hover focus:outline-none">
                            <Avatar className="h-7 w-7 ring-2 ring-admin-accent/20">
                                <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback className="bg-admin-accent/10 text-admin-accent">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-left leading-tight sm:block">
                                <span className="block text-sm font-semibold text-admin-chrome-text">{user.name}</span>
                                <span className="block text-xs text-admin-chrome-muted">{t('admin.roles.materiel', 'Matériel')}</span>
                            </span>
                            <ChevronDown className="hidden h-3.5 w-3.5 text-admin-chrome-muted sm:block" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-admin-card text-admin-text">
                            <div className="px-3 py-2">
                                <p className="text-sm font-medium text-admin-text">{user.name}</p>
                                <p className="text-xs text-admin-muted">{user.email}</p>
                            </div>
                            <DropdownMenuSeparator className="bg-admin-border" />
                            <DropdownMenuItem onSelect={() => setProfileOpen(true)} className="text-admin-text hover:bg-admin-hover">
                                <User className="h-4 w-4" aria-hidden="true" />
                                {t('admin.header.my_profile', 'Mon profil')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-admin-border" />
                            <DropdownMenuItem onSelect={logout} className="text-admin-text hover:bg-admin-hover">
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                {t('admin.header.logout', 'Déconnexion')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {user && <AdminProfilePanel open={profileOpen} onOpenChange={setProfileOpen} />}
        </header>
    );
}
