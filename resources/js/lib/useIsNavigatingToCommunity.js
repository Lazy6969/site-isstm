import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const COMMUNITY_PATHS = ['/communaute', '/amis', '/messages', '/groupes', '/notifications', '/parametres'];

function isCommunityPath(pathname) {
    return COMMUNITY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** True while an Inertia visit targeting an espace étudiant page is in flight. */
export function useIsNavigatingToCommunity() {
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (isCommunityPath(event.detail.visit.url.pathname)) {
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
