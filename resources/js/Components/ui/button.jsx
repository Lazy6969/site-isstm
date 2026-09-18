import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-isstm-gold text-isstm-navy-dark hover:brightness-110',
                outline: 'border border-white/60 text-white hover:bg-white hover:text-isstm-navy',
                ghost: 'text-inherit hover:bg-white/10',
            },
            size: {
                default: 'px-4 py-2',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export function Button({ className, variant, size, ...props }) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
