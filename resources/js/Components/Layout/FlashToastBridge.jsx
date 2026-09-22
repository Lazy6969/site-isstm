import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '../../lib/useToast';

/**
 * Bridges Laravel's session flash data (shared on every Inertia response
 * via HandleInertiaRequests::share()) into toast notifications. Only
 * `flash.status` exists on the backend today (see the 53 `->with('status', …)`
 * call sites across the controllers) — there is no `flash.error` key, so
 * only the success path is wired here.
 *
 * A ref tracks the last-seen status so the same message isn't re-toasted
 * across renders that carry the same prop value (e.g. unrelated partial
 * reloads); flash clears to null server-side after being read once, so a
 * genuinely new status always transitions through null first.
 */
export default function FlashToastBridge() {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const lastStatus = useRef(null);

    useEffect(() => {
        const status = flash?.status ?? null;

        if (status && status !== lastStatus.current) {
            toast(status, { type: 'success' });
        }

        lastStatus.current = status;
    }, [flash?.status, toast]);

    return null;
}
