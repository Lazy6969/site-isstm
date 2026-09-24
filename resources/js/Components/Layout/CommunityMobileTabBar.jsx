import { Link, usePage } from '@inertiajs/react';
import { Bell, Home, MessageCircle, Users } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const tabs = [
    { href: '/communaute', icon: Home, labelKey: 'communaute.titre', label: 'Fil' },
    { href: '/amis', icon: Users, labelKey: 'nav.amis', label: 'Amis' },
    { href: '/messages', icon: MessageCircle, labelKey: 'nav.messages', label: 'Messages' },
    { href: '/notifications', icon: Bell, labelKey: 'nav.notifications', label: 'Notifications' },
];

/**
 * Bottom tab bar for the espace étudiant (mobile only) — mirrors the public
 * site's MobileTabBar pattern, but scoped to the 4 community sections plus
 * the account avatar (opens /parametres, the "Menu" hub).
 */
export default function CommunityMobileTabBar() {
    const { url, props } = usePage();
    const { t } = useTranslations();
    const user = props.auth?.user;
    const unreadCount = props.auth?.unreadNotificationsCount ?? 0;

    function isActive(href) {
        return url === href || url.startsWith(`${href}/`) || url.startsWith(`${href}?`);
    }

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom,0px)] text-isstm-navy shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label={t('nav.menu', 'Menu')}
        >
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                        isActive(tab.href) ? 'text-community-accent' : ''
                    }`}
                >
                    <tab.icon className="h-5 w-5" aria-hidden="true" />
                    {tab.href === '/notifications' && unreadCount > 0 && (
                        <span className="absolute right-1/4 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    {t(tab.labelKey, tab.label)}
                </Link>
            ))}
            <Link href="/parametres" className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive('/parametres') ? 'text-community-accent' : ''}`}>
                <img
                    src={user?.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                    alt=""
                    className={`h-5 w-5 rounded-full object-cover ring-1 ${isActive('/parametres') ? 'ring-community-accent' : 'ring-slate-300 dark:ring-slate-600'}`}
                />
                {t('nav.menu', 'Menu')}
            </Link>
        </nav>
    );
}
