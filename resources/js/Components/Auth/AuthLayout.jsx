import { Link } from '@inertiajs/react';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import DarkModeToggle from '../Layout/DarkModeToggle';

export default function AuthLayout({ title, subtitle, children, background = null }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-isstm-navy-dark px-6 py-12">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-isstm-navy/40 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-isstm-gold/20 blur-3xl" />
                {background}
            </div>

            <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
                <LanguageSwitcher />
                <DarkModeToggle className="text-white/90 hover:text-isstm-gold" />
            </div>

            <div className="relative w-full max-w-md">
                <Link href="/" className="mb-8 flex items-center justify-center">
                    <img src="/images/logo-isstm.svg" alt="ISSTM" className="h-16 w-auto" />
                </Link>

                <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
                    <h1 className="text-xl font-bold text-isstm-navy dark:text-white">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
