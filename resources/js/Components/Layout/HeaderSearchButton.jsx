import { Link } from '@inertiajs/react';

export default function HeaderSearchButton({ variant = 'icon' }) {
    const icon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
    );

    if (variant === 'labelled') {
        return (
            <Link
                href="/recherche"
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-isstm-gold hover:bg-white hover:text-isstm-navy active:scale-95"
            >
                {icon}
                Rechercher
            </Link>
        );
    }

    return (
        <Link
            href="/recherche"
            aria-label="Recherche"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-isstm-gold hover:bg-white/10 hover:text-isstm-gold active:scale-95"
        >
            {icon}
        </Link>
    );
}
