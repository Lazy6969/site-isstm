import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', {
    variants: {
        variant: {
            default: 'bg-isstm-navy/10 text-isstm-navy dark:bg-isstm-gold/15 dark:text-isstm-gold',
            gold: 'bg-isstm-gold/15 text-amber-800 dark:text-isstm-gold',
            success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
            warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
            danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
            outline: 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300',
        },
    },
    defaultVariants: { variant: 'default' },
});

export function Badge({ className, variant, ...props }) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
