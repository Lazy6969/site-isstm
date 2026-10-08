import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '../../lib/useToast';

/**
 * Bridges Laravel's session flash data (shared on every Inertia response
 * via HandleInertiaRequests::share()) into toast notifications:
 * `flash.status` as a success toast, `flash.error` as a failure toast.
 *
 * A ref tracks each last-seen message so the same one isn't re-toasted
 * across renders that carry the same prop value (e.g. unrelated partial
 * reloads); flash clears to null server-side after being read once, so a
 * genuinely new message always transitions through null first.
 */
export default function FlashToastBridge() {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const lastStatus = useRef(null);
    const lastError = useRef(null);

    useEffect(() => {
        const status = flash?.status ?? null;

        if (status && status !== lastStatus.current) {
            toast(status, { type: 'success' });
        }

        lastStatus.current = status;
    }, [flash?.status, toast]);

    useEffect(() => {
        const error = flash?.error ?? null;

        if (error && error !== lastError.current) {
            toast(error, { type: 'error' });
        }

        lastError.current = error;
    }, [flash?.error, toast]);

    return null;
}
