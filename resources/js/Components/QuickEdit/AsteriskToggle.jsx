import { router } from '@inertiajs/react';
import { Asterisk } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';

/**
 * Shows/hides the red "required" asterisk next to a field label — visual
 * only, one click, no dialog. Deliberately never touches whether the field
 * is actually mandatory (that stays wherever the form's own validation
 * lives) — this only controls what the candidate sees next to the label, so
 * toggling it can't silently change what the server will accept.
 */
export default function AsteriskToggle({ contentKey, visible }) {
    const { canEdit, active } = useQuickEdit();

    if (!canEdit || !active) {
        return null;
    }

    function toggle() {
        router.post(
            '/console/content/update',
            { key: contentKey, value: visible ? 'false' : 'true' },
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full shadow ring-2 ring-white transition hover:scale-110 ${
                visible ? 'bg-amber-400 text-amber-950' : 'bg-slate-300 text-slate-600'
            }`}
            aria-label={visible ? "Masquer l'astérisque obligatoire" : "Afficher l'astérisque obligatoire"}
            title={visible ? "Masquer l'astérisque" : "Afficher l'astérisque"}
        >
            <Asterisk className="h-2.5 w-2.5" aria-hidden="true" />
        </button>
    );
}
