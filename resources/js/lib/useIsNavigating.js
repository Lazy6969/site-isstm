import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/** True while an Inertia visit (page navigation) is in flight. */
export function useIsNavigating() {
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setNavigating(true));
        const removeFinish = router.on('finish', () => setNavigating(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return navigating;
}
