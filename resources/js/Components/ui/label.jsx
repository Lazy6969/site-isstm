import { cn } from '../../lib/utils';

export function Label({ className, ...props }) {
    return (
        <label
            className={cn('text-sm font-medium text-admin-text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className)}
            {...props}
        />
    );
}
