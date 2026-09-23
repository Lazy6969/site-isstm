import { router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';

/**
 * Wraps one contact field (email/phone/facebook/address/a map) so a super
 * admin can hide it without deleting its site_contents value — see
 * ContactFieldVisibilityController. Skipped entirely for visitors when
 * hidden, same principle as SectionVisibility but sized for a small card.
 */
export default function ContactFieldVisibility({ field, label, hidden, children }) {
    const { active } = useQuickEdit();

    if (!active) {
        return hidden ? null : children;
    }

    function toggle() {
        router.post('/console/contact-fields/toggle', { field }, { preserveScroll: true, preserveState: true });
    }

    return (
        <div className="relative">
            {hidden && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/60 backdrop-blur-[1px]">
                    <span className="pointer-events-auto rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow">Masqué</span>
                </div>
            )}
            <div className={hidden ? 'opacity-40' : ''}>{children}</div>
            <button
                type="button"
                onClick={toggle}
                className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                aria-label={hidden ? `Afficher ${label}` : `Masquer ${label}`}
                title={hidden ? `Afficher ${label}` : `Masquer ${label}`}
            >
                {hidden ? <Eye className="h-3 w-3" aria-hidden="true" /> : <EyeOff className="h-3 w-3" aria-hidden="true" />}
            </button>
        </div>
    );
}
