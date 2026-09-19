import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Native <select>, styled to match the admin design system. A searchable
 * combobox (cmdk) would need a new dependency — this covers plain pickers
 * (filière, classe, statut...) without one.
 */
export function Select({ className, children, ...props }) {
    return (
        <div className="relative">
            <select
                className={cn(
                    'h-10 w-full appearance-none rounded-lg border border-admin-border bg-admin-surface px-3 pr-9 text-sm text-admin-text transition outline-none focus:border-admin-text/40 focus:ring-2 focus:ring-admin-text/10 disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
                aria-hidden="true"
            />
        </div>
    );
}
