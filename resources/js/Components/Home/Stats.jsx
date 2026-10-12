import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import EditableIcon from '../QuickEdit/EditableIcon';
import EditableText from '../QuickEdit/EditableText';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';

function useCountUp(target, active) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        // Leaving view resets to 0 rather than freezing mid-count, so the
        // next time this item scrolls into view it counts up fresh instead
        // of just sitting at its last value.
        if (!active) {
            setValue(0);
            return;
        }
        const duration = 1400;
        const start = performance.now();

        let frame;
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.round(target * (1 - (1 - progress) ** 3)));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, active]);

    return value;
}

/** Combines the count-up animation with the IntersectionObserver that drives
 * it — shared by every one of the 9 designs below so each only has to render
 * markup around `value`/`active`. `active` toggles both ways (not just on
 * first reveal), so scrolling the item out and back in replays the count-up
 * and the icon's pop-in every time, not just once per page load. */
function useRevealingCount(target) {
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    const value = useCountUp(target, active);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.4 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, value, active];
}

// Shared icon "pop in" transition, applied to every design's icon wrapper
// below — scales/fades in on each reveal, back out when the item leaves
// view, so it replays in sync with the count-up every time.
const ICON_POP_CLASS = 'transition-all duration-500 ease-out';
function iconPopStyle(active) {
    return active ? 'scale-100 opacity-100' : 'scale-50 opacity-0';
}

// Shared 3-color accent rotation (brand gold/navy/red by default) for the
// designs that color each stat differently — admin-overridable via the
// design picker's own color swatches (see stat_design's `colorizable` prop
// below), applied as inline styles rather than Tailwind classes since a
// color chosen at runtime can't be a statically-scanned class name.
const DEFAULT_PALETTE = ['#d4a017', '#003366', '#dc143c'];
const PALETTE_LABELS = ['Couleur 1', 'Couleur 2', 'Couleur 3'];

/* ---------------------------------------------------------------------- */
/* Design 1 — "Plaque": a single glass panel, gold icon badge per item.    */
/* ---------------------------------------------------------------------- */

function PlaqueItem({ item, isLast }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="relative flex flex-1 items-center gap-4 px-6 py-6 sm:px-7 sm:py-7">
            <span
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-isstm-gold to-amber-400 text-isstm-navy-dark shadow-lg shadow-black/20 sm:h-16 sm:w-16 ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div className="min-w-0">
                <p className="text-3xl leading-none font-extrabold tracking-tight text-isstm-navy-dark sm:text-4xl dark:text-white">
                    +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600 sm:text-[0.95rem] dark:text-white/70">
                    <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
                </p>
            </div>

            {!isLast && (
                <span
                    className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-slate-200 sm:inset-x-auto sm:inset-y-7 sm:right-0 sm:h-auto sm:w-px dark:bg-white/15"
                    aria-hidden="true"
                />
            )}
        </div>
    );
}

