import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
    return (
        <TabsPrimitive.List
            className={cn('inline-flex items-center gap-1 rounded-full bg-slate-100 p-1', className)}
            {...props}
        />
    );
}

export function TabsTrigger({ className, ...props }) {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-isstm-navy data-[state=active]:shadow-sm',
                className,
            )}
            {...props}
        />
    );
}

export function TabsContent({ className, ...props }) {
    return <TabsPrimitive.Content className={cn('mt-4', className)} {...props} />;
}
