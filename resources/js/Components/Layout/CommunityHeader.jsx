import { Link, usePage } from '@inertiajs/react';
import { Globe, Menu, MessageCircle, Newspaper, Settings, Users, UsersRound, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import NotificationBell from './NotificationBell';
import HeaderSearchButton from './HeaderSearchButton';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';
import FloatingAccountButton from './FloatingAccountButton';
import { useTranslations } from '../../lib/useTranslations';
import { useCloseOnDesktop } from '../../lib/useCloseOnDesktop';

const LOGO_TEXT = 'ISSTMeet';
const TYPE_MS = 130;
const ERASE_MS = 70;
const PAUSE_FULL_MS = 1500;
const PAUSE_EMPTY_MS = 500;

/**
 * Types LOGO_TEXT out one letter at a time, pauses, erases it, pauses, and
 * repeats — a chat-style "typing…" loop for the wordmark next to the logo.
 * Skipped for prefers-reduced-motion: the full word is shown immediately,
 * static, no interval running at all.
 */
function useTypewriterLoop(text) {
    const [reduceMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    const [count, setCount] = useState(reduceMotion ? text.length : 0);
    const [erasing, setErasing] = useState(false);

    useEffect(() => {
        if (reduceMotion) {
            return undefined;
        }

        let timer;
        if (!erasing) {
            if (count < text.length) {
                timer = setTimeout(() => setCount((c) => c + 1), TYPE_MS);
            } else {
                timer = setTimeout(() => setErasing(true), PAUSE_FULL_MS);
            }
        } else if (count > 0) {
            timer = setTimeout(() => setCount((c) => c - 1), ERASE_MS);
        } else {
            timer = setTimeout(() => setErasing(false), PAUSE_EMPTY_MS);
        }

        return () => clearTimeout(timer);
    }, [count, erasing, reduceMotion, text]);

    return { typed: text.slice(0, count), reduceMotion };
}

const navItems = [
    { href: '/communaute', labelKey: 'communaute.titre', label: 'Fil communautaire', icon: Newspaper },
    { href: '/amis', labelKey: 'nav.amis', label: 'Amis', icon: Users },
    { href: '/messages', labelKey: 'nav.messages', label: 'Messages', icon: MessageCircle },
    { href: '/groupes', labelKey: 'nav.groupes', label: 'Groupes', icon: UsersRound },
    { href: '/ecolage', labelKey: 'nav.ecolage', label: 'Écolage', icon: Wallet, permission: 'ecolage.view' },
];

/**
 * Dedicated header for the espace étudiant (AppLayout: fil communautaire,
 * amis, messages, groupes, notifications) — no site logo/title, no footer
 * around it (see AppLayout), a single "Voir le site" link back to the
 * public site instead of the full Établissement/Vie étudiante navigation.
 */
export default function CommunityHeader() {
    const { url, props } = usePage();
    const permissions = props.auth?.permissions ?? [];
    const items = navItems.filter((item) => !item.permission || permissions.includes(item.permission));
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    useCloseOnDesktop(setOpen);
    const { typed, reduceMotion } = useTypewriterLoop(LOGO_TEXT);
    const typedIstt = typed.slice(0, 4);
    const typedMeet = typed.slice(4);

    function isActive(href) {
        return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
    }

    return (
        <header
            className="sticky top-0 z-40 bg-[image:var(--gradient-community)] text-isstm-menu-text shadow-lg"
            style={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
                <div className="flex flex-shrink-0 items-center gap-2">
                    <Link href="/communaute" aria-label="ISSTMeet" className="flex items-center gap-2.5">
                        <span className="community-logo-mark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-sm transition-transform duration-300 hover:scale-110">
                            <img src="/images/isstmeet-logo.png" alt="" className="h-full w-full object-contain" />
                        </span>
                        <span className="h-6 w-px flex-shrink-0 bg-white/25" aria-hidden="true" />
                        <span className="relative inline-flex items-center text-sm font-extrabold tracking-tight sm:text-lg" aria-hidden="true">
                            <span className="invisible whitespace-nowrap">{LOGO_TEXT}</span>
                            <span className="absolute inset-0 flex items-center whitespace-nowrap">
                                <span className="text-white">{typedIstt}</span>
                                <span className="text-isstm-gold">{typedMeet}</span>
                                {!reduceMotion && <span className="community-caret ml-0.5 inline-block h-[1.1em] w-[2px] bg-isstm-gold" />}
                            </span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-label={t('nav.menu', 'Menu')}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-isstm-gold hover:bg-white/10 hover:text-isstm-gold active:scale-95 md:hidden"
                    >
                        <Menu className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <nav className="hidden min-w-0 items-center gap-1 md:flex">
                    {items.map((item) => (
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

                    <HeaderSearchButton href="/communaute/recherche" />
                    <NotificationBell />
                    <FloatingAccountButton size="h-9 w-9" side="bottom" align="end" />
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                {/* Portaled to document.body (outside .community-shell), so isstm-navy/
                    isstm-gold here already resolve to :root's admin-chosen colors — no
                    override needed, and none is wanted now that .community-shell itself
                    follows those same colors instead of a hardcoded purple/pink. */}
                <SheetContent side="bottom" className="max-h-[85vh]">
                    <SheetTitle className="sr-only">{t('nav.menu', 'Menu')}</SheetTitle>
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-isstm-navy/5 p-1.5 dark:bg-white/10">
                            <img src="/images/isstmeet-logo.png" alt="" className="h-full w-full object-contain" />
                        </span>
                        <span className="h-5 w-px flex-shrink-0 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                        <span className="relative inline-flex items-center text-base font-extrabold tracking-tight" aria-hidden="true">
                            <span className="invisible whitespace-nowrap">{LOGO_TEXT}</span>
                            <span className="absolute inset-0 flex items-center whitespace-nowrap">
                                <span className="text-isstm-navy dark:text-white">{typedIstt}</span>
                                <span className="text-isstm-gold">{typedMeet}</span>
                                {!reduceMotion && <span className="community-caret ml-0.5 inline-block h-[1.1em] w-[2px] bg-isstm-gold" />}
                            </span>
                        </span>
                    </div>
                    <nav className="mt-4 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
                        {items.map((item) => (
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
