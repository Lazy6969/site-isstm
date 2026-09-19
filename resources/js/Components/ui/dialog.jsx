import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function DialogOverlay({ className, ...props }) {
    return (
        <DialogPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
}

export function DialogContent({ className, children, ...props }) {
    return (
        <DialogPrimitive.Portal>
            <DialogOverlay />
            <DialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-admin-border bg-admin-card p-6 text-admin-text shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    className,
                )}
                {...props}
            >
                {children}
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fermer</span>
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogHeader({ className, ...props }) {
    return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
    return <DialogPrimitive.Title className={cn('text-lg font-semibold text-admin-text', className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
    return <DialogPrimitive.Description className={cn('text-sm text-admin-text-secondary', className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
    return <div className={cn('mt-6 flex items-center justify-end gap-3', className)} {...props} />;
}
