import { useMemo, useState } from 'react';

/** "YYYY-MM-DD" of the local day `offset` days from today. */
export function isoDay(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const pad = (n) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * From/to date filter state shared by the admin lists. `matches(value)` compares
 * the calendar day of a timestamp ("2026-10-25T08:00:00Z" or "2026-10-25") with
 * the range — an empty bound is open, and an item with no date only matches
 * while the range is empty.
 */
export function useDateRange() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    return useMemo(() => {
        const active = Boolean(from || to);

        return {
            from,
            to,
            active,
            setFrom,
            setTo,
            reset: () => {
                setFrom('');
                setTo('');
            },
            matches: (value) => {
                if (!active) return true;
                const day = value ? String(value).slice(0, 10) : '';

                return day !== '' && (!from || day >= from) && (!to || day <= to);
            },
        };
    }, [from, to]);
}
