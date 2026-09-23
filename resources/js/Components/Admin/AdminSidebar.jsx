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
    Users,
    ShieldCheck,
    History,
    Palette,
    BarChart3,
} from 'lucide-react';

const navGroups = [
    {
        label: null,
        items: [
            { href: '/console/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: 'dashboard.view' },
            { href: '/console/statistiques', label: 'Statistiques', icon: BarChart3, permission: 'statistics.view' },
        ],
    },
    {
        label: 'Admissions',
        items: [{ href: '/console/preinscriptions', label: 'Préinscriptions', icon: UserPlus, permission: 'preinscriptions.manage' }],
    },
    {
        label: 'Scolarité',
        items: [
            { href: '/console/scolarite/etudiants', label: 'Étudiants', icon: GraduationCap, permission: 'etudiants.view' },
            { href: '/console/scolarite/inscriptions', label: 'Inscriptions', icon: ClipboardList, permission: 'inscriptions.view' },
            { href: '/console/scolarite/classes', label: 'Niveaux', icon: School, permission: 'classes.view' },
        ],
    },
    {
        label: 'Contenu',
        items: [
            { href: '/console/contenu', label: 'Contenu du site', icon: FileEdit, permission: 'quick-edit.access' },
            { href: '/console/actualites', label: 'Actualités', icon: Newspaper, permission: 'news.view' },
            { href: '/console/galerie', label: 'Galerie', icon: Images, permission: 'gallery.view' },
            { href: '/console/filieres', label: 'Filières', icon: BookOpen, permission: 'filieres.view' },
            { href: '/console/enseignants', label: 'Enseignants', icon: Presentation, permission: 'enseignants.view' },
            { href: '/console/temoignages', label: 'Témoignages', icon: Quote, permission: 'temoignages.view' },
            { href: '/console/partenaires', label: 'Partenaires', icon: HeartHandshake, permission: 'partenaires.view' },
            { href: '/console/evenements', label: 'Événements', icon: CalendarDays, permission: 'evenements.view' },
            { href: '/console/campus', label: 'Campus', icon: Building2, permission: 'campus.view' },
            { href: '/console/documents', label: 'Documents', icon: FileText, permission: 'documents.view' },
        ],
    },
    {
        label: 'Système',
        items: [
            { href: '/console/users', label: 'Utilisateurs', icon: Users, permission: 'users.view' },
            { href: '/console/roles', label: 'Rôles', icon: ShieldCheck, permission: 'roles.view' },
            { href: '/console/activity-log', label: 'Journal d\'activité', icon: History, permission: 'activity-log.view' },
        ],
    },
    {
        label: 'Configuration',
        items: [{ href: '/console/settings/appearance', label: 'Apparence', icon: Palette, permission: 'settings.manage' }],
    },
];

function isActive(url, href) {
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
}

export default function AdminSidebar({ className = '', onNavigate }) {
    const { url, props } = usePage();
    const permissions = props.auth?.permissions ?? [];
    const hasPermission = (permission) => !permission || permissions.includes(permission);

    const visibleGroups = navGroups
        .map((group) => ({ ...group, items: group.items.filter((item) => hasPermission(item.permission)) }))
        .filter((group) => group.items.length > 0);

    return (
        <nav className={`flex h-full w-64 flex-shrink-0 flex-col bg-admin-chrome ${className}`}>
            <Link href="/console/dashboard" className="flex items-center gap-3 border-b border-admin-border px-5 py-5" onClick={onNavigate}>
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-lg shadow-admin-accent/20 ring-1 ring-admin-border">
                    <img src="/images/logo-isstm.svg" alt="" className="h-full w-full object-contain" />
                </div>
                <div>
                    <span className="block text-sm font-semibold leading-tight text-admin-text">ISSTM</span>
                    <span className="block text-xs font-medium leading-tight text-admin-accent">Administration</span>
                </div>
            </Link>

            <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {visibleGroups.map((group, index) => (
                    <div key={group.label ?? `group-${index}`}>
                        {group.label && (
                            <p className="mb-2 flex items-center gap-1.5 px-3 text-[0.7rem] font-bold uppercase tracking-wider text-admin-muted">
                                <span className="h-1 w-1 rounded-full bg-admin-accent" aria-hidden="true" />
                                {group.label}
                            </p>
                        )}
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const active = isActive(url, item.href);
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                                                active
                                                    ? 'bg-admin-accent/10 text-admin-accent'
                                                    : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                    active
                                                        ? 'bg-admin-accent text-admin-accent-foreground'
                                                        : 'bg-admin-hover text-admin-text-secondary group-hover:bg-admin-accent/15 group-hover:text-admin-accent'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
