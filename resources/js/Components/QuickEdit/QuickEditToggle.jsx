import { Pencil } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useQuickEdit } from '../../lib/useQuickEdit';

/**
 * Floating icon-only switch for quick edit mode — visible on public pages
 * only. Inside /console, AdminHeader renders its own inline pencil next to
 * the admin's profile instead, so the two never show up at once.
 */
export default function QuickEditToggle() {
    const { canEdit, enabled, toggle } = useQuickEdit();
    const { url } = usePage();

    if (!canEdit || url.startsWith('/console')) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={toggle}
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
