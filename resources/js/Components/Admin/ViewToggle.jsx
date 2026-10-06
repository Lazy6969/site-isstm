import { LayoutGrid, List } from 'lucide-react';

/**
 * List/grid switch shared by the admin list pages that offer both — same
 * filtered data, just laid out differently. Purely a client-side display
 * preference, not persisted server-side.
 */
export default function ViewToggle({ view, onChange, listLabel = 'Vue liste', gridLabel = 'Vue grille' }) {
    return (
        <div className="flex items-center gap-1 rounded-lg border border-admin-border bg-admin-card p-1">
            <button
                type="button"
                onClick={() => onChange('list')}
                aria-pressed={view === 'list'}
                aria-label={listLabel}
                title={listLabel}
                className={`inline-flex items-center justify-center rounded-md p-1.5 transition ${
                    view === 'list' ? 'bg-admin-hover text-admin-text' : 'text-admin-text-secondary hover:text-admin-text'
                }`}
            >
                <List className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={() => onChange('grid')}
                aria-pressed={view === 'grid'}
                aria-label={gridLabel}
                title={gridLabel}
                className={`inline-flex items-center justify-center rounded-md p-1.5 transition ${
                    view === 'grid' ? 'bg-admin-hover text-admin-text' : 'text-admin-text-secondary hover:text-admin-text'
                }`}
            >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
