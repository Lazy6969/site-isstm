import { useEffect, useState } from 'react';

/**
 * Tracks whether a CSS media query currently matches, re-evaluating live as
 * the viewport crosses it (e.g. rotating a phone, resizing a window) — unlike
 * a one-off `window.matchMedia(query).matches` read taken only at mount.
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches));

    useEffect(() => {
        const mql = window.matchMedia(query);
        setMatches(mql.matches);

        function handleChange(e) {
            setMatches(e.matches);
        }

        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}
