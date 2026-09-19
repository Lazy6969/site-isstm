import { cn } from '../../lib/utils';

/**
 * Native <input type="checkbox">, styled. A Radix Checkbox would need a new
 * dependency (@radix-ui/react-checkbox) — not installed.
 */
export function Checkbox({ className, ...props }) {
    return (
        <input
            type="checkbox"
            className={cn(
                'h-4 w-4 flex-shrink-0 rounded border-admin-border bg-admin-surface text-admin-text accent-admin-text transition focus:ring-2 focus:ring-admin-text/10 disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}
