import { cn } from '../../lib/utils';

export function Input({ className, type = 'text', ...props }) {
    return (
        <input
            type={type}
            className={cn(
                'flex h-10 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-sm text-admin-text placeholder:text-admin-muted transition outline-none focus:border-admin-text/40 focus:ring-2 focus:ring-admin-text/10 disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}
