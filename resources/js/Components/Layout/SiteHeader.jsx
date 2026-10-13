import { Link, usePage } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import NotificationBell from './NotificationBell';
import AssistantIsstm from './AssistantIsstm';
import HeaderSearchButton from './HeaderSearchButton';
import LanguageSwitcher from './LanguageSwitcher';
import MobileTabBar from './MobileTabBar';
import MobileMenuButton from './MobileMenuButton';
import BrandTitle from './BrandTitle';
import DarkModeToggle from './DarkModeToggle';
import EditableImage from '../QuickEdit/EditableImage';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';
import { HEADER_DESIGN_OPTIONS } from './headerDesignOptions';
import { getEtablissementLinks, getVieEtudianteLinks } from './headerNavLinks';
import { useHideOnScroll } from '../../lib/useHideOnScroll';
import { useTranslations } from '../../lib/useTranslations';
import { headerBorderClass, headerBrandDividerClass, headerLogoSizeClass, headerPaddingClass, headerShowsTopAccent } from '../../lib/headerDesign';
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
    const { auth, content, contentStyles } = usePage().props;
    const { t } = useTranslations();
    const user = auth?.user;
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);
    const hidden = useHideOnScroll();
    const design = contentStyles?.header_design?.design ?? '1';
    const logo = content?.header_logo_image_path ?? 'images/logo-isstm.svg';

    return (
        <>
            <header
                className={`sticky top-0 z-40 bg-isstm-menu text-isstm-menu-text transition-[transform,opacity] duration-500 ${hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} ${headerBorderClass(design)}`}
            >
            {headerShowsTopAccent(design) && <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-isstm-gold" aria-hidden="true" />}
            <div className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:gap-4 sm:px-6 ${headerPaddingClass(design)}`}>
                <div className={`flex min-w-0 items-center gap-3.5 ${headerBrandDividerClass(design)}`}>
                    <div className="relative flex-shrink-0">
                        <Link href="/">
                            <img src={`/${logo}`} alt="ISSTM" className={`${headerLogoSizeClass(design)} w-auto`} />
                        </Link>
                        <EditableImage contentKey="header_logo_image_path" value={logo} className="absolute -top-1.5 -right-1.5 h-5 w-5" />
                    </div>
                    <BrandTitle />
                </div>

                <NavigationMenu className="hidden min-w-0 justify-self-center lg:flex">
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
                                <Link href="/rejoindre" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
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
                        {isCommunityMember && (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/communaute" className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:text-isstm-gold">
                                        {t('nav.fil_communautaire', 'Fil communautaire')}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                        <NavigationMenuItem>
                            <HeaderSearchButton variant="labelled" />
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center gap-2 justify-self-end sm:gap-3">
                    <div className="hidden items-center gap-3 lg:flex">
                        <AssistantIsstm />
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

                    <div className="flex items-center gap-2 lg:hidden">
                        <AssistantIsstm />
                        <HeaderSearchButton />
                        <MobileMenuButton />
                    </div>
                </div>
            </div>

            <EditableDesignPicker
                contentKey="header_design"
                title="Design du header"
                description="Choisissez l'apparence de la barre d'en-tête, sur tout le site."
                designs={HEADER_DESIGN_OPTIONS}
                className="absolute -bottom-9 right-4 z-30"
            />
            </header>

            <MobileTabBar />
        </>
    );
}
