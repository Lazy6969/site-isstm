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
    Network,
    GalleryHorizontal,
} from 'lucide-react';

const navGroups = [
    {
        label: null,
        items: [{ href: '/console/dashboard', label: 'Tableau de bord', icon: LayoutDashboard }],
    },
    {
        label: 'Admissions',
        items: [{ href: '/console/preinscriptions', label: 'Préinscriptions', icon: UserPlus }],
    },
    {
        label: 'Scolarité',
        items: [
            { href: '/console/scolarite/etudiants', label: 'Étudiants', icon: GraduationCap },
            { href: '/console/scolarite/inscriptions', label: 'Inscriptions', icon: ClipboardList },
            { href: '/console/scolarite/classes', label: 'Classes', icon: School },
        ],
    },
    {
        label: 'Contenu',
        items: [
            { href: '/console/contenu', label: 'Contenu du site', icon: FileEdit },
            { href: '/console/accueil', label: "Images de l'accueil", icon: GalleryHorizontal },
            { href: '/console/actualites', label: 'Actualités', icon: Newspaper },
            { href: '/console/galerie', label: 'Galerie', icon: Images },
            { href: '/console/filieres', label: 'Filières', icon: BookOpen },
            { href: '/console/enseignants', label: 'Enseignants', icon: Presentation },
            { href: '/console/temoignages', label: 'Témoignages', icon: Quote },
            { href: '/console/partenaires', label: 'Partenaires', icon: HeartHandshake },
            { href: '/console/organigramme', label: 'Organigramme', icon: Network },
            { href: '/console/evenements', label: 'Événements', icon: CalendarDays },
            { href: '/console/campus', label: 'Campus', icon: Building2 },
            { href: '/console/documents', label: 'Documents', icon: FileText },
        ],
    },
];

function isActive(url, href) {
    return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
}

export default function AdminSidebar({ className = '', onNavigate }) {
    const { url } = usePage();

    return (
        <nav className={`flex h-full w-64 flex-shrink-0 flex-col bg-admin-surface ${className}`}>
            <Link href="/console/dashboard" className="flex items-center gap-3 border-b border-admin-border px-5 py-5" onClick={onNavigate}>
                <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/70 shadow-lg shadow-admin-accent/30">
                    <img src="/images/logo-isstm.png" alt="" className="h-5 w-auto brightness-0 invert" />
                </div>
                <div>
                    <span className="block text-sm font-semibold leading-tight text-admin-text">ISSTM</span>
                    <span className="block text-xs font-medium leading-tight text-admin-accent">Administration</span>
                </div>
            </Link>

            <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {navGroups.map((group, index) => (
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
                                            className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                                                active
                                                    ? 'bg-admin-accent text-admin-accent-foreground shadow-md shadow-admin-accent/25'
                                                    : 'text-admin-text-secondary hover:translate-x-0.5 hover:bg-admin-hover hover:text-admin-text'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                    active
                                                        ? 'bg-white/20 text-admin-accent-foreground'
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
