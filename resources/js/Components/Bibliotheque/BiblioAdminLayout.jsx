import { Link, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import SiteHeader from '../Layout/SiteHeader';
import Footer from '../Home/Footer';
import { useTranslations } from '../../lib/useTranslations';

export default function BiblioAdminLayout({ children, title }) {
    const { url } = usePage();
    const { t } = useTranslations();

    const navItems = [
        { href: '/bibliotheque/admin', label: t('bibliotheque_admin.nav_dashboard', 'Tableau de bord') },
        { href: '/bibliotheque/admin/canevas', label: t('bibliotheque.nav_canevas', 'Canevas') },
        { href: '/bibliotheque/admin/memoires', label: t('bibliotheque.nav_memoires', 'Mémoires & projets') },
        { href: '/bibliotheque/admin/reglages', label: t('bibliotheque_admin.nav_reglages', 'Réglages') },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <SiteHeader />

            <div className="border-b border-slate-200 bg-white">
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
                                            ? 'border-isstm-gold text-isstm-navy'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-isstm-navy'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                    <Link href="/bibliotheque" className="flex items-center gap-1.5 whitespace-nowrap py-3 text-sm font-medium text-isstm-navy hover:text-isstm-gold">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        {t('bibliotheque_admin.voir_bibliotheque', 'Voir la bibliothèque')}
                    </Link>
                </nav>
            </div>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                {title && <h1 className="mb-6 text-2xl font-bold text-isstm-navy">{title}</h1>}
                {children}
            </main>

            <Footer />
        </div>
    );
}
