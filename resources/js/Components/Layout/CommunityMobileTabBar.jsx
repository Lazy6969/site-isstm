import { Link, usePage } from '@inertiajs/react';
import { Home, MessageCircle, Users, UsersRound, Wallet } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const tabs = [
    { href: '/communaute', icon: Home, labelKey: 'nav.fil_court', label: 'Fil' },
    { href: '/amis', icon: Users, labelKey: 'nav.amis', label: 'Amis' },
    { href: '/messages', icon: MessageCircle, labelKey: 'nav.messages', label: 'Messages' },
    { href: '/groupes', icon: UsersRound, labelKey: 'nav.groupes', label: 'Groupes' },
    { href: '/ecolage', icon: Wallet, labelKey: 'nav.ecolage', label: 'Écolage', permission: 'ecolage.view' },
];

/**
 * Bottom tab bar for the espace étudiant (mobile only) — mirrors the public
 * site's MobileTabBar pattern. Notifications and Paramètres/profil are
 * deliberately not here: both stay reachable from CommunityHeader's own
 * notification bell and hamburger menu, freeing these 5 slots for the
 * sections visited most from a phone.
 */
export default function CommunityMobileTabBar() {
    const { url, props } = usePage();
    const { t } = useTranslations();
    const permissions = props.auth?.permissions ?? [];
    const visibleTabs = tabs.filter((tab) => !tab.permission || permissions.includes(tab.permission));

    function isActive(href) {
        return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
    }

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom,0px)] text-isstm-navy shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label={t('nav.menu', 'Menu')}
        >
            {visibleTabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                        isActive(tab.href) ? 'text-community-accent' : ''
                    }`}
                >
                    <tab.icon className="h-5 w-5" aria-hidden="true" />
                    {t(tab.labelKey, tab.label)}
                </Link>
            ))}
        </nav>
    );
}
