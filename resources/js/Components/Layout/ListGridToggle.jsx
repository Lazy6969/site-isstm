import { LayoutGrid, List } from 'lucide-react';

export default function ListGridToggle({ view, onChange }) {
    return (
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
                type="button"
                onClick={() => onChange('grid')}
                aria-label="Grille"
                aria-pressed={view === 'grid'}
                className={`rounded-md p-1.5 transition ${
                    view === 'grid'
                        ? 'bg-isstm-navy text-white'
                        : 'text-slate-500 hover:text-isstm-navy dark:text-slate-400 dark:hover:text-white'
                }`}
            >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={() => onChange('list')}
                aria-label="Liste"
                aria-pressed={view === 'list'}
                className={`rounded-md p-1.5 transition ${
                    view === 'list'
                        ? 'bg-isstm-navy text-white'
                        : 'text-slate-500 hover:text-isstm-navy dark:text-slate-400 dark:hover:text-white'
                }`}
            >
                <List className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
