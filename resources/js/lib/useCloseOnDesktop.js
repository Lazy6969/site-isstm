import { useEffect } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

/**
 * Mobile sheets (MobileMenuButton, MobileTabBar) are portalled to
 * document.body by Radix, so a parent's `md:hidden` never hides them once
 * open — rotating the phone (or resizing past the md breakpoint) left an
 * open bottom sheet stuck on screen alongside the now-visible desktop nav.
 * Closes every given setter's sheet as soon as the viewport crosses md.
 */
export function useCloseOnDesktop(...setters) {
    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_QUERY);

        function handleChange(e) {
            if (e.matches) {
                setters.forEach((setOpen) => setOpen(false));
            }
        }

        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