function DesignPlaque({ items, pencil }) {
    return (
        <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
            {pencil}
            <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 backdrop-blur-md sm:flex-row dark:border-white/10 dark:bg-isstm-navy/95 dark:shadow-black/30">
                <div
                    className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full border-[16px] border-isstm-navy/5 dark:border-white/5"
                    aria-hidden="true"
                />
                {items.map((item, index) => (
                    <PlaqueItem key={item.statKey} item={item} isLast={index === items.length - 1} />
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 6 — "Plaque dégradée": same bottom-of-hero plaque placement, a   */
/* gold-to-navy gradient panel instead of a flat glass one.                */
/* ---------------------------------------------------------------------- */

function GradientPlaqueItem({ item, isLast }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="relative flex flex-1 flex-col items-center gap-2 px-6 py-7 text-center sm:py-8">
            <span
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-6 w-6" />
            </span>
            <p className="text-3xl leading-none font-extrabold text-white sm:text-4xl">
                +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
            </p>
            <p className="text-xs font-medium tracking-wide text-white/80 uppercase">
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>

            {!isLast && (
                <span
                    className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-white/20 sm:inset-x-auto sm:inset-y-8 sm:right-0 sm:h-auto sm:w-px"
                    aria-hidden="true"
                />
            )}
        </div>
    );
}

function DesignPlaqueGradient({ items, pencil }) {
    return (
        <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
            {pencil}
            <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-isstm-navy via-isstm-navy-dark to-isstm-gold shadow-2xl shadow-black/30 sm:flex-row">
                {items.map((item, index) => (
                    <GradientPlaqueItem key={item.statKey} item={item} isLast={index === items.length - 1} />
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 7 — "Plaque contour": same placement, each stat its own outlined */
/* cell (brand accent border) inside one bounding panel.                   */
/* ---------------------------------------------------------------------- */

function OutlinePlaqueItem({ item, color }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="flex flex-col items-center gap-2 rounded-xl border-2 px-5 py-6 text-center" style={{ borderColor: color }}>
            <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
                style={{ backgroundColor: color }}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-5 w-5" />
            </span>
            <p className="text-2xl leading-none font-extrabold text-isstm-navy-dark sm:text-3xl dark:text-white">
                +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
            </p>
            <p className="text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-white/70">
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>
        </div>
    );
}

function DesignPlaqueOutline({ items, pencil, colors }) {
    return (
        <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
            {pencil}
            <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-5 dark:border-white/10 dark:bg-slate-900">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {items.map((item, index) => (
                        <OutlinePlaqueItem key={item.statKey} item={item} color={colors[index]} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 8 — "Plaque couleur": same placement, panel split into 3 solid   */
/* brand-color blocks instead of one shared background.                   */
/* ---------------------------------------------------------------------- */

function ColorPlaqueItem({ item, color, isLast }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div
            ref={ref}
            className={`flex flex-1 flex-col items-center gap-2 px-6 py-7 text-center text-white sm:py-8 ${
                !isLast ? 'border-b border-white/20 sm:border-r sm:border-b-0' : ''
            }`}
            style={{ backgroundColor: color }}
        >
            <span
                className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-5 w-5" />
            </span>
            <p className="text-3xl leading-none font-extrabold sm:text-4xl">
                +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
            </p>
            <p className="text-xs font-medium tracking-wide text-white/85 uppercase">
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>
        </div>
    );
}

function DesignPlaqueColor({ items, pencil, colors }) {
    return (
        <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
            {pencil}
            <div className="relative flex flex-col overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/30 sm:flex-row">
                {items.map((item, index) => (
                    <ColorPlaqueItem key={item.statKey} item={item} color={colors[index]} isLast={index === items.length - 1} />
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 2 — "Rubans": a colored circle on a stem, flowing into a folded- */
/* corner ribbon card that carries the number and label.                  */
/* ---------------------------------------------------------------------- */

function RibbonItem({ item, index, color }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="flex flex-col items-center text-center">
            <span
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 border-white text-white shadow-lg dark:border-slate-900 ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
                style={{ backgroundColor: color }}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-6 w-6" />
            </span>
            <span className="h-6 w-px bg-slate-300 dark:bg-white/20" aria-hidden="true" />
            <div
                className="relative w-full max-w-[220px] px-5 pt-7 pb-6 text-white shadow-xl"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 78%, 82% 100%, 0 100%)', borderRadius: '1rem', backgroundColor: color }}
            >
                <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-bold text-isstm-navy shadow">
                    {index + 1}
                </span>
                <p className="text-3xl leading-none font-extrabold">
                    +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
                </p>
                <p className="mt-2 text-xs font-medium tracking-wide text-white/85 uppercase">
                    <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
                </p>
            </div>
        </div>
    );
}

function DesignRibbons({ items, pencil, colors }) {
    return (
        <section className="relative bg-white py-16 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-5xl px-6">
                {pencil}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                    {items.map((item, index) => (
                        <RibbonItem key={item.statKey} item={item} index={index} color={colors[index]} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 3 — "Orbite": icon circles linked by a gradient thread, each     */
/* carrying a diamond pendant with the number.                            */
/* ---------------------------------------------------------------------- */

function OrbitItem({ item, color }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="relative flex flex-col items-center gap-3">
            <span
                className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white dark:ring-slate-900 ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
                style={{ backgroundColor: color }}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-7 w-7" />
            </span>
            <span
                className="flex h-14 w-14 rotate-45 items-center justify-center rounded-xl shadow-md"
                style={{ backgroundColor: color }}
            >
                <span className="-rotate-45 text-base font-extrabold text-white">
                    +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
                </span>
            </span>
            <p className="text-xs font-semibold tracking-wide uppercase dark:text-white/90" style={{ color }}>
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>
        </div>
    );
}

function DesignOrbit({ items, pencil, colors }) {
    return (
        <section className="relative bg-white py-16 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-5xl px-6">
                {pencil}
                <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                    <div
                        className="pointer-events-none absolute inset-x-12 top-8 hidden h-px opacity-60 sm:block"
                        style={{ backgroundImage: `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})` }}
                        aria-hidden="true"
                    />
                    {items.map((item, index) => (
                        <OrbitItem key={item.statKey} item={item} color={colors[index]} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 4 — "Perles": overlapping icon beads threaded above a row of     */
/* pointed tag cards.                                                      */
/* ---------------------------------------------------------------------- */

function BeadIcon({ item, color, index, total }) {
    const [ref, , active] = useRevealingCount(0);

    return (
        <span
            ref={ref}
            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white text-white shadow-lg dark:border-slate-900 ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
            style={{ zIndex: total - index, backgroundColor: color }}
        >
            <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-6 w-6" />
        </span>
    );
}

function BeadTag({ item, color }) {
    const [ref, value] = useRevealingCount(item.target);

    return (
        <div
            ref={ref}
            className="flex flex-col items-center px-4 pt-8 pb-5 text-center text-white shadow-lg"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)', backgroundColor: color }}
        >
            <p className="text-2xl leading-none font-extrabold">
                +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
            </p>
            <p className="mt-2 text-[0.7rem] font-medium tracking-wide text-white/85 uppercase">
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>
        </div>
    );
}

function DesignBeads({ items, pencil, colors }) {
    return (
        <section className="relative bg-white py-16 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-2xl px-6">
                {pencil}
                <div className="flex -space-x-3 [&>*]:relative">
                    {items.map((item, index) => (
                        <BeadIcon key={item.statKey} item={item} color={colors[index]} index={index} total={items.length} />
                    ))}
                </div>
                <div className="-mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {items.map((item, index) => (
                        <BeadTag key={item.statKey} item={item} color={colors[index]} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 5 — "Badges": rounded-square icon badges with a soft colored     */
/* glow bleeding beneath each one.                                        */
/* ---------------------------------------------------------------------- */

function BadgeItem({ item, color }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="relative flex flex-col items-center gap-3 text-center">
            <span
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl ${ICON_POP_CLASS} ${iconPopStyle(active)}`}
                style={{ backgroundColor: color }}
            >
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-7 w-7" />
            </span>
            <p className="text-3xl leading-none font-extrabold text-isstm-navy-dark dark:text-white">
                +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
            </p>
            <p className="text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-white/70">
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>
            <span
                className="pointer-events-none absolute -bottom-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: color }}
                aria-hidden="true"
            />
        </div>
    );
}

function DesignBadges({ items, pencil, colors }) {
    return (
        <section className="relative overflow-hidden bg-white py-16 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-5xl px-6">
                {pencil}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-4">
                    {items.map((item, index) => (
                        <BadgeItem key={item.statKey} item={item} color={colors[index]} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 9 — "Classique": the original design — 3 plain cards, small gold */
/* icon, bold number, light shadow.                                        */
/* ---------------------------------------------------------------------- */

function ClassicItem({ item }) {
    const [ref, value, active] = useRevealingCount(item.target);

    return (
        <div ref={ref} className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100 sm:p-5 dark:bg-slate-800 dark:ring-slate-700">
            <span className={`mx-auto inline-flex ${ICON_POP_CLASS} ${iconPopStyle(active)}`}>
                <EditableIcon contentKey={item.iconKey} value={item.iconValue} className="h-5 w-5 text-isstm-gold sm:h-6 sm:w-6" />
            </span>
            <p className="mt-1.5 text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                +<EditableText as="span" contentKey={item.statKey}>{String(value)}</EditableText>
            </p>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                <EditableText as="span" contentKey={item.labelKey}>{item.label}</EditableText>
            </p>
        </div>
    );
}

function DesignClassic({ items, pencil }) {
    return (
        <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
            {pencil}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {items.map((item) => (
                    <ClassicItem key={item.statKey} item={item} />
                ))}
            </div>
        </section>
    );
}

const DESIGNS = {
    1: DesignPlaque,
    2: DesignRibbons,
    3: DesignOrbit,
    4: DesignBeads,
    5: DesignBadges,
    6: DesignPlaqueGradient,
    7: DesignPlaqueOutline,
    8: DesignPlaqueColor,
    9: DesignClassic,
};

/* Tiny CSS mockups for the design-picker dialog — evoke each layout's
 * silhouette rather than literally rendering it. */
function PlaqueThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 rounded-lg bg-isstm-navy p-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-1 items-center gap-1 border-r border-white/15 pr-1.5 last:border-0">
                    <span className="h-3.5 w-3.5 flex-shrink-0 rounded-md bg-isstm-gold" />
                    <span className="h-1 w-full rounded-full bg-white/40" />
                </div>
            ))}
        </div>
    );
}

function RibbonsThumbnail() {
    return (
        <div className="flex h-full w-full items-end justify-center gap-1.5 p-2">
            {['bg-isstm-gold', 'bg-isstm-navy', 'bg-isstm-red'].map((color, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="h-0.5 w-px bg-slate-300" />
                    <span className={`h-7 w-full ${color} opacity-80`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }} />
                </div>
            ))}
        </div>
    );
}

function OrbitThumbnail() {
    return (
        <div className="flex h-full w-full items-start justify-center gap-2 p-2 pt-3">
            {['bg-isstm-gold', 'bg-isstm-navy', 'bg-isstm-red'].map((color, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className={`h-4 w-4 rounded-full ${color}`} />
                    <span className={`h-2.5 w-2.5 rotate-45 ${color} opacity-60`} />
                </div>
            ))}
        </div>
    );
}

function BeadsThumbnail() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2">
            <div className="flex -space-x-1.5">
                {['bg-isstm-gold', 'bg-isstm-navy', 'bg-isstm-red'].map((color, i) => (
                    <span key={i} className={`h-5 w-5 rounded-full border-2 border-white ${color}`} />
                ))}
            </div>
            <div className="flex w-full gap-1.5">
                {['bg-isstm-gold', 'bg-isstm-navy', 'bg-isstm-red'].map((color, i) => (
                    <span
                        key={i}
                        className={`h-4 flex-1 ${color} opacity-70`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' }}
                    />
                ))}
            </div>
        </div>
    );
}

function BadgesThumbnail() {
    return (
        <div className="flex h-full w-full items-center justify-center gap-1.5 p-2">
            {['bg-isstm-gold', 'bg-isstm-navy', 'bg-isstm-red'].map((color, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${color}`} />
                    <span className="h-1 w-full rounded-full bg-slate-300" />
                </div>
            ))}
        </div>
    );
}

function PlaqueGradientThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 rounded-lg bg-gradient-to-r from-isstm-navy to-isstm-gold p-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
                    <span className="h-1 w-full rounded-full bg-white/40" />
                </div>
            ))}
        </div>
    );
}

function PlaqueOutlineThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1 rounded-lg bg-white p-2">
            {['border-isstm-gold', 'border-isstm-navy', 'border-isstm-red'].map((border, i) => (
                <div key={i} className={`h-full flex-1 rounded-md border-2 ${border}`} />
            ))}
        </div>
    );
}

function PlaqueColorThumbnail() {
    return (
        <div className="flex h-full w-full overflow-hidden rounded-lg">
            {['bg-isstm-gold', 'bg-isstm-navy', 'bg-isstm-red'].map((color, i) => (
                <span key={i} className={`flex-1 ${color}`} />
            ))}
        </div>
    );
}

function ClassicThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-slate-100 p-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1 rounded-md bg-white p-1.5 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-isstm-gold" />
                    <span className="h-1.5 w-3/4 rounded-full bg-isstm-navy/70" />
                    <span className="h-1 w-full rounded-full bg-slate-300" />
                </div>
            ))}
        </div>
    );
}

const DESIGN_OPTIONS = [
    { value: '9', label: 'Classique', Thumbnail: ClassicThumbnail },
    { value: '1', label: 'Plaque', Thumbnail: PlaqueThumbnail },
    { value: '6', label: 'Plaque dégradée', Thumbnail: PlaqueGradientThumbnail },
    { value: '7', label: 'Plaque contour', Thumbnail: PlaqueOutlineThumbnail },
    { value: '8', label: 'Plaque couleur', Thumbnail: PlaqueColorThumbnail },
    { value: '2', label: 'Rubans', Thumbnail: RibbonsThumbnail },
    { value: '3', label: 'Orbite', Thumbnail: OrbitThumbnail },
    { value: '4', label: 'Perles', Thumbnail: BeadsThumbnail },
    { value: '5', label: 'Badges', Thumbnail: BadgesThumbnail },
];

export default function Stats({ content }) {
    const { contentStyles } = usePage().props;
    const design = contentStyles?.stat_design?.design ?? '1';
    const colors = contentStyles?.stat_design?.colors ?? DEFAULT_PALETTE;

    const items = [
        {
            iconKey: 'stat_students_icon',
            iconValue: content.stat_students_icon,
            statKey: 'stat_students',
            target: Number(content.stat_students ?? 0),
            labelKey: 'accueil_stat_etudiants_label',
            label: content.accueil_stat_etudiants_label,
        },
        {
            iconKey: 'stat_teachers_icon',
            iconValue: content.stat_teachers_icon,
            statKey: 'stat_teachers',
            target: Number(content.stat_teachers ?? 0),
            labelKey: 'accueil_stat_enseignants_label',
            label: content.accueil_stat_enseignants_label,
        },
        {
            iconKey: 'stat_majors_icon',
            iconValue: content.stat_majors_icon,
            statKey: 'stat_majors',
            target: Number(content.stat_majors ?? 0),
            labelKey: 'accueil_stat_filieres_label',
            label: content.accueil_stat_filieres_label,
        },
    ];

    const DesignComponent = DESIGNS[design] ?? DesignPlaque;
    const pencil = (
        <EditableDesignPicker
            contentKey="stat_design"
            title="Design des statistiques"
            description="Choisissez l'apparence du bloc statistiques affiché sous l'accueil."
            designs={DESIGN_OPTIONS}
            className="absolute top-2 right-2 z-40 sm:top-4 sm:right-4"
            colorizable
            colorLabels={PALETTE_LABELS}
            defaultColors={DEFAULT_PALETTE}
        />
    );

    return <DesignComponent items={items} pencil={pencil} colors={colors} />;
}
