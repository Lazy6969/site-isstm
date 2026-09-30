import { ArrowLeft } from 'lucide-react';

/**
 * A simple browser-history "Retour" link for the public inscription pages —
 * works regardless of which page the visitor actually came from (home,
 * /inscription, a bookmark…), so no per-page "logical parent" needs picking.
 */
export default function BackButton({ label = 'Retour', className = '' }) {
    return (
        <button
            type="button"
            onClick={() => window.history.back()}
            className={`mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-white ${className}`}
        >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {label}
        </button>
    );
}
