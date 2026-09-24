import { Link, usePage } from '@inertiajs/react';
import { Globe, Menu, MessageCircle, Newspaper, Settings, Users, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import NotificationBell from './NotificationBell';
import HeaderSearchButton from './HeaderSearchButton';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';
import FloatingAccountButton from './FloatingAccountButton';
import { useTranslations } from '../../lib/useTranslations';
import { useCloseOnDesktop } from '../../lib/useCloseOnDesktop';

const navItems = [
    { href: '/communaute', labelKey: 'communaute.titre', label: 'Fil communautaire', icon: Newspaper },
    { href: '/amis', labelKey: 'nav.amis', label: 'Amis', icon: Users },
    { href: '/messages', labelKey: 'nav.messages', label: 'Messages', icon: MessageCircle },
    { href: '/groupes', labelKey: 'nav.groupes', label: 'Groupes', icon: UsersRound },
];

/**
 * Dedicated header for the espace étudiant (AppLayout: fil communautaire,
 * amis, messages, groupes, notifications) — no site logo/title, no footer
 * around it (see AppLayout), a single "Voir le site" link back to the
 * public site instead of the full Établissement/Vie étudiante navigation.
 */
export default function CommunityHeader() {
    const { url } = usePage();
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    useCloseOnDesktop(setOpen);

    function isActive(href) {
        return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
    }

    return (
        <header
            className="sticky top-0 z-40 bg-[image:var(--gradient-community)] text-isstm-menu-text shadow-lg"
            style={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={t('nav.menu', 'Menu')}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-isstm-gold hover:bg-white/10 hover:text-isstm-gold active:scale-95 md:hidden"
                >
                    <Menu className="h-4 w-4" aria-hidden="true" />
                </button>

                <nav className="hidden min-w-0 items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                                isActive(item.href) ? 'bg-community-accent text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon className="h-4 w-4" aria-hidden="true" />
                            {t(item.labelKey, item.label)}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                    <div className="hidden items-center gap-1.5 sm:gap-2 md:flex">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:border-isstm-gold hover:text-isstm-gold"
                        >
                            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('nav.voir_le_site', 'Voir le site')}
                        </Link>
                        <DarkModeToggle />
                        <LanguageSwitcher />
                    </div>

                    <HeaderSearchButton />
                    <NotificationBell />
                    <FloatingAccountButton size="h-9 w-9" side="bottom" align="end" />
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[85vh]"
                    style={{ '--color-isstm-navy': '#667eea', '--color-isstm-gold': '#f093fb' }}
                >
                    <SheetTitle>{t('nav.menu', 'Menu')}</SheetTitle>
                    <nav className="mt-4 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 py-3 text-sm text-slate-700 dark:text-slate-200"
                            >
                                <item.icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                {t(item.labelKey, item.label)}
                            </Link>
                        ))}
                        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-3 text-sm text-slate-700 dark:text-slate-200">
                            <Globe className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            {t('nav.voir_le_site', 'Voir le site')}
                        </Link>
                        <Link href="/parametres" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-3 text-sm text-slate-700 dark:text-slate-200">
                            <Settings className="h-4 w-4 text-slate-400" aria-hidden="true" />
                            {t('nav.parametres', 'Paramètres')}
                        </Link>
                    </nav>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                        <span className="text-xs text-slate-400">{t('footer.langue', 'Langue')}</span>
                        <div className="flex items-center gap-2">
                            <DarkModeToggle className="!text-isstm-navy hover:!bg-isstm-navy/5 dark:!text-slate-100" />
                            <LanguageSwitcher className="!border-slate-200 !text-isstm-navy hover:!text-isstm-gold" />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}
