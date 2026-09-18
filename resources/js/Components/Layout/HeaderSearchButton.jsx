import { Link } from '@inertiajs/react';
import { Search } from 'lucide-react';

export default function HeaderSearchButton({ variant = 'icon' }) {
    if (variant === 'labelled') {
        return (
            <Link
                href="/recherche"
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-isstm-gold hover:bg-white hover:text-isstm-navy active:scale-95"
            >
                <Search className="h-4 w-4" aria-hidden="true" />
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
            <Search className="h-4 w-4" aria-hidden="true" />
        </Link>
    );
}
