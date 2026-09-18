import { useEffect, useState } from 'react';

function getInitial() {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
}

export function useDarkMode() {
    const [dark, setDark] = useState(getInitial);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        } catch {
            // localStorage unavailable (private mode, blocked storage) — theme just won't persist.
        }
    }, [dark]);

    return [dark, setDark];
}
