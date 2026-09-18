import { Link, usePage } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import SiteHeader from '../Layout/SiteHeader';
import Footer from '../Home/Footer';
import { useTranslations } from '../../lib/useTranslations';

export default function BiblioLayout({ children, title }) {
    const { url, props } = usePage();
    const { t } = useTranslations();
    const user = props.auth?.user;
    const canManage = ['admin', 'bibliotheque'].includes(user?.role);

    const navItems = [
        { href: '/bibliotheque', label: t('bibliotheque.nav_accueil', 'Accueil') },
        { href: '/bibliotheque/canevas', label: t('bibliotheque.nav_canevas', 'Canevas') },
        { href: '/bibliotheque/memoires', label: t('bibliotheque.nav_memoires', 'Mémoires & projets') },
        { href: '/bibliotheque/recherche', label: t('bibliotheque.nav_recherche', 'Recherche') },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
            <SiteHeader />

            <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <nav className="mx-auto flex max-w-5xl items-center justify-between gap-1 overflow-x-auto px-4 sm:px-6">
                    <div className="flex gap-1">
                        {navItems.map((item) => {
                            const active = url === item.href || url.startsWith(`${item.href}?`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                                        active
                                            ? 'border-isstm-gold text-isstm-navy dark:text-white'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-isstm-navy dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                    {canManage && (
                        <Link
                            href="/bibliotheque/admin"
                            className="flex items-center gap-1.5 whitespace-nowrap py-3 text-sm font-medium text-isstm-navy hover:text-isstm-gold dark:text-white"
                        >
                            <Settings className="h-4 w-4" aria-hidden="true" />
                            {t('bibliotheque.back_office', 'Back-office')}
                        </Link>
                    )}
                </nav>
            </div>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                {title && <h1 className="mb-6 text-2xl font-bold text-isstm-navy dark:text-white">{title}</h1>}
                {children}
            </main>

            <Footer />
        </div>
    );
}
