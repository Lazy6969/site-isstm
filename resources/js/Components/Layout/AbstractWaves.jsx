import { useId } from 'react';
import { usePage } from '@inertiajs/react';

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 220;

/** Samples a sine wave into a polyline path — enough points that straight
 * segments read as a smooth curve at this stroke width. */
function wavePath({ amplitude, frequency, phase, baseline, points = 70 }) {
    const step = VIEW_WIDTH / points;
    let d = '';
    for (let i = 0; i <= points; i++) {
        const x = i * step;
        const y = baseline + amplitude * Math.sin((x / VIEW_WIDTH) * frequency * Math.PI * 2 + phase);
        d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
}

const LINE_COUNT = 16;
const WAVE_LINES = Array.from({ length: LINE_COUNT }, (_, i) => {
    const t = i / (LINE_COUNT - 1);
    return {
        d: wavePath({
            amplitude: 22 + t * 26,
            frequency: 1.6 + t * 0.5,
            phase: t * 2.4,
            baseline: VIEW_HEIGHT * 0.55 + (t - 0.5) * 70,
        }),
        opacity: 0.25 + (1 - Math.abs(t - 0.5) * 2) * 0.55,
    };
});

const CIRCLES = [
    { cx: 60, cy: 40, r: 40 },
    { cx: 60, cy: 40, r: 75 },
    { cx: 60, cy: 40, r: 110 },
    { cx: 540, cy: 190, r: 50 },
    { cx: 540, cy: 190, r: 90 },
    { cx: 540, cy: 190, r: 130 },
];

const DIAGONAL_COUNT = 22;

const DOTS = Array.from({ length: 70 }, (_, i) => {
    // Deterministic pseudo-random spread (no Math.random, so the pattern is
    // stable across server/client renders instead of hydration-mismatching).
    const seed = i * 137.508; // golden angle, gives an even scattered feel
    const x = (seed * 3.7) % VIEW_WIDTH;
    const y = ((i * 53) % VIEW_HEIGHT) + ((seed % 17) - 8);
    const r = 1.5 + ((i * 7) % 5);
    return { x, y, r, opacity: 0.2 + ((i * 11) % 10) / 20 };
});

/** Design 1 — "Vagues pleines": two filled, bottom-anchored wave shapes. */
function WavesFilled({ color, opacity }) {
    return (
        <>
            <path
                fill={color}
                opacity={opacity}
                d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,154.7C840,149,960,171,1080,181.3C1200,192,1320,192,1380,192L1440,192L1440,600L0,600Z"
                transform={`scale(${VIEW_WIDTH / 1440}, ${VIEW_HEIGHT / 600})`}
            />
            <path
                fill={color}
                opacity={opacity * 0.6}
                d="M0,320L60,330.7C120,341,240,363,360,352C480,341,600,299,720,282.7C840,267,960,277,1080,293.3C1200,309,1320,331,1380,341.3L1440,352L1440,600L0,600Z"
                transform={`scale(${VIEW_WIDTH / 1440}, ${VIEW_HEIGHT / 600})`}
            />
        </>
    );
}

/** Design 2 — "Lignes fluides": a braided bundle of thin stroked strands. */
function WavesLines({ color, opacity }) {
    return (
        <>
            {WAVE_LINES.map((line, index) => (
                <path
                    key={index}
                    d={line.d}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeOpacity={line.opacity * opacity * 0.22}
                />
            ))}
        </>
    );
}

/** Design 3 — "Cercles": loose concentric rings in two opposite corners. */
function WavesCircles({ color, opacity }) {
    return (
        <>
            {CIRCLES.map((c, index) => (
                <circle key={index} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={opacity * 0.3} />
            ))}
        </>
    );
}

/** Design 4 — "Diagonales": a sparse diagonal hatch, fading at both ends. */
function WavesDiagonal({ color, opacity, uid }) {
    const fadeId = `waves-diag-fade-${uid}`;

    return (
        <>
            <defs>
                <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={color} stopOpacity="0" />
                    <stop offset="0.5" stopColor={color} stopOpacity={opacity} />
                    <stop offset="1" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {Array.from({ length: DIAGONAL_COUNT }, (_, i) => {
                const offset = (i / (DIAGONAL_COUNT - 1)) * (VIEW_WIDTH + VIEW_HEIGHT) - VIEW_HEIGHT;
                return (
                    <line
                        key={i}
                        x1={offset}
                        y1={0}
                        x2={offset + VIEW_HEIGHT}
                        y2={VIEW_HEIGHT}
                        stroke={`url(#${fadeId})`}
                        strokeWidth="1"
                    />
                );
            })}
        </>
    );
}

/** Design 5 — "Points": a scattered constellation of dots. */
function WavesDots({ color, opacity }) {
    return (
        <>
            {DOTS.map((dot, index) => (
                <circle key={index} cx={dot.x} cy={dot.y} r={dot.r} fill={color} opacity={dot.opacity * opacity * 0.5} />
            ))}
        </>
    );
}

const DESIGNS = {
    1: WavesFilled,
    2: WavesLines,
    3: WavesCircles,
    4: WavesDiagonal,
    5: WavesDots,
};

export const ABSTRACT_WAVES_DESIGNS = [
    { value: 'none', label: 'Aucun' },
    { value: '1', label: 'Vagues pleines' },
    { value: '2', label: 'Lignes fluides' },
    { value: '3', label: 'Cercles' },
    { value: '4', label: 'Diagonales' },
    { value: '5', label: 'Points' },
];

/**
 * A decorative abstract background, tinted with the site's own primary
 * color (see SitePrimaryColorPicker.jsx) so it always matches whatever
 * palette the admin has chosen. Which of the 5 designs shows — or none at
 * all — is a single global choice (the "Couleur" pencil fixed on the public
 * site), not a per-page setting, so this component reads it itself: drop
 * `<AbstractWaves />` with no props as the first child of a `relative
 * overflow-hidden` section, give that section's actual content `relative
 * z-10`, and it renders (or doesn't) on its own. Never shows on /communaute,
 * which has its own distinct, app-like visual language.
 */
export default function AbstractWaves({ className = '', opacity = 1 }) {
    const { props, url } = usePage();
    const { sitePrimaryColor, abstractWavesDesign } = props;
    const uid = useId();

    if (!abstractWavesDesign || abstractWavesDesign === 'none' || (url ?? '').startsWith('/communaute')) {
        return null;
    }

    const Design = DESIGNS[abstractWavesDesign] ?? WavesFilled;
    const color = sitePrimaryColor?.resolvedHex ?? '#003366';

    return (
        <svg
            className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${className}`}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <Design color={color} opacity={opacity} uid={uid} />
        </svg>
    );
}
