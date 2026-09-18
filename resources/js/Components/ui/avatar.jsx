import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

export function Avatar({ className, ...props }) {
    return <AvatarPrimitive.Root className={cn('relative flex h-9 w-9 flex-shrink-0 overflow-hidden rounded-full', className)} {...props} />;
}

export function AvatarImage({ className, ...props }) {
    return <AvatarPrimitive.Image className={cn('h-full w-full object-cover', className)} {...props} />;
}

export function AvatarFallback({ className, ...props }) {
    return (
        <AvatarPrimitive.Fallback
            className={cn(
                'flex h-full w-full items-center justify-center bg-isstm-navy/10 text-xs font-semibold text-isstm-navy dark:bg-isstm-gold/15 dark:text-isstm-gold',
                className,
            )}
            {...props}
        />
    );
}
