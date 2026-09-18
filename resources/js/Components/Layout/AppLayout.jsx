import { Link, usePage } from '@inertiajs/react';
import SiteHeader from './SiteHeader';
import Footer from '../Home/Footer';

const navItems = [
    { href: '/communaute', label: 'Fil communautaire' },
    { href: '/amis', label: 'Amis' },
    { href: '/messages', label: 'Messages' },
    { href: '/groupes', label: 'Groupes' },
    { href: '/notifications', label: 'Notifications' },
];

export default function AppLayout({ children, title }) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
            <SiteHeader />

            <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
                    {navItems.map((item) => {
                        const active = url === item.href || url.startsWith(`${item.href}/`) || url.startsWith(`${item.href}?`);
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
