import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    UserPlus,
    GraduationCap,
    ClipboardList,
    School,
    Newspaper,
    Images,
    BookOpen,
    Presentation,
    Quote,
    HeartHandshake,
    CalendarDays,
    Building2,
    FileEdit,
    FileText,
    Archive,
    ShieldCheck,
    History,
    Palette,
    BarChart3,
    Network,
    GalleryHorizontal,
    ChevronDown,
    Menu,
} from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

function buildNavGroups(t) {
    return [
        {
            label: null,
            items: [
                { href: '/console/dashboard', label: t('admin.nav.dashboard', 'Tableau de bord'), icon: LayoutDashboard, permission: 'dashboard.view' },
            ],
        },
        {
            label: t('admin.nav.group_admissions', 'Admissions'),
            items: [{ href: '/console/preinscriptions', label: t('admin.nav.preinscriptions', 'Préinscriptions'), icon: UserPlus, permission: 'preinscriptions.manage' }],
        },
        {
            label: t('admin.nav.group_scolarite', 'Scolarité'),
            items: [
                { href: '/console/scolarite/etudiants', label: t('admin.nav.etudiants', 'Étudiants'), icon: GraduationCap, permission: 'etudiants.view' },
                { href: '/console/scolarite/inscriptions', label: t('admin.nav.inscriptions', 'Inscriptions'), icon: ClipboardList, permission: 'inscriptions.view' },
                { href: '/console/scolarite/classes', label: t('admin.nav.niveaux', 'Niveaux'), icon: School, permission: 'classes.view' },
            ],
        },
        {
            label: t('admin.nav.group_contenu', 'Contenu'),
            items: [
                { href: '/console/contenu', label: t('admin.nav.contenu_site', 'Contenu du site'), icon: FileEdit, permission: 'quick-edit.access' },
                { href: '/console/accueil', label: t('admin.nav.hero_images', "Images de l'accueil"), icon: GalleryHorizontal, permission: 'hero.view' },
                { href: '/console/actualites', label: t('admin.nav.actualites', 'Actualités'), icon: Newspaper, permission: 'news.view' },
                { href: '/console/galerie', label: t('admin.nav.galerie', 'Galerie'), icon: Images, permission: 'gallery.view' },
                { href: '/console/filieres', label: t('admin.nav.filieres', 'Filières'), icon: BookOpen, permission: 'filieres.view' },
                { href: '/console/enseignants', label: t('admin.nav.enseignants', 'Enseignants'), icon: Presentation, permission: 'enseignants.view' },
                { href: '/console/temoignages', label: t('admin.nav.temoignages', 'Témoignages'), icon: Quote, permission: 'temoignages.view' },
                { href: '/console/partenaires', label: t('admin.nav.partenaires', 'Partenaires'), icon: HeartHandshake, permission: 'partenaires.view' },
                { href: '/console/organigramme', label: t('admin.nav.organigramme', 'Organigramme'), icon: Network, permission: 'organigramme.view' },
                { href: '/console/evenements', label: t('admin.nav.evenements', 'Événements'), icon: CalendarDays, permission: 'evenements.view' },
                { href: '/console/campus', label: t('admin.nav.campus', 'Campus'), icon: Building2, permission: 'campus.view' },
                { href: '/console/documents', label: t('admin.nav.documents', 'Documents'), icon: FileText, permission: 'documents.view' },
            ],
        },
        {
            label: t('admin.nav.group_systeme', 'Système'),
            items: [
                { href: '/console/archives', label: t('admin.nav.archives', 'Archives des actions'), icon: Archive, permission: 'activity-log.view' },
                { href: '/console/roles', label: t('admin.nav.roles', 'Rôles'), icon: ShieldCheck, permission: 'roles.view' },
                { href: '/console/activity-log', label: t('admin.nav.activity_log', "Journal d'activité"), icon: History, permission: 'activity-log.view' },
            ],
        },
        {
            label: t('admin.nav.group_configuration', 'Configuration'),
            items: [
                { href: '/console/settings/appearance', label: t('admin.nav.apparence', 'Apparence'), icon: Palette, permission: 'settings.manage' },
                { href: '/console/statistiques', label: t('admin.nav.statistics', 'Statistiques'), icon: BarChart3, permission: 'statistics.view' },
            ],
        },
    ];
}

function isActive(url, href) {
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
}

