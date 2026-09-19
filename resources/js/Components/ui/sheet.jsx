import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

function SheetOverlay({ className, ...props }) {
    return (
        <SheetPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
}

const sheetVariants = cva(
    'fixed z-50 gap-4 bg-white p-6 text-slate-900 shadow-xl transition ease-in-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-300 data-[state=open]:duration-500 dark:bg-slate-900 dark:text-slate-100',
    {
        variants: {
            side: {
                bottom: 'inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
                right: 'inset-y-0 right-0 h-full w-3/4 border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
                left: 'inset-y-0 left-0 h-full w-3/4 border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
            },
        },
        defaultVariants: { side: 'right' },
    },
);

export function SheetContent({ side = 'right', className, children, ...props }) {
    return (
        <SheetPrimitive.Portal>
            <SheetOverlay />
            <SheetPrimitive.Content className={cn(sheetVariants({ side }), className)} {...props}>
                {children}
                <SheetPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fermer</span>
                </SheetPrimitive.Close>
            </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
    );
}

export function SheetTitle({ className, ...props }) {
    return <SheetPrimitive.Title className={cn('text-sm font-semibold text-isstm-navy dark:text-white', className)} {...props} />;
}
