import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/** True while an Inertia visit targeting the homepage ("/") is in flight. */
export function useIsNavigatingToHome() {
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.url.pathname === '/') {
                setNavigating(true);
            }
        });
        const removeFinish = router.on('finish', () => setNavigating(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return navigating;
}
