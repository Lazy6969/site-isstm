import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';

/**
 * The search + filters + primary-action bar reused across every admin list
 * page (Contenu, Enseignants, Users, ...) so they stay visually consistent.
 * `filters`/`action` are optional slots rendered to the right of the search
 * box; anything page-specific (a <Select>, a "+ Ajouter" button) goes there.
 */
export default function AdminToolbar({ search, onSearchChange, searchPlaceholder, filters, action, className = '' }) {
    return (
        <div className={`mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {onSearchChange && (
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="pl-9 pr-8"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}
                {filters}
            </div>
            {action}
        </div>
    );
}
