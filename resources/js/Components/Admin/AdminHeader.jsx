import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Search, ChevronDown, LogOut, User, Pencil, Globe } from 'lucide-react';
import AdminProfilePanel from './AdminProfilePanel';
import DarkModeToggle from '../Layout/DarkModeToggle';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import AdminNotificationBell from './AdminNotificationBell';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { useLogoutConfirm } from '../../lib/useLogoutConfirm';
import { useTranslations } from '../../lib/useTranslations';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

function buildQuickLinks(t) {
    return [
        { href: '/console/dashboard', permission: 'dashboard.view', label: t('admin.nav.dashboard', 'Tableau de bord') },
        { href: '/console/preinscriptions', permission: 'preinscriptions.manage', label: t('admin.nav.preinscriptions', 'Préinscriptions') },
        { href: '/console/scolarite/etudiants', permission: 'etudiants.view', label: t('admin.nav.etudiants', 'Étudiants') },
        { href: '/console/scolarite/inscriptions', permission: 'inscriptions.view', label: t('admin.nav.inscriptions', 'Inscriptions') },
        { href: '/console/scolarite/classes', permission: 'classes.view', label: t('admin.nav.niveaux', 'Niveaux') },
        { href: '/console/filieres', permission: 'filieres.view', label: t('admin.nav.filieres', 'Filières') },
        { href: '/console/contenu', permission: 'quick-edit.access', label: t('admin.nav.contenu_site', 'Contenu du site') },
        { href: '/console/actualites', permission: 'news.view', label: t('admin.nav.actualites', 'Actualités') },
        { href: '/console/galerie', permission: 'gallery.view', label: t('admin.nav.galerie', 'Galerie') },
        { href: '/console/enseignants', permission: 'enseignants.view', label: t('admin.nav.enseignants', 'Enseignants') },
        { href: '/console/evenements', permission: 'evenements.view', label: t('admin.nav.evenements', 'Événements') },
        { href: '/console/campus', permission: 'campus.view', label: t('admin.nav.campus', 'Campus') },
        { href: '/console/documents', permission: 'documents.view', label: t('admin.nav.documents', 'Documents') },
        { href: '/console/archives', permission: 'activity-log.view', label: t('admin.nav.archives', 'Archives des actions') },
        { href: '/console/users', permission: 'users.view', label: t('admin.nav.utilisateurs', 'Utilisateurs') },
    ];
}

export default function AdminHeader({ onOpenSidebar, sidebarHidden = false, onShowSidebar }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const unreadCount = auth?.unreadNotificationsCount ?? 0;
    const { canEdit, enabled, toggle } = useQuickEdit();
    const { requestLogout } = useLogoutConfirm();
    const { t } = useTranslations();
    const roleValue = typeof user?.role === 'string' ? user.role : user?.role?.value;
    const roleLabel = roleValue ? t(`admin.role.${roleValue}`, roleValue.replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase())) : null;
    const [profileOpen, setProfileOpen] = useState(false);
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);

    const permissions = auth?.permissions ?? [];
    const quickLinks = buildQuickLinks(t).filter((link) => permissions.includes(link.permission));
    const results = query.trim() ? quickLinks.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())) : [];

    useEffect(() => {
        function onKeyDown(e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === 'Escape' && document.activeElement === searchRef.current) {
                searchRef.current.blur();
                setQuery('');
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    function logout(e) {
        e.preventDefault();
        requestLogout();
    }

    return (
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-admin-border bg-admin-chrome/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            <button
                type="button"
                onClick={onOpenSidebar}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-admin-chrome-text-secondary transition-colors duration-200 hover:bg-admin-chrome-hover hover:text-admin-chrome-text lg:hidden"
                aria-label={t('admin.header.open_menu', 'Ouvrir le menu')}
            >
                <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {sidebarHidden && (
                <button
                    type="button"
                    onClick={onShowSidebar}
                    className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-admin-chrome-text-secondary transition-colors duration-200 hover:bg-admin-chrome-hover hover:text-admin-chrome-text lg:flex"
                    aria-label={t('admin.header.open_menu', 'Ouvrir le menu')}
                >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
            )}

            <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('admin.header.search_placeholder', 'Rechercher une page, un étudiant, un document...')}
                    className="h-10 w-full rounded-xl border border-admin-border bg-admin-card/70 pl-10 pr-16 text-sm text-admin-text placeholder:text-admin-muted outline-none transition-all duration-200 focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/10"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-admin-border bg-admin-surface px-1.5 py-0.5 text-[0.7rem] font-medium text-admin-muted sm:flex">
                    Ctrl K
                </kbd>
                {results.length > 0 && (
                    <ul className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border border-admin-border bg-admin-card shadow-xl duration-150">
                        {results.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setQuery('')}
                                    className="block px-3.5 py-2.5 text-sm text-admin-text transition-colors duration-150 hover:bg-admin-hover"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="ml-auto flex items-center gap-1.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <a
                            href="/"
                            target="isstm-site-preview"
                            rel="noopener noreferrer"
                            className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-admin-chrome-text-secondary transition-colors duration-200 hover:bg-admin-chrome-hover hover:text-admin-chrome-text"
                        >
                            <Globe className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
                            <span className="hidden sm:inline">{t('admin.header.view_site', 'Voir le site')}</span>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent>{t('admin.header.view_site_tooltip', 'Ouvrir le site public dans un nouvel onglet')}</TooltipContent>
                </Tooltip>

                <DarkModeToggle className="text-admin-chrome-text-secondary hover:bg-admin-chrome-hover hover:text-admin-chrome-text" />

                <LanguageSwitcher className="!border-admin-border !text-admin-chrome-text-secondary hover:!border-admin-accent hover:!text-admin-chrome-text" />

                {canEdit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={toggle}
                                aria-label={enabled ? t('admin.header.quick_edit_disable', 'Désactiver le mode édition rapide') : t('admin.header.quick_edit_enable', 'Activer le mode édition rapide')}
                                aria-pressed={enabled}
                                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                                    enabled
                                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30 hover:bg-amber-400/90'
                                        : 'text-admin-chrome-text-secondary hover:bg-admin-chrome-hover hover:text-admin-chrome-text'
                                }`}
                            >
                                <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{enabled ? t('admin.header.quick_edit_disable', 'Désactiver le mode édition rapide') : t('admin.header.quick_edit_enable', 'Activer le mode édition rapide')}</TooltipContent>
                    </Tooltip>
                )}

                <AdminNotificationBell />

                {user && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-admin-chrome-hover focus:outline-none">
                            <Avatar className="h-7 w-7 ring-2 ring-admin-accent/20">
                                <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback className="bg-admin-accent/10 text-admin-accent">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-left leading-tight sm:block">
                                <span className="block text-sm font-semibold text-admin-chrome-text">{user.name}</span>
                                {roleLabel && <span className="block text-xs text-admin-chrome-muted">{roleLabel}</span>}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-admin-chrome-muted" aria-hidden="true" />
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
