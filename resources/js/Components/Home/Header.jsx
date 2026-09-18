import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import HeaderSearchButton from '../Layout/HeaderSearchButton';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import MobileTabBar from '../Layout/MobileTabBar';
import NotificationBell from '../Layout/NotificationBell';
import BrandTitle from '../Layout/BrandTitle';
import DarkModeToggle from '../Layout/DarkModeToggle';
import { getEtablissementLinks, getVieEtudianteLinks, getCommunauteLinks } from '../Layout/headerNavLinks';
import { useHideOnScroll } from '../../lib/useHideOnScroll';
import { useTranslations } from '../../lib/useTranslations';
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
                                <Link href={item.href} className="block px-4 py-2 text-sm text-slate-700 hover:bg-accent hover:text-accent-foreground dark:text-slate-200">
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
    const { t } = useTranslations();
    const user = auth?.user;
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);
    const [scrolled, setScrolled] = useState(false);
    const hidden = useHideOnScroll();

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 40);
        }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <header
            className={`fixed inset-x-0 top-0 z-40 text-white transition-[background-color,box-shadow,transform] duration-300 ${
                scrolled ? 'bg-isstm-navy shadow-md' : 'bg-transparent'
            } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="relative flex items-center justify-between px-4 py-3 sm:px-6">
                <a href="#accueil" className="flex flex-shrink-0 items-center gap-3.5">
                    <img src="/images/logo-isstm.png" alt="ISSTM" className="h-12 w-auto" />
                    <BrandTitle />
                </a>

                <NavigationMenu className="hidden md:absolute md:top-1/2 md:left-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
                    <NavigationMenuList className="gap-2">
                        <NavDropdown label={t('nav.etablissement', 'Établissement')} items={getEtablissementLinks(t)} />
                        <NavDropdown label={t('nav.vie_etudiante', 'Vie étudiante')} items={getVieEtudianteLinks(t)} />
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/actualites" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                    {t('nav.actualites', 'Actualités')}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/galerie" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                    {t('nav.galerie', 'Galerie')}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/inscription" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                    {t('nav.inscription', 'Inscription')}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/contact" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                    {t('nav.contact', 'Contact')}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        {isCommunityMember && <NavDropdown label={t('communaute.titre', 'Communauté')} items={getCommunauteLinks(t)} />}
                        <NavigationMenuItem>
                            <HeaderSearchButton variant="labelled" />
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="hidden items-center gap-3 md:flex">
                    <DarkModeToggle />
                    <LanguageSwitcher />
                    {user ? (
                        <div className="flex items-center gap-3 text-sm">
                            {user.is_messagerie && (
                                <Link href="/messagerie" className="hover:text-isstm-gold" title={t('messagerie.titre', 'Messagerie interne')}>
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
                                        <Link href={`/profil/${user.id}`}>{t('profil.voir_profil_public', 'Voir mon profil public')}</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profil">{t('profil.modifier_profil', 'Modifier mon profil')}</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/bibliotheque">{t('bibliotheque.titre', 'Bibliothèque numérique')}</Link>
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/preinscriptions">{t('preinscriptions_admin.titre_menu', 'Préinscriptions')}</Link>
                                        </DropdownMenuItem>
                                    )}
                                    {['admin', 'bibliotheque'].includes(user.role) && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/bibliotheque/admin">{t('bibliotheque_admin.gerer_bibliotheque', 'Gérer la bibliothèque')}</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={logout}>
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        {t('nav.deconnexion', 'Déconnexion')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full border border-white/60 px-4 py-1.5 text-sm font-medium transition hover:bg-white hover:text-isstm-navy"
                        >
                            {t('nav.se_connecter', 'Se connecter')}
                        </Link>
                    )}
                </div>
            </div>

            <MobileTabBar showLogin={false} />
        </header>
    );
}
