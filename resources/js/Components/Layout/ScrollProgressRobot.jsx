import { usePage } from '@inertiajs/react';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Pages where this widget stays hidden: the admin console (its own chrome,
// not the public site) and the actual multi-step wizards (the candidate is
// meant to focus on the form, not on how far down the page they've scrolled).
// /rejoindre and /inscription are plain scrollable landing/info pages, not a
// wizard step, so the robot stays visible there.
const HIDDEN_PREFIXES = ['/console', '/preinscription', '/reinscription', '/mon-dossier'];

function isHidden(url) {
    return HIDDEN_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`));
}

/**
 * Fixed bottom-right scroll-progress indicator — a ring around a small robot
 * that fills as the visitor scrolls down the page, with the percentage in the
 * middle. Doubles as a "back to top" button, a natural affordance once
 * something already tracks how far down the page you are.
 */
export default function ScrollProgressRobot() {
    const { url } = usePage();
    const [percent, setPercent] = useState(0);
    // Separate from `percent`: a page can genuinely be at 0% (just landed,
    // haven't scrolled yet) while still having plenty to scroll through — that
    // must stay visible. Only a page with nothing to scroll hides the widget.
    const [scrollable, setScrollable] = useState(false);

    useEffect(() => {
        function update() {
            const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setScrollable(max > 0);
            setPercent(max <= 0 ? 0 : Math.min(100, Math.round((window.scrollY / max) * 100)));
        }

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        // Catches a page growing after the initial layout — images finishing
        // to load, fonts swapping in — none of which fire a window resize.
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
        observer?.observe(document.documentElement);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            observer?.disconnect();
        };
    }, [url]);

    if (isHidden(url) || !scrollable) {
        return null;
    }

    const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title={`${percent}% de la page parcourus — remonter en haut`}
            aria-label={`${percent}% de la page parcourus — remonter en haut`}
            // bottom-20 on mobile clears MobileTabBar's fixed bottom nav (md:hidden);
            // md+ has no such bar, so the widget sits closer to the corner there.
            className="fixed right-5 bottom-20 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition hover:scale-105 md:bottom-5 dark:bg-slate-900/90 dark:ring-white/10"
        >
            <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
                <circle cx="28" cy="28" r={RADIUS} fill="none" strokeWidth="3" className="stroke-slate-200 dark:stroke-slate-700" />
                <circle
                    cx="28"
                    cy="28"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    className="stroke-isstm-gold transition-[stroke-dashoffset] duration-150"
                />
            </svg>
            <span className="relative flex flex-col items-center leading-none text-isstm-navy dark:text-white">
                <Bot className="h-4 w-4" aria-hidden="true" />
                <span className="mt-0.5 text-[10px] font-bold tabular-nums">{percent}%</span>
            </span>
        </button>
    );
}
