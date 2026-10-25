import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { useTranslations } from '../../lib/useTranslations';

/**
 * A date input with a calendar icon that opens the picker, so a date is set in
 * two clicks instead of typing jj/mm/aaaa. With a `className` it renders a plain
 * <input> styled by the caller (the toolbar filters); without one it renders the
 * shared <Input> (form fields). Everything else is passed straight through.
 */
export default function DateField({ className, wrapperClassName = 'inline-block', ...props }) {
    const { t } = useTranslations();
    const ref = useRef(null);
    const hideNativeIcon = '[&::-webkit-calendar-picker-indicator]:hidden';

    function openPicker() {
        const input = ref.current;
        if (!input) return;
        try {
            input.showPicker();
        } catch {
            input.focus();
        }
    }

    return (
        <span className={cn('relative', wrapperClassName)}>
            {className ? (
                <input ref={ref} type="date" className={cn(className, 'pr-9', hideNativeIcon)} {...props} />
            ) : (
                <Input ref={ref} type="date" className={cn('pr-9', hideNativeIcon)} {...props} />
            )}
            <button
                type="button"
                onClick={openPicker}
                disabled={props.disabled}
                aria-label={t('admin.common.open_calendar', 'Ouvrir le calendrier')}
                title={t('admin.common.open_calendar', 'Ouvrir le calendrier')}
                className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent disabled:opacity-40"
            >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
            </button>
        </span>
    );
}
