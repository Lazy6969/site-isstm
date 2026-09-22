import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, UserPlus, GraduationCap, ClipboardList, School, Newspaper, Images, BookOpen, Presentation, Quote, HeartHandshake } from 'lucide-react';

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
            { href: '/console/actualites', label: 'Actualités', icon: Newspaper },
            { href: '/console/galerie', label: 'Galerie', icon: Images },
            { href: '/console/filieres', label: 'Filières', icon: BookOpen },
            { href: '/console/enseignants', label: 'Enseignants', icon: Presentation },
            { href: '/console/temoignages', label: 'Témoignages', icon: Quote },
            { href: '/console/partenaires', label: 'Partenaires', icon: HeartHandshake },
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
            <Link href="/console/dashboard" className="flex items-center gap-3 px-5 py-5" onClick={onNavigate}>
                <img src="/images/logo-isstm.png" alt="" className="h-8 w-auto" />
                <span className="text-sm font-semibold text-admin-text">ISSTM Admin</span>
            </Link>

            <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
                {navGroups.map((group, index) => (
                    <div key={group.label ?? `group-${index}`}>
                        {group.label && (
                            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-admin-muted">{group.label}</p>
                        )}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(url, item.href);
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                active
                                                    ? 'bg-admin-hover text-admin-text'
                                                    : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                            }`}
                                        >
                                            <Icon className="h-[18px] w-[18px] flex-shrink-0" aria-hidden="true" />
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
