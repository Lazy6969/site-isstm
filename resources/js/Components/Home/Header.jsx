import { Link, router, usePage } from '@inertiajs/react';
import HeaderSearchButton from '../Layout/HeaderSearchButton';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import MobileTabBar from '../Layout/MobileTabBar';
import { etablissementLinks, vieEtudianteLinks } from '../Layout/headerNavLinks';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '../ui/navigation-menu';

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

export default function Header() {
    const { auth } = usePage().props;
    const user = auth?.user;

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <header className="absolute inset-x-0 top-0 z-30 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <a href="#accueil" className="flex items-center gap-3">
                    <img src="/images/logo-isstm.png" alt="ISSTM" className="h-11 w-11 rounded-full object-cover" />
                    <span className="text-lg font-semibold tracking-wide">ISSTM</span>
                </a>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="gap-2">
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
                        <NavigationMenuItem>
                            <HeaderSearchButton variant="labelled" />
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="hidden items-center gap-3 sm:flex">
                    <LanguageSwitcher />
                    {user ? (
                        <>
                            <Link href="/profil" className="text-sm font-medium transition hover:text-isstm-gold">
                                {user.name}
                            </Link>
                            <button
                                onClick={logout}
                                className="rounded-full border border-white/60 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-isstm-navy"
                            >
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/inscription"
                            className="rounded-full bg-isstm-gold px-4 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                        >
                            Inscrivez-vous
                        </Link>
                    )}
                </div>
            </div>

            <MobileTabBar showLogin={false} />
        </header>
    );
}
