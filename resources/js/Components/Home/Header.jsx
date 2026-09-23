import { Link, usePage } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import HeaderSearchButton from '../Layout/HeaderSearchButton';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import MobileTabBar from '../Layout/MobileTabBar';
import MobileMenuButton from '../Layout/MobileMenuButton';
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

function NavDropdown({ label, items }) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <div className="grid w-[420px] grid-cols-2 gap-1 rounded-xl bg-popover p-2 text-popover-foreground shadow-xl ring-1 ring-border">
                    {items.map((item) => (
                        <NavigationMenuLink asChild key={item.href}>
                            <Link
                                href={item.href}
                                className="flex items-start gap-3 rounded-lg p-3 text-sm transition hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-isstm-navy/10 text-isstm-navy dark:bg-isstm-gold/15 dark:text-isstm-gold">
                                    {item.icon && <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />}
                                </span>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                            </Link>
                        </NavigationMenuLink>
                    ))}
                </div>
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

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,transform,opacity] duration-500 ${
                    scrolled ? 'bg-isstm-menu text-isstm-menu-text shadow-md' : 'bg-transparent text-white'
                } ${hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
            >
            <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6">
                <a href="#accueil" className="flex min-w-0 items-center gap-3.5">
                    <img src="/images/logo-isstm.svg" alt="ISSTM" className="h-12 w-auto flex-shrink-0" />
                    <BrandTitle />
                </a>

                <NavigationMenu className="hidden min-w-0 justify-self-center md:flex">
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
                                <Link href="/preinscription" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
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

                <div className="flex items-center gap-2 justify-self-end sm:gap-3">
                    <div className="hidden items-center gap-3 md:flex">
                        <DarkModeToggle />
                        <LanguageSwitcher />
                        {user && (user.is_messagerie || isCommunityMember) && (
                            <div className="flex items-center gap-3 text-sm">
                                {user.is_messagerie && (
                                    <Link href="/messagerie" className="hover:text-isstm-gold" title={t('messagerie.titre', 'Messagerie interne')}>
                                        <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
                                    </Link>
                                )}
                                {isCommunityMember && <NotificationBell />}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <HeaderSearchButton />
                        <MobileMenuButton />
                    </div>
                </div>
            </div>
            </header>

            <MobileTabBar />
        </>
    );
}
