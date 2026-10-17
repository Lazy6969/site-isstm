import { useEffect, useState } from 'react';

function getInitial() {
    if (typeof localStorage === 'undefined') return true;
    try {
        const stored = localStorage.getItem('videoAutoplay');

        return stored === null ? true : stored === '1';
    } catch {
        return true;
    }
}

/**
 * Whether videos (currently: the Reels feed, see Communaute/Reels.jsx) play
 * automatically as they scroll into view — client-side only, mirrors
 * useDarkMode.js/useAccentColor.js. Defaults to on, matching how every other
 * short-video feed behaves out of the box.
 */
export function useAutoplayVideos() {
    const [autoplay, setAutoplay] = useState(getInitial);

    useEffect(() => {
        try {
            localStorage.setItem('videoAutoplay', autoplay ? '1' : '0');
        } catch {
            // localStorage unavailable (private mode, blocked storage) — preference just won't persist.
        }
    }, [autoplay]);

    return [autoplay, setAutoplay];
}
