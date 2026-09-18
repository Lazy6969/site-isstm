import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function NavigationMenu({ className, children, ...props }) {
    return (
        <NavigationMenuPrimitive.Root className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>
            {children}
        </NavigationMenuPrimitive.Root>
    );
}

export function NavigationMenuList({ className, ...props }) {
    return <NavigationMenuPrimitive.List className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)} {...props} />;
}

export function NavigationMenuItem({ className, ...props }) {
    return <NavigationMenuPrimitive.Item className={cn('relative', className)} {...props} />;
}

export const navigationMenuTriggerStyle = cva(
    'group inline-flex h-9 w-max items-center justify-center gap-1 rounded-md bg-transparent px-3 py-2 text-sm font-medium text-inherit transition hover:text-isstm-gold focus:outline-none disabled:pointer-events-none disabled:opacity-50',
);

export function NavigationMenuTrigger({ className, children, ...props }) {
    return (
        <NavigationMenuPrimitive.Trigger className={cn(navigationMenuTriggerStyle(), className)} {...props}>
            {children}
            <ChevronDown className="relative top-px h-3.5 w-3.5 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
        </NavigationMenuPrimitive.Trigger>
    );
}

export function NavigationMenuContent({ className, ...props }) {
    return (
        <NavigationMenuPrimitive.Content
            className={cn(
                'absolute top-full left-1/2 z-50 mt-2 w-max -translate-x-1/2 origin-top data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                className,
            )}
            {...props}
        />
    );
}

export const NavigationMenuLink = NavigationMenuPrimitive.Link;
