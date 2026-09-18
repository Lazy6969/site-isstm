import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
    return (
        <div
            className={cn('rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800', className)}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }) {
    return <div className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
    return <h3 className={cn('text-base font-semibold text-isstm-navy dark:text-white', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
    return <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
    return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
    return <div className={cn('flex items-center gap-3 p-5 pt-0', className)} {...props} />;
}
