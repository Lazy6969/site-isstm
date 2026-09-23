import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }) {
    return <thead className={cn('border-b border-admin-border', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
    return <tbody className={cn('divide-y divide-admin-border', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
    return <tr className={cn('transition hover:bg-admin-hover', className)} {...props} />;
}

export function TableHead({ className, ...props }) {
    return (
        <th
            className={cn(
                'h-[var(--admin-density-head-h)] whitespace-nowrap px-4 text-left text-xs font-medium uppercase tracking-wide text-admin-muted',
                className,
            )}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }) {
    return (
        <td className={cn('whitespace-nowrap px-4 py-[var(--admin-density-row-py)] text-admin-text', className)} {...props} />
    );
}
