import { Plus } from 'lucide-react';

/**
 * Floating "+" trigger for a quick-add dialog (news/gallery/document), shown
 * only in quick-edit mode to an admin with the matching *.create permission
 * — see QuickAddNewsDialog / QuickAddGalleryDialog / QuickAddDocumentDialog.
 * Sits above SeoHead's own floating button (bottom-5) so the two never overlap.
 */
export default function QuickAddButton({ label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="fixed right-5 bottom-20 z-40 hidden items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-xs font-semibold text-amber-950 shadow-lg ring-2 ring-white transition hover:scale-105 md:flex"
        >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {label}
        </button>
    );
}
