import { useEffect, useRef, useState } from 'react';

/**
 * Hides past a scroll threshold once the user scrolls down, reveals again as soon as
 * they scroll up (by any amount) or return near the top of the page.
 */
export function useHideOnScroll(threshold = 80) {
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);

    useEffect(() => {
        lastY.current = window.scrollY;

        function onScroll() {
            const y = window.scrollY;

            if (y <= threshold) {
                setHidden(false);
            } else if (y > lastY.current) {
                setHidden(true);
            } else if (y < lastY.current) {
                setHidden(false);
            }

            lastY.current = y;
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return hidden;
}
