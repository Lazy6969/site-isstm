import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';
import { imageStyleToCss } from '../../lib/imageStyle';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';
import EditableButton from '../QuickEdit/EditableButton';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';

/* ---------------------------------------------------------------------- */
/* Design 1 — "Carrousel": sliding book-like panel, auto-rotating.         */
/* ---------------------------------------------------------------------- */

function DesignCarousel({ blocks, contentStyles, t, pencil }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    function restartAuto() {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % blocks.length), 6000);
    }

    useEffect(() => {
        restartAuto();
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function goTo(index) {
        setCurrent(index);
        restartAuto();
    }

    return (
        <section className="relative bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="relative mx-auto max-w-6xl px-6">
                {pencil}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl dark:bg-slate-800">
                    <div className="relative min-h-[600px] sm:min-h-[520px] md:min-h-[420px]">
                        {blocks.map((block, index) => {
                            const active = index === current;

                            return (
                                <div
                                    key={block.title}
                                    aria-hidden={!active}
                                    className={`absolute inset-0 z-20 flex flex-col transition-transform duration-700 ease-in-out md:grid md:grid-cols-2 ${
                                        active
                                            ? 'translate-x-0'
                                            : `pointer-events-none ${block.reverse ? 'translate-x-full' : '-translate-x-full'}`
                                    }`}
                                >
                                    <div
                                        className={`relative z-20 flex flex-col justify-center bg-isstm-navy px-8 py-14 sm:px-12 sm:py-20 ${
                                            block.reverse ? 'md:order-2' : ''
                                        }`}
                                    >
                                        <h3 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                                            <EditableText as="span" contentKey={block.titleKey}>
                                                {block.title}
                                            </EditableText>
                                        </h3>

                                        <EditableText
                                            as="p"
                                            contentKey={block.contentKey}
                                            className="mt-5 max-w-md leading-relaxed text-white/80"
                                        >
                                            {block.text}
                                        </EditableText>

                                        <EditableButton
                                            contentKey="mission_vision_bouton"
                                            href="/historique"
                                            defaultLabel={t('filieres.en_savoir_plus', 'En savoir plus')}
                                            className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-isstm-navy transition hover:brightness-95"
                                        />
                                    </div>

                                    <div
                                        className={`relative z-0 min-h-[220px] flex-1 md:h-auto md:min-h-0 ${block.reverse ? 'md:order-1' : ''}`}
                                    >
                                        <img
                                            src={`/${block.image}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                            style={imageStyleToCss(contentStyles?.[block.imageKey])}
                                        />
                                        {active && <EditableImage contentKey={block.imageKey} value={block.image} />}
                                    </div>

                                    {/* Beveled seam between the text panel and the image, simulating
                                        a raised ridge (light core, dark edges either side). Lives
                                        inside the sliding block itself (not a separate overlay) so it
                                        rides the same translate-x transition instead of sitting still
                                        while the panels slide underneath it. */}
                                    <div
                                        className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-6 -translate-x-1/2 md:block"
                                        style={{
                                            background:
                                                'linear-gradient(to right, rgba(0,0,0,0.38) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.12) 60%, rgba(0,0,0,0.3) 100%)',
                                            boxShadow: '3px 0 10px rgba(0,0,0,0.25), -3px 0 10px rgba(0,0,0,0.2)',
                                        }}
                                        aria-hidden="true"
                                    />
                                </div>
                            );
                        })}

                        <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2 md:bottom-6">
                            {blocks.map((b, i) => (
                                <button
                                    key={b.title}
                                    type="button"
                                    onClick={() => goTo(i)}
                                    aria-label={b.title}
                                    className={`h-2 rounded-full shadow transition-all ${
                                        i === current ? 'w-8 bg-isstm-gold' : 'w-2 bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 2 — "Côte à côte": both Mission and Vision shown at once, as two */
/* static cards.                                                           */
/* ---------------------------------------------------------------------- */

function SplitCard({ block, contentStyles, t }) {
    return (
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-slate-800">
            <div className="relative h-48 sm:h-56">
                <img
                    src={`/${block.image}`}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    style={imageStyleToCss(contentStyles?.[block.imageKey])}
                />
                <EditableImage contentKey={block.imageKey} value={block.image} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-isstm-navy-dark/70 to-transparent" aria-hidden="true" />
            </div>
            <div className="p-7 sm:p-8">
                <h3 className="text-2xl font-extrabold text-isstm-navy sm:text-3xl dark:text-white">
                    <EditableText as="span" contentKey={block.titleKey}>
                        {block.title}
                    </EditableText>
                </h3>
                <EditableText as="p" contentKey={block.contentKey} className="mt-4 leading-relaxed text-slate-600 dark:text-white/70">
                    {block.text}
                </EditableText>
                <EditableButton
                    contentKey="mission_vision_bouton"
                    href="/historique"
                    defaultLabel={t('filieres.en_savoir_plus', 'En savoir plus')}
                    className="mt-6 inline-flex w-fit items-center rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                />
            </div>
        </div>
    );
}

function DesignSplit({ blocks, contentStyles, t, pencil }) {
    return (
        <section className="relative bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="relative mx-auto max-w-6xl px-6">
                {pencil}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {blocks.map((block) => (
                        <SplitCard key={block.title} block={block} contentStyles={contentStyles} t={t} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 3 — "Onglets": the same text/image split as the carousel, but    */
/* switched by hand via pill tabs, crossfading instead of sliding — no     */
/* autoplay.                                                                */
/* ---------------------------------------------------------------------- */

function DesignTabs({ blocks, contentStyles, t, pencil }) {
    const [current, setCurrent] = useState(0);

    return (
        <section className="relative bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="relative mx-auto max-w-6xl px-6">
                {pencil}
                <div className="mb-6 flex justify-center gap-2">
                    {blocks.map((b, i) => (
                        <button
                            key={b.title}
                            type="button"
                            onClick={() => setCurrent(i)}
                            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                i === current
                                    ? 'bg-isstm-navy text-white shadow'
                                    : 'bg-white text-isstm-navy hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                            }`}
                        >
                            {b.title}
                        </button>
                    ))}
                </div>

                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl dark:bg-slate-800">
                    <div className="relative min-h-[560px] sm:min-h-[480px] md:min-h-[400px]">
                        {blocks.map((block, index) => {
                            const active = index === current;

                            return (
                                <div
                                    key={block.title}
                                    aria-hidden={!active}
                                    className={`absolute inset-0 flex flex-col transition-all duration-500 ease-out md:grid md:grid-cols-2 ${
                                        active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
                                    }`}
                                >
                                    <div
                                        className={`relative z-20 flex flex-col justify-center bg-isstm-navy px-8 py-14 sm:px-12 sm:py-20 ${
                                            block.reverse ? 'md:order-2' : ''
                                        }`}
                                    >
                                        <h3 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                                            <EditableText as="span" contentKey={block.titleKey}>
                                                {block.title}
                                            </EditableText>
                                        </h3>

                                        <EditableText
                                            as="p"
                                            contentKey={block.contentKey}
                                            className="mt-5 max-w-md leading-relaxed text-white/80"
                                        >
                                            {block.text}
                                        </EditableText>

                                        <EditableButton
                                            contentKey="mission_vision_bouton"
                                            href="/historique"
                                            defaultLabel={t('filieres.en_savoir_plus', 'En savoir plus')}
                                            className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-isstm-navy transition hover:brightness-95"
                                        />
                                    </div>

                                    <div
                                        className={`relative z-0 min-h-[220px] flex-1 md:h-auto md:min-h-0 ${block.reverse ? 'md:order-1' : ''}`}
                                    >
                                        <img
                                            src={`/${block.image}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                            style={imageStyleToCss(contentStyles?.[block.imageKey])}
                                        />
                                        {active && <EditableImage contentKey={block.imageKey} value={block.image} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 4 — "Cartes qui se retournent": Mission and Vision as two cards  */
/* that flip in place to reveal their text, each independently.            */
/* ---------------------------------------------------------------------- */

function FlipCard({ block, flipped, onFlip, contentStyles, t }) {
    return (
        <div className="[perspective:1600px]">
            <div
                className="relative h-80 w-full transition-transform duration-700 ease-out sm:h-96"
                style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
            >
                <div
                    className="absolute inset-0 overflow-hidden rounded-3xl shadow-xl"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <img
                        src={`/${block.image}`}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        style={imageStyleToCss(contentStyles?.[block.imageKey])}
                    />
                    <EditableImage contentKey={block.imageKey} value={block.image} />
                    <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-isstm-navy-dark/90 via-isstm-navy-dark/10 to-transparent"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-2xl font-extrabold text-white">
                            <EditableText as="span" contentKey={block.titleKey}>
                                {block.title}
                            </EditableText>
                        </h3>
                        <span className="mt-2 inline-block text-xs font-semibold tracking-wide text-white/70 uppercase">
                            Cliquez pour en savoir plus
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onFlip}
                        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-isstm-navy shadow transition hover:scale-110"
                        aria-label={`Découvrir : ${block.title}`}
                    >
                        <RotateCw className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <div
                    className="absolute inset-0 flex flex-col justify-center rounded-3xl bg-isstm-navy p-7 shadow-xl sm:p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <h3 className="text-2xl font-extrabold text-white">{block.title}</h3>
                    <EditableText
                        as="p"
                        contentKey={block.contentKey}
                        className="mt-4 max-h-44 overflow-y-auto text-sm leading-relaxed text-white/80"
                    >
                        {block.text}
                    </EditableText>
                    <EditableButton
                        contentKey="mission_vision_bouton"
                        href="/historique"
                        defaultLabel={t('filieres.en_savoir_plus', 'En savoir plus')}
                        className="mt-6 inline-flex w-fit items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-isstm-navy transition hover:brightness-95"
                    />
                    <button
                        type="button"
                        onClick={onFlip}
                        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white shadow transition hover:scale-110"
                        aria-label={`Revenir : ${block.title}`}
                    >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function DesignFlip({ blocks, contentStyles, t, pencil }) {
    const [flipped, setFlipped] = useState({});

    return (
        <section className="relative bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="relative mx-auto max-w-6xl px-6">
                {pencil}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {blocks.map((block, index) => (
                        <FlipCard
                            key={block.title}
                            block={block}
                            flipped={!!flipped[index]}
                            onFlip={() => setFlipped((f) => ({ ...f, [index]: !f[index] }))}
                            contentStyles={contentStyles}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 5 — "Chronologie": Mission and Vision stacked as two alternating */
/* editorial bands, both always visible.                                   */
/* ---------------------------------------------------------------------- */

function TimelineBlock({ block, contentStyles, t, index }) {
    return (
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className={`relative overflow-hidden rounded-3xl shadow-xl ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <img
                    src={`/${block.image}`}
                    alt=""
                    className="h-64 w-full object-cover sm:h-80"
                    loading="lazy"
                    style={imageStyleToCss(contentStyles?.[block.imageKey])}
                />
                <EditableImage contentKey={block.imageKey} value={block.image} />
            </div>
            <div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-isstm-gold text-sm font-bold text-isstm-navy-dark">
                    {index + 1}
                </span>
                <h3 className="mt-4 text-3xl font-extrabold text-isstm-navy sm:text-4xl dark:text-white">
                    <EditableText as="span" contentKey={block.titleKey}>
                        {block.title}
                    </EditableText>
                </h3>
                <EditableText as="p" contentKey={block.contentKey} className="mt-4 max-w-lg leading-relaxed text-slate-600 dark:text-white/70">
                    {block.text}
                </EditableText>
                <EditableButton
                    contentKey="mission_vision_bouton"
                    href="/historique"
                    defaultLabel={t('filieres.en_savoir_plus', 'En savoir plus')}
                    className="mt-6 inline-flex w-fit items-center rounded-full bg-isstm-navy px-7 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                />
            </div>
        </div>
    );
}

function DesignTimeline({ blocks, contentStyles, t, pencil }) {
    return (
        <section className="relative bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="relative mx-auto max-w-6xl px-6">
                {pencil}
                <div className="space-y-16 sm:space-y-20">
                    {blocks.map((block, index) => (
                        <TimelineBlock key={block.title} block={block} contentStyles={contentStyles} t={t} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

const DESIGNS = {
    1: DesignCarousel,
    2: DesignSplit,
    3: DesignTabs,
    4: DesignFlip,
    5: DesignTimeline,
};

/* Tiny CSS mockups for the design-picker dialog. */
function CarouselThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1 rounded-lg bg-isstm-navy p-2">
            <div className="flex-1 space-y-1">
                <span className="block h-1.5 w-3/4 rounded-full bg-white/50" />
                <span className="block h-1 w-full rounded-full bg-white/30" />
            </div>
            <span className="h-full w-1/2 rounded-md bg-isstm-gold/70" />
        </div>
    );
}

function SplitThumbnail() {
    return (
        <div className="flex h-full w-full gap-1.5 p-2">
            {['bg-isstm-navy', 'bg-isstm-gold'].map((color) => (
                <div key={color} className="flex-1 overflow-hidden rounded-md bg-slate-200">
                    <span className={`block h-1/2 w-full ${color}`} />
                </div>
            ))}
        </div>
    );
}

function TabsThumbnail() {
    return (
        <div className="flex h-full w-full flex-col items-center gap-1.5 p-2">
            <div className="flex gap-1">
                <span className="h-2 w-5 rounded-full bg-isstm-navy" />
                <span className="h-2 w-5 rounded-full bg-slate-300" />
            </div>
            <span className="h-8 w-full rounded-md bg-slate-200" />
        </div>
    );
}

function FlipThumbnail() {
    return (
        <div className="flex h-full w-full items-center justify-center gap-1.5 p-2">
            <span className="relative h-full flex-1 rounded-md bg-isstm-navy">
                <RotateCw className="absolute top-1 right-1 h-2.5 w-2.5 text-white/80" aria-hidden="true" />
            </span>
            <span className="h-full flex-1 rounded-md bg-isstm-gold" />
        </div>
    );
}

function TimelineThumbnail() {
    return (
        <div className="flex h-full w-full flex-col justify-center gap-1.5 p-2">
            <div className="flex items-center gap-1">
                <span className="h-3 w-5 rounded bg-isstm-navy" />
                <span className="h-1 flex-1 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center gap-1">
                <span className="h-1 flex-1 rounded-full bg-slate-300" />
                <span className="h-3 w-5 rounded bg-isstm-gold" />
            </div>
        </div>
    );
}

const DESIGN_OPTIONS = [
    { value: '1', label: 'Carrousel', Thumbnail: CarouselThumbnail },
    { value: '2', label: 'Côte à côte', Thumbnail: SplitThumbnail },
    { value: '3', label: 'Onglets', Thumbnail: TabsThumbnail },
    { value: '4', label: 'Cartes', Thumbnail: FlipThumbnail },
    { value: '5', label: 'Chronologie', Thumbnail: TimelineThumbnail },
];

export default function MissionVision({ content }) {
    const { t } = useTranslations();
    const { contentStyles } = usePage().props;
    const design = contentStyles?.mission_vision_design?.design ?? '1';

    const blocks = [
        {
            title: content.mission_titre,
            titleKey: 'mission_titre',
            text: content.mission_contenu,
            contentKey: 'mission_contenu',
            image: content.mission_image_path ?? 'images/mission.jpg',
            imageKey: 'mission_image_path',
            reverse: false,
        },
        {
            title: content.vision_titre,
            titleKey: 'vision_titre',
            text: content.vision_contenu,
            contentKey: 'vision_contenu',
            image: content.vision_image_path ?? 'images/vision.jpg',
            imageKey: 'vision_image_path',
            reverse: true,
        },
    ];

    const DesignComponent = DESIGNS[design] ?? DesignCarousel;
    const pencil = (
        <EditableDesignPicker
            contentKey="mission_vision_design"
            title="Design mission et vision"
            description="Choisissez la mise en forme du bloc Mission & Vision affiché sur l'accueil."
            designs={DESIGN_OPTIONS}
            className="absolute top-2 right-2 z-40 sm:top-4 sm:right-4"
        />
    );

    return <DesignComponent blocks={blocks} contentStyles={contentStyles} t={t} pencil={pencil} />;
}
