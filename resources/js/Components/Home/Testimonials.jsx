import { Quote } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../QuickEdit/EditableText';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';
import AbstractWaves from '../Layout/AbstractWaves';
import TitleUnderline from '../Layout/TitleUnderline';

const BG_TINTS = ['#fbf3e3', '#e6ecf2', '#e3f9ec', '#f1e6f7'];

function SectionTitle({ content, pencil }) {
    return (
        <>
            {pencil}
            <div className="mb-10 flex flex-col items-center sm:mb-12">
                <h2 className="text-center text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                    <EditableText as="span" contentKey="accueil_temoignages_titre">
                        {content.accueil_temoignages_titre}
                    </EditableText>
                </h2>
                <TitleUnderline />
            </div>
        </>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 1 — "Carrousel": the original design — a blob-shaped panel with  */
/* a stacked 3D photo deck.                                                */
/* ---------------------------------------------------------------------- */

function DesignCarousel({ d }) {
    const { testimonials, current, goTo, total, content, t, pencil } = d;

    return (
        <section id="temoignages" className="relative overflow-hidden bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
            <AbstractWaves />
            <div className="relative z-10 mx-auto max-w-4xl px-6">
                <SectionTitle content={content} pencil={pencil} />

                <div
                    className="relative flex flex-col items-center gap-6 rounded-3xl px-6 py-10 transition-colors duration-700 sm:flex-row sm:gap-14 sm:rounded-[63%_37%_41%_59%/47%_60%_40%_53%] sm:px-16 sm:py-14"
                    style={{ backgroundColor: BG_TINTS[current % BG_TINTS.length] }}
                >
                    <div className="relative z-20 h-40 w-40 flex-shrink-0 sm:h-56 sm:w-56" style={{ perspective: '1400px' }}>
                        {testimonials.map((testimonial, index) => {
                            const dist = (index - current + total) % total;
                            if (dist > 2) return null;

                            const styles = [
                                { transform: 'translate(0, 0) rotateY(0deg) scale(1)', opacity: 1, zIndex: 5 },
                                { transform: 'translate(28px, -22px) rotateY(20deg) scale(0.88)', opacity: 0.9, zIndex: 4 },
                                { transform: 'translate(50px, -36px) rotateY(30deg) scale(0.78)', opacity: 0.55, zIndex: 3 },
                            ][dist];

                            return (
                                <div
                                    key={testimonial.author_name}
                                    className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl transition-[transform,opacity] duration-700"
                                    style={{ ...styles, transformStyle: 'preserve-3d' }}
                                >
                                    <img
                                        src={`/${testimonial.image_path}`}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative min-h-[10rem] flex-1 text-center sm:min-h-[9rem] sm:text-left">
                        <Quote className="mx-auto mb-2.5 h-7 w-7 text-isstm-gold/60 sm:mx-0 sm:h-8 sm:w-8" aria-hidden="true" />
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.author_name}
                                className={`transition-[opacity,transform] duration-700 ${
                                    index === current
                                        ? 'relative translate-x-0 opacity-100'
                                        : 'pointer-events-none absolute inset-x-0 top-0 translate-x-4 opacity-0'
                                }`}
                            >
                                <blockquote className="font-serif text-base italic leading-relaxed text-isstm-navy sm:text-xl">
                                    {testimonial.quote}
                                </blockquote>
                                <p className="mt-4 text-base font-bold text-isstm-navy sm:text-lg">{testimonial.author_name}</p>
                                <p className="text-sm text-slate-500">{testimonial.program}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {total > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {testimonials.map((testimonial, index) => (
                            <button
                                key={testimonial.author_name}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`${t('accueil.temoignage_numero', 'Témoignage')} ${index + 1}`}
                                className={`h-2.5 rounded-full transition-all ${
                                    index === current ? 'w-8 bg-isstm-navy' : 'w-2.5 bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 2 — "Grille": every testimonial shown at once as a simple card.  */
/* ---------------------------------------------------------------------- */

function DesignGrid({ d }) {
    const { testimonials, content, pencil } = d;

    return (
        <section id="temoignages" className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-6xl px-6">
                <SectionTitle content={content} pencil={pencil} />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.author_name}
                            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700"
                        >
                            <Quote className="h-6 w-6 text-isstm-gold/60" aria-hidden="true" />
                            <blockquote className="mt-3 flex-1 font-serif text-sm leading-relaxed text-isstm-navy italic dark:text-white">
                                {testimonial.quote}
                            </blockquote>
                            <div className="mt-4 flex items-center gap-3">
                                <img
                                    src={`/${testimonial.image_path}`}
                                    alt=""
                                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                    loading="lazy"
                                />
                                <div>
                                    <p className="text-sm font-bold text-isstm-navy dark:text-white">{testimonial.author_name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.program}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 3 — "Minimal": a single large centered quote, small avatar.      */
/* ---------------------------------------------------------------------- */

function DesignMinimal({ d }) {
    const { testimonials, current, goTo, total, content, t, pencil } = d;
    const testimonial = testimonials[current];

    return (
        <section id="temoignages" className="bg-white py-12 sm:py-20 dark:bg-slate-950">
            <div className="relative mx-auto max-w-2xl px-6 text-center">
                <SectionTitle content={content} pencil={pencil} />

                <img
                    src={`/${testimonial.image_path}`}
                    alt=""
                    className="mx-auto h-16 w-16 rounded-full object-cover shadow"
                    loading="eager"
                />
                <Quote className="mx-auto mt-4 h-6 w-6 text-isstm-gold/60" aria-hidden="true" />
                <blockquote className="mt-2 font-serif text-lg leading-relaxed text-isstm-navy italic sm:text-xl dark:text-white">
                    {testimonial.quote}
                </blockquote>
                <p className="mt-4 text-sm font-bold text-isstm-navy dark:text-white">{testimonial.author_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.program}</p>

                {total > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {testimonials.map((item, index) => (
                            <button
                                key={item.author_name}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`${t('accueil.temoignage_numero', 'Témoignage')} ${index + 1}`}
                                className={`h-2 rounded-full transition-all ${
                                    index === current ? 'w-6 bg-isstm-navy dark:bg-white' : 'w-2 bg-slate-300 dark:bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 4 — "Rail": a row of clickable avatars above one large quote     */
/* panel.                                                                   */
/* ---------------------------------------------------------------------- */

function DesignRail({ d }) {
    const { testimonials, current, goTo, content, pencil } = d;
    const testimonial = testimonials[current];

    return (
        <section id="temoignages" className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-3xl px-6 text-center">
                <SectionTitle content={content} pencil={pencil} />

                <div className="flex flex-wrap justify-center gap-3">
                    {testimonials.map((item, index) => (
                        <button
                            key={item.author_name}
                            type="button"
                            onClick={() => goTo(index)}
                            aria-label={item.author_name}
                            className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 transition ${
                                index === current ? 'scale-110 ring-isstm-gold' : 'opacity-60 ring-transparent'
                            }`}
                        >
                            <img src={`/${item.image_path}`} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                    ))}
                </div>

                <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                    <Quote className="mx-auto h-7 w-7 text-isstm-gold/60" aria-hidden="true" />
                    <blockquote className="mt-3 font-serif text-lg leading-relaxed text-isstm-navy italic dark:text-white">
                        {testimonial.quote}
                    </blockquote>
                    <p className="mt-4 text-sm font-bold text-isstm-navy dark:text-white">{testimonial.author_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.program}</p>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 5 — "Scindé": a photo filling one half, quote filling the other. */
/* ---------------------------------------------------------------------- */

function DesignSplit({ d }) {
    const { testimonials, current, goTo, total, content, t, pencil } = d;
    const testimonial = testimonials[current];

    return (
        <section id="temoignages" className="bg-white dark:bg-slate-950">
            <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-20">
                <SectionTitle content={content} pencil={pencil} />

                <div className="grid grid-cols-1 overflow-hidden rounded-3xl shadow-xl sm:grid-cols-2">
                    <div className="relative h-64 sm:h-auto">
                        <img src={`/${testimonial.image_path}`} alt="" className="h-full w-full object-cover" loading="eager" />
                    </div>
                    <div className="flex flex-col justify-center bg-isstm-navy p-8 text-white sm:p-10">
                        <Quote className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                        <blockquote className="mt-3 font-serif text-lg leading-relaxed italic sm:text-xl">{testimonial.quote}</blockquote>
                        <p className="mt-5 text-sm font-bold">{testimonial.author_name}</p>
                        <p className="text-xs text-white/70">{testimonial.program}</p>

                        {total > 1 && (
                            <div className="mt-6 flex gap-2">
                                {testimonials.map((item, index) => (
                                    <button
                                        key={item.author_name}
                                        type="button"
                                        onClick={() => goTo(index)}
                                        aria-label={`${t('accueil.temoignage_numero', 'Témoignage')} ${index + 1}`}
                                        className={`h-2 rounded-full transition-all ${
                                            index === current ? 'w-6 bg-isstm-gold' : 'w-2 bg-white/30'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

const DESIGNS = {
    1: DesignCarousel,
    2: DesignGrid,
    3: DesignMinimal,
    4: DesignRail,
    5: DesignSplit,
};

/* Tiny CSS mockups for the design-picker dialog. */
function CarouselThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-[#fbf3e3] p-2">
            <span className="h-full w-1/3 flex-shrink-0 rounded-full bg-isstm-navy/30" />
            <div className="flex-1 space-y-1">
                <span className="block h-1 w-full rounded-full bg-isstm-navy/60" />
                <span className="block h-1 w-3/4 rounded-full bg-slate-400" />
            </div>
        </div>
    );
}

function GridThumbnail() {
    return (
        <div className="grid h-full w-full grid-cols-2 gap-1 bg-slate-100 p-2">
            {[0, 1, 2, 3].map((i) => (
                <span key={i} className="rounded-sm bg-white shadow-sm" />
            ))}
        </div>
    );
}

function MinimalThumbnail() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-white p-2">
            <span className="h-3 w-3 rounded-full bg-isstm-gold/60" />
            <span className="h-1 w-3/4 rounded-full bg-isstm-navy/60" />
            <span className="h-1 w-1/2 rounded-full bg-slate-300" />
        </div>
    );
}

function RailThumbnail() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-slate-100 p-2">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <span key={i} className={`h-2.5 w-2.5 rounded-full ${i === 1 ? 'bg-isstm-gold' : 'bg-isstm-navy/30'}`} />
                ))}
            </div>
            <span className="h-5 w-full rounded-md bg-white shadow-sm" />
        </div>
    );
}

function SplitThumbnail() {
    return (
        <div className="flex h-full w-full overflow-hidden rounded-md">
            <span className="h-full flex-1 bg-isstm-gold/40" />
            <span className="h-full flex-1 bg-isstm-navy" />
        </div>
    );
}

const DESIGN_OPTIONS = [
    { value: '1', label: 'Carrousel', Thumbnail: CarouselThumbnail },
    { value: '2', label: 'Grille', Thumbnail: GridThumbnail },
    { value: '3', label: 'Minimal', Thumbnail: MinimalThumbnail },
    { value: '4', label: 'Rangée', Thumbnail: RailThumbnail },
    { value: '5', label: 'Scindé', Thumbnail: SplitThumbnail },
];

export default function Testimonials({ testimonials }) {
    const { t } = useTranslations();
    const { content, contentStyles } = usePage().props;
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);
    const total = testimonials.length;

    function restartAuto() {
        clearInterval(timerRef.current);
        if (total > 1) {
            timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 5000);
        }
    }

    useEffect(() => {
        restartAuto();
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total]);

    if (total === 0) return null;

    function goTo(index) {
        setCurrent(index);
        restartAuto();
    }

    const design = contentStyles?.temoignages_design?.design ?? '1';
    const DesignComponent = DESIGNS[design] ?? DesignCarousel;
    const pencil = (
        <EditableDesignPicker
            contentKey="temoignages_design"
            title="Design des témoignages"
            description="Choisissez la mise en forme des témoignages affichés sur l'accueil."
            designs={DESIGN_OPTIONS}
            className="absolute top-0 right-0 z-40"
        />
    );

    const d = { testimonials, current, goTo, total, content, t, pencil };

    return <DesignComponent d={d} />;
}
