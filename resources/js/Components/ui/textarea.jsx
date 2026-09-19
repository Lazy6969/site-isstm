import { cn } from '../../lib/utils';

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                'flex min-h-24 w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted transition outline-none focus:border-admin-text/40 focus:ring-2 focus:ring-admin-text/10 disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}
