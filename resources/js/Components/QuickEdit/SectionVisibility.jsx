import { router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';

/**
 * Wraps a whole homepage section so a super admin can hide/show it in place.
 * A hidden section is skipped entirely for visitors (see HomeController /
 * SectionVisibilityController) — this wrapper only ever renders anything
 * extra while quick edit mode is active, so it costs nothing otherwise.
 */
export default function SectionVisibility({ section, label, hidden, children }) {
    const { active } = useQuickEdit();

    if (!active) {
        return hidden ? null : children;
    }

    function toggle() {
        router.post('/console/sections/toggle', { section }, { preserveScroll: true, preserveState: true });
    }

    return (
        <div className="relative">
            {hidden && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px]">
                    <span className="pointer-events-auto rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
                        Section masquée pour les visiteurs
                    </span>
                </div>
            )}
            <div className={hidden ? 'opacity-40' : ''}>{children}</div>
            <button
                type="button"
                onClick={toggle}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-950 shadow ring-2 ring-white transition hover:scale-105"
                aria-label={hidden ? `Afficher la section ${label}` : `Masquer la section ${label}`}
            >
                {hidden ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
                {hidden ? 'Afficher' : 'Masquer'}
            </button>
        </div>
    );
}
