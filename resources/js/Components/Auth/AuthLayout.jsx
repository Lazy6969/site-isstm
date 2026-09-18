import { Link } from '@inertiajs/react';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-isstm-navy-dark px-6 py-12">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-isstm-navy/40 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-isstm-gold/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <Link href="/" className="mb-8 flex items-center justify-center gap-3">
                    <img src="/images/logo-isstm.png" alt="ISSTM" className="h-11 w-11 rounded-full object-cover" />
                    <span className="text-lg font-semibold tracking-wide text-white">ISSTM</span>
                </Link>

                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    <h1 className="text-xl font-bold text-isstm-navy">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
