import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, Search, Bell, ChevronDown, LogOut, User, Pencil } from 'lucide-react';
import DarkModeToggle from '../Layout/DarkModeToggle';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const quickLinks = [
    { href: '/console/dashboard', label: 'Tableau de bord' },
    { href: '/console/preinscriptions', label: 'Préinscriptions' },
    { href: '/console/scolarite/etudiants', label: 'Étudiants' },
    { href: '/console/scolarite/inscriptions', label: 'Inscriptions' },
    { href: '/console/scolarite/classes', label: 'Niveaux' },
    { href: '/console/filieres', label: 'Filières' },
    { href: '/console/contenu', label: 'Contenu du site' },
    { href: '/console/actualites', label: 'Actualités' },
    { href: '/console/galerie', label: 'Galerie' },
    { href: '/console/enseignants', label: 'Enseignants' },
    { href: '/console/evenements', label: 'Événements' },
    { href: '/console/campus', label: 'Campus' },
    { href: '/console/documents', label: 'Documents' },
];

export default function AdminHeader({ onOpenSidebar }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { canEdit, enabled, toggle } = useQuickEdit();
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);

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
        router.post('/logout');
    }

    return (
        <TooltipProvider delayDuration={300}>
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-admin-border bg-admin-chrome/90 px-4 py-3 backdrop-blur-md sm:px-6">
            <button
                type="button"
                onClick={onOpenSidebar}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-admin-text-secondary transition-colors duration-200 hover:bg-admin-hover hover:text-admin-text lg:hidden"
                aria-label="Ouvrir le menu"
            >
                <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une page..."
                    className="h-9 w-full rounded-lg border border-admin-border bg-admin-bg pl-9 pr-14 text-sm text-admin-text placeholder:text-admin-muted outline-none transition-all duration-200 focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/10"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-admin-border bg-admin-surface px-1.5 py-0.5 text-[0.7rem] font-medium text-admin-muted sm:flex">
                    ⌘K
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
                <DarkModeToggle className="text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text" />

                {canEdit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={toggle}
                                aria-label={enabled ? 'Désactiver le mode édition rapide' : 'Activer le mode édition rapide'}
                                aria-pressed={enabled}
                                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
                                    enabled
                                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30 hover:bg-amber-400/90'
                                        : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                }`}
                            >
                                <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{enabled ? 'Désactiver le mode édition rapide' : 'Activer le mode édition rapide'}</TooltipContent>
                    </Tooltip>
                )}

                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger
                                className="flex h-9 w-9 items-center justify-center rounded-full text-admin-text-secondary transition-colors duration-200 hover:bg-admin-hover hover:text-admin-text focus:outline-none"
                                aria-label="Notifications"
                            >
                                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Notifications</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="w-72 bg-admin-card text-admin-text">
                        <p className="px-3 py-2 text-sm font-semibold text-admin-text">Notifications</p>
                        <DropdownMenuSeparator className="bg-admin-border" />
                        <p className="px-3 py-6 text-center text-sm text-admin-muted">Aucune notification pour le moment.</p>
                    </DropdownMenuContent>
                </DropdownMenu>

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-admin-hover focus:outline-none">
                            <Avatar className="h-7 w-7 ring-2 ring-admin-accent/20">
                                <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback className="bg-admin-accent/10 text-admin-accent">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-sm font-medium text-admin-text sm:inline">{user.name}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-admin-card text-admin-text">
                            <div className="px-3 py-2">
                                <p className="text-sm font-medium text-admin-text">{user.name}</p>
                                <p className="text-xs text-admin-muted">{user.email}</p>
                            </div>
                            <DropdownMenuSeparator className="bg-admin-border" />
                            <DropdownMenuItem asChild className="text-admin-text hover:bg-admin-hover">
                                <Link href="/profil">
                                    <User className="h-4 w-4" aria-hidden="true" />
                                    Mon profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-admin-border" />
                            <DropdownMenuItem onSelect={logout} className="text-admin-text hover:bg-admin-hover">
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
        </TooltipProvider>
    );
}
