import { useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Collapsible home for a page's filters: a "Afficher / Masquer les filtres"
 * button (with how many are active) that reveals the filter controls, closed by
 * default so the list itself stays the focus. The filters keep working while it
 * is closed — the badge says when some are on.
 */
export default function FilterPanel({ activeCount = 0, children, className = '', search, onSearch, searchPlaceholder }) {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);

    return (
        <div className={`mb-4 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex h-10 items-center gap-2 rounded-lg border border-admin-accent/40 bg-admin-accent/10 px-3.5 text-sm font-semibold text-admin-accent transition hover:bg-admin-accent/15"
            >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                {open ? t('admin.filters.hide', 'Masquer les filtres') : t('admin.filters.show', 'Afficher les filtres')}
                {activeCount > 0 && <span className="rounded-full bg-admin-accent px-1.5 text-xs text-admin-accent-foreground">{activeCount}</span>}
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {onSearch && (
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder={searchPlaceholder ?? t('admin.filters.search', 'Rechercher par nom...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pr-9 pl-10 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                    {search && (
                        <button type="button" onClick={() => onSearch('')} aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')} className="absolute top-1/2 right-2.5 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted hover:bg-admin-hover hover:text-admin-text">
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}
            </div>
            {open && <div className="admin-card mt-3 space-y-3 p-3">{children}</div>}
        </div>
    );
}
