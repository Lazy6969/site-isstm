import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, ChevronDown, MessageSquare } from 'lucide-react';
import NotificationBell from './NotificationBell';
import HeaderSearchButton from './HeaderSearchButton';
import LanguageSwitcher from './LanguageSwitcher';
import MobileTabBar from './MobileTabBar';
import { etablissementLinks, vieEtudianteLinks, communauteLinks } from './headerNavLinks';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

function NavDropdown({ label, items }) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="w-56 rounded-xl bg-popover py-1.5 text-popover-foreground shadow-xl ring-1 ring-border">
                    {items.map((item) => (
                        <li key={item.href}>
                            <NavigationMenuLink asChild>
                                <Link href={item.href} className="block px-4 py-2 text-sm text-slate-700 hover:bg-accent hover:text-accent-foreground">
                                    {item.label}
                                </Link>
                            </NavigationMenuLink>
                        </li>
                    ))}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}

export default function SiteHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <header className="sticky top-0 z-40 bg-isstm-navy text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo-isstm.png" alt="ISSTM" className="h-11 w-auto" />
                    </Link>
                    <NavigationMenu className="hidden lg:flex">
                        <NavigationMenuList>
                            <NavDropdown label="Établissement" items={etablissementLinks} />
                            <NavDropdown label="Vie étudiante" items={vieEtudianteLinks} />
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/actualites" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                        Actualités
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/galerie" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                        Galerie
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/inscription" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                        Inscription
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/contact" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                        Contact
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            {isCommunityMember && <NavDropdown label="Communauté" items={communauteLinks} />}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                    <HeaderSearchButton />
                    <LanguageSwitcher />

                    {user ? (
                        <div className="flex items-center gap-3 text-sm">
                            {user.is_messagerie && (
                                <Link href="/messagerie" className="hover:text-isstm-gold" title="Messagerie interne">
                                    <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
                                </Link>
                            )}
                            {isCommunityMember && <NotificationBell />}
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-white/10 focus:outline-none">
                                    <img
                                        src={user.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                                        alt=""
                                        className="h-7 w-7 rounded-full object-cover"
                                    />
                                    {user.name}
                                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profil/${user.id}`}>Voir mon profil public</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profil">Modifier mon profil</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/bibliotheque">Bibliothèque numérique</Link>
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/preinscriptions">Préinscriptions</Link>
                                        </DropdownMenuItem>
                                    )}
                                    {['admin', 'bibliotheque'].includes(user.role) && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/bibliotheque/admin">Gérer la bibliothèque</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={logout}>
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full border border-white/60 px-4 py-1.5 text-sm font-medium transition hover:bg-white hover:text-isstm-navy"
                        >
                            Se connecter
                        </Link>
                    )}
                </div>
            </div>

            <MobileTabBar showLogin />
        </header>
    );
}
