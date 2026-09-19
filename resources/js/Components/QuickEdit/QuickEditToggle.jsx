import { Pencil } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useQuickEdit } from '../../lib/useQuickEdit';

/**
 * Floating icon-only switch for quick edit mode — visible on every page (admin
 * or public) to a user with quick-edit.access, replacing both the sidebar's
 * old text button and the "you're in edit mode" banner.
 */
export default function QuickEditToggle() {
    const { canEdit, enabled, toggle } = useQuickEdit();
    const { url } = usePage();

    if (!canEdit) {
        return null;
    }

    function handleClick() {
        const turningOn = !enabled;
        toggle();

        // From inside the admin panel there's nothing to edit on screen —
        // jump to the public site so the pencils are immediately visible.
        if (turningOn && url.startsWith('/console')) {
            router.visit('/');
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            title={enabled ? 'Désactiver le mode édition rapide' : 'Activer le mode édition rapide'}
            aria-label={enabled ? 'Désactiver le mode édition rapide' : 'Activer le mode édition rapide'}
            aria-pressed={enabled}
            className={`fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-2 ring-white transition hover:scale-105 ${
                enabled ? 'bg-amber-400 text-amber-950' : 'bg-admin-text text-admin-bg'
            }`}
        >
            <Pencil className="h-5 w-5" aria-hidden="true" />
        </button>
    );
}
