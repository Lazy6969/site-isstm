import { useEffect, useState } from 'react';

export const ACCENT_COLORS = [
    { value: 'gold', label: 'Violet (défaut)', hex: '#f093fb' },
    { value: 'emerald', label: 'Émeraude', hex: '#10b981' },
    { value: 'blue', label: 'Bleu', hex: '#2563eb' },
    { value: 'rose', label: 'Rose', hex: '#e11d48' },
    { value: 'violet', label: 'Violet', hex: '#7c3aed' },
    { value: 'amber', label: 'Ambre', hex: '#d97706' },
];

function getInitial() {
    if (typeof document === 'undefined') return 'gold';

    return document.documentElement.getAttribute('data-community-accent') || 'gold';
}

/** The espace étudiant's personal accent color — client-side only, mirrors useDarkMode.js. */
export function useAccentColor() {
    const [accent, setAccent] = useState(getInitial);

    useEffect(() => {
        if (accent === 'gold') {
            document.documentElement.removeAttribute('data-community-accent');
        } else {
            document.documentElement.setAttribute('data-community-accent', accent);
        }
        try {
            localStorage.setItem('communityAccent', accent);
        } catch {
            // localStorage unavailable (private mode, blocked storage) — theme just won't persist.
        }
    }, [accent]);

    return [accent, setAccent];
}
