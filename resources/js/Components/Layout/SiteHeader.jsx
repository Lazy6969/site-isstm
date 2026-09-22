import { Link, usePage } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import NotificationBell from './NotificationBell';
import HeaderSearchButton from './HeaderSearchButton';
import LanguageSwitcher from './LanguageSwitcher';
import MobileTabBar from './MobileTabBar';
import MobileMenuButton from './MobileMenuButton';
import BrandTitle from './BrandTitle';
import DarkModeToggle from './DarkModeToggle';
import { getEtablissementLinks, getVieEtudianteLinks, getCommunauteLinks } from './headerNavLinks';
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

export default function SiteHeader() {
    const { auth } = usePage().props;
    const { t } = useTranslations();
    const user = auth?.user;
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);
    const hidden = useHideOnScroll();

    return (
        <>
            <header
                className={`sticky top-0 z-40 bg-isstm-navy text-white transition-[transform,opacity] duration-500 ${hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
            >
            <div className="relative flex items-center justify-between px-4 py-3 sm:px-6">
                <Link href="/" className="flex min-w-0 items-center gap-3.5">
                    <img src="/images/logo-isstm.svg" alt="ISSTM" className="h-11 w-auto flex-shrink-0" />
                    <BrandTitle />
                </Link>

                <NavigationMenu className="hidden md:absolute md:top-1/2 md:left-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
                    <NavigationMenuList>
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
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="hidden items-center gap-3 md:flex">
                    <HeaderSearchButton />
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
            </header>

            <MobileTabBar />
        </>
    );
}