function NavItem({ item, active, collapsed, onNavigate }) {
    const Icon = item.icon;
    const link = (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center px-0 py-2.5' : ''
            } ${
                active
                    ? 'bg-gradient-to-r from-admin-accent to-admin-accent/80 text-admin-accent-foreground shadow-md shadow-admin-accent/25'
                    : 'text-admin-chrome-text-secondary hover:bg-admin-chrome-hover hover:text-admin-chrome-text'
            }`}
        >
            <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? '' : 'group-hover:text-admin-accent'}`} aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
    );

    if (!collapsed) return <li>{link}</li>;

    return (
        <li>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        </li>
    );
}

function NavGroup({ group, index, url, collapsed, onNavigate }) {
    const [open, setOpen] = useState(true);
    const hasLabel = Boolean(group.label);

    return (
        <div>
            {hasLabel && !collapsed && (
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="mb-1.5 flex w-full items-center justify-between gap-1.5 px-3 text-[0.68rem] font-semibold uppercase tracking-wider text-admin-chrome-muted transition-colors hover:text-admin-chrome-text-secondary"
                >
                    <span>{group.label}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
                </button>
            )}
            {hasLabel && collapsed && index > 0 && <div className="mx-3 mb-2 border-t border-admin-border/70" aria-hidden="true" />}
            <ul
                className={`space-y-0.5 overflow-hidden transition-all duration-200 ${
                    !collapsed && hasLabel && !open ? 'max-h-0' : 'max-h-[999px]'
                }`}
            >
                {group.items.map((item) => (
                    <NavItem key={item.href} item={item} active={isActive(url, item.href)} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
            </ul>
        </div>
    );
}

function SidebarUserCard({ user, collapsed }) {
    const { t } = useTranslations();
    if (!user) return null;

    return (
        <div className="admin-sidebar-glow border-t border-admin-border p-3">
            <div className={`flex items-center gap-3 rounded-xl border border-admin-border bg-admin-bg/60 p-2.5 ${collapsed ? 'justify-center p-1.5' : ''}`}>
                <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-admin-accent/30">
                    <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                    <AvatarFallback className="bg-admin-accent/15 text-admin-accent">{user.name?.[0]}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-tight text-admin-chrome-text">{user.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-admin-chrome-muted">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            {t('admin.sidebar.online', 'En ligne')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminSidebar({ className = '', onNavigate, onToggle }) {
    const collapsed = false;
    const { url, props } = usePage();
    const { t } = useTranslations();
    const permissions = props.auth?.permissions ?? [];
    const hasPermission = (permission) => !permission || permissions.includes(permission);
    const navGroups = buildNavGroups(t);
    const visibleGroups = navGroups
        .map((group) => ({ ...group, items: group.items.filter((item) => hasPermission(item.permission)) }))
        .filter((group) => group.items.length > 0);

    return (
        <nav
            className={`flex h-full flex-shrink-0 flex-col bg-admin-chrome text-admin-chrome-text transition-[width] duration-300 ease-in-out ${
                collapsed ? 'w-[76px]' : 'w-64'
            } ${className}`}
        >
            <div className="flex items-center gap-3 px-4 py-5">
                <Link href="/console/dashboard" className="flex min-w-0 flex-1 items-center gap-3" onClick={onNavigate}>
                    <img src="/images/logo-isstm.svg" alt="" className="h-10 w-10 flex-shrink-0 rounded-lg bg-white object-contain p-1" />
                    {!collapsed && (
                        <div className="min-w-0">
                            <span className="block truncate text-lg font-bold leading-tight tracking-wide text-admin-chrome-text">ISSTM</span>
                            <span className="block truncate text-xs font-medium leading-tight text-admin-chrome-muted">
                                {t('admin.header.brand_subtitle', 'Administration')}
                            </span>
                        </div>
                    )}
                </Link>
                {onToggle && (
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={t('admin.sidebar.collapse', 'Masquer le menu')}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-admin-chrome-text-secondary transition-colors duration-200 hover:bg-admin-chrome-hover hover:text-admin-chrome-text"
                    >
                        <Menu className="h-5 w-5" aria-hidden="true" />
                    </button>
                )}
            </div>

            <div className={`flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 pb-4 ${collapsed ? 'space-y-4 px-2.5' : ''}`}>
                {visibleGroups.map((group, index) => (
                    <NavGroup key={group.label ?? `group-${index}`} group={group} index={index} url={url} collapsed={collapsed} onNavigate={onNavigate} />
                ))}
            </div>

            <SidebarUserCard user={props.auth?.user} collapsed={collapsed} />
        </nav>
    );
}
