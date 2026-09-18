import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', {
    variants: {
        variant: {
            default: 'bg-isstm-navy/10 text-isstm-navy',
            gold: 'bg-isstm-gold/15 text-amber-800',
            success: 'bg-emerald-100 text-emerald-700',
            warning: 'bg-amber-100 text-amber-700',
            danger: 'bg-red-100 text-red-700',
            outline: 'border border-slate-200 text-slate-600',
        },
    },
    defaultVariants: { variant: 'default' },
});

export function Badge({ className, variant, ...props }) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
