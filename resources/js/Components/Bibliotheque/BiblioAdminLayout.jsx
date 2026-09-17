import { Link, usePage } from '@inertiajs/react';
import SiteHeader from '../Layout/SiteHeader';
import Footer from '../Home/Footer';

const navItems = [
    { href: '/bibliotheque/admin', label: 'Tableau de bord' },
    { href: '/bibliotheque/admin/canevas', label: 'Canevas' },
    { href: '/bibliotheque/admin/memoires', label: 'Mémoires & projets' },
    { href: '/bibliotheque/admin/reglages', label: 'Réglages' },
];

export default function BiblioAdminLayout({ children, title }) {
    const { url } = usePage();

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
                    <Link href="/bibliotheque" className="whitespace-nowrap py-3 text-sm font-medium text-isstm-navy hover:text-isstm-gold">
                        Voir la bibliothèque
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
