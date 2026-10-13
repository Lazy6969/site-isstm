import { usePage } from '@inertiajs/react';
import { ArrowRight, Paperclip, Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';
import { imageStyleToCss } from '../../lib/imageStyle';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';
import EditableButton from '../QuickEdit/EditableButton';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';
import AbstractWaves from '../Layout/AbstractWaves';

function useRevealOnView() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.3 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, visible];
}

/* ---------------------------------------------------------------------- */
/* Design 1 — "Portrait": the original design — offset gold-framed photo    */
/* on the left, quote on the right.                                        */
/* ---------------------------------------------------------------------- */

function DesignPortrait({ d, pencil }) {
    const [imgRef, visible] = useRevealOnView();

    return (
        <section className="relative overflow-hidden bg-white px-6 py-12 sm:py-20 dark:bg-slate-950">
            <AbstractWaves />
            <div className="relative z-10 mx-auto max-w-6xl">
                {pencil}
                <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[220px_1fr]">
                    <div className="relative mx-auto h-44 w-44 md:h-52 md:w-52" ref={imgRef}>
                        <div
                            aria-hidden="true"
                            className={`absolute -top-3 -left-3 h-full w-full rounded-2xl border-2 border-isstm-gold transition-all duration-700 ease-out ${
                                visible ? 'translate-0 opacity-100' : 'translate-x-2 translate-y-2 opacity-0'
                            }`}
                        />
                        <img
                            src={`/${d.image}`}
                            alt={d.t('accueil.directeur_photo_alt', "Photo du Directeur de l'ISSTM")}
                            className={`relative h-full w-full rounded-2xl object-cover shadow-xl ring-1 ring-black/5 transition-all duration-700 ease-out dark:ring-white/10 ${
                                visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                            }`}
                            loading="lazy"
                            style={imageStyleToCss(d.contentStyles?.directeur_image_path, { includeOpacity: false })}
                        />
                        <EditableImage contentKey="directeur_image_path" value={d.image} />
                        <p className="mt-3 text-center text-xs font-semibold tracking-wide text-isstm-gold uppercase">
                            <EditableText as="span" contentKey="directeur_fonction">
                                {d.fonction}
                            </EditableText>
                        </p>
                    </div>

                    <div className="w-full min-w-0">
                        <h2 className="text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                            <EditableText as="span" contentKey="accueil_mot_directeur_titre">
                                {d.titre}
                            </EditableText>
                        </h2>

                        <blockquote className="mt-3 flex gap-2.5 text-sm leading-relaxed text-slate-600 italic dark:text-slate-300">
                            <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                            <EditableText as="span" contentKey="mot_directeur_contenu" className="line-clamp-3">
                                {d.contenu}
                            </EditableText>
                        </blockquote>

                        <p className="mt-4 text-sm font-semibold text-isstm-navy dark:text-white">
                            <EditableText as="span" contentKey="directeur_nom">
                                {d.nom}
                            </EditableText>
                            <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">
                                <EditableText as="span" contentKey="directeur_fonction">
                                    {d.fonction}
                                </EditableText>
                            </span>
                        </p>

                        <EditableButton
                            contentKey="directeur_bouton"
                            href="/mot-du-directeur"
                            defaultLabel={d.t('accueil.lire_la_suite', 'Lire la suite')}
                            icon={ArrowRight}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:text-isstm-gold dark:text-white"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 2 — "Carte": a centered bio card, circular photo on top.         */
/* ---------------------------------------------------------------------- */

function DesignCard({ d, pencil }) {
    const [imgRef, visible] = useRevealOnView();

    return (
        <section className="relative bg-slate-50 px-6 py-14 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto max-w-2xl text-center">
                {pencil}
                <div className="relative mx-auto h-28 w-28" ref={imgRef}>
                    <img
                        src={`/${d.image}`}
                        alt={d.t('accueil.directeur_photo_alt', "Photo du Directeur de l'ISSTM")}
                        className={`h-full w-full rounded-full object-cover shadow-xl ring-4 ring-white transition-all duration-700 dark:ring-slate-800 ${
                            visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                        }`}
                        loading="lazy"
                        style={imageStyleToCss(d.contentStyles?.directeur_image_path, { includeOpacity: false })}
                    />
                    <EditableImage contentKey="directeur_image_path" value={d.image} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                    <EditableText as="span" contentKey="accueil_mot_directeur_titre">
                        {d.titre}
                    </EditableText>
                </h2>

                <Quote className="mx-auto mt-4 h-6 w-6 text-isstm-gold/70" aria-hidden="true" />
                <blockquote className="mt-2 text-base leading-relaxed text-slate-600 italic dark:text-slate-300">
                    <EditableText as="span" contentKey="mot_directeur_contenu" className="line-clamp-4">
                        {d.contenu}
                    </EditableText>
                </blockquote>

                <p className="mt-5 text-sm font-semibold text-isstm-navy dark:text-white">
                    <EditableText as="span" contentKey="directeur_nom">
                        {d.nom}
                    </EditableText>
                </p>
                <p className="text-xs font-medium tracking-wide text-isstm-gold uppercase">
                    <EditableText as="span" contentKey="directeur_fonction">
                        {d.fonction}
                    </EditableText>
                </p>

                <div className="mt-5 flex justify-center">
                    <EditableButton
                        contentKey="directeur_bouton"
                        href="/mot-du-directeur"
                        defaultLabel={d.t('accueil.lire_la_suite', 'Lire la suite')}
                        icon={ArrowRight}
                        className="inline-flex items-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                    />
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 3 — "Citation": a large pull-quote with a faint background       */
/* quote mark, the photo reduced to a small badge.                         */
/* ---------------------------------------------------------------------- */

function DesignQuote({ d, pencil }) {
    return (
        <section className="relative overflow-hidden bg-white px-6 py-14 sm:py-20 dark:bg-slate-950">
            <span
                className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-serif text-[10rem] leading-none text-slate-100 select-none sm:text-[14rem] dark:text-slate-900"
                aria-hidden="true"
            >
                &rdquo;
            </span>
            <div className="relative mx-auto max-w-3xl text-center">
                {pencil}
                <p className="text-xs font-semibold tracking-[0.2em] text-isstm-gold uppercase">
                    <EditableText as="span" contentKey="accueil_mot_directeur_titre">
                        {d.titre}
                    </EditableText>
                </p>

                <blockquote className="font-playfair mt-4 text-xl leading-snug text-isstm-navy italic sm:text-3xl dark:text-white">
                    <EditableText as="span" contentKey="mot_directeur_contenu" className="line-clamp-5">
                        {d.contenu}
                    </EditableText>
                </blockquote>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0">
                        <img
                            src={`/${d.image}`}
                            alt=""
                            className="h-full w-full rounded-full object-cover shadow"
                            loading="lazy"
                            style={imageStyleToCss(d.contentStyles?.directeur_image_path, { includeOpacity: false })}
                        />
                        <EditableImage contentKey="directeur_image_path" value={d.image} className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-isstm-navy dark:text-white">
                            <EditableText as="span" contentKey="directeur_nom">
                                {d.nom}
                            </EditableText>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            <EditableText as="span" contentKey="directeur_fonction">
                                {d.fonction}
                            </EditableText>
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <EditableButton
                        contentKey="directeur_bouton"
                        href="/mot-du-directeur"
                        defaultLabel={d.t('accueil.lire_la_suite', 'Lire la suite')}
                        icon={ArrowRight}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:text-isstm-gold dark:text-white"
                    />
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 4 — "Bandeau": a full navy band, large photo on the right, white */
/* text on the left.                                                       */
/* ---------------------------------------------------------------------- */

function DesignBand({ d, pencil }) {
    return (
        <section className="relative overflow-hidden bg-isstm-navy px-6 py-14 text-white sm:py-20">
            <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-[1fr_260px]">
                {pencil}
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-isstm-gold uppercase">
                        <EditableText as="span" contentKey="accueil_mot_directeur_titre">
                            {d.titre}
                        </EditableText>
                    </p>

                    <blockquote className="mt-4 flex gap-3 text-lg leading-relaxed text-white/90 italic sm:text-xl">
                        <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="mot_directeur_contenu" className="line-clamp-4">
                            {d.contenu}
                        </EditableText>
                    </blockquote>

                    <p className="mt-5 text-sm font-semibold text-white">
                        <EditableText as="span" contentKey="directeur_nom">
                            {d.nom}
                        </EditableText>
                        <span className="ml-1.5 font-normal text-white/60">
                            <EditableText as="span" contentKey="directeur_fonction">
                                {d.fonction}
                            </EditableText>
                        </span>
                    </p>

                    <EditableButton
                        contentKey="directeur_bouton"
                        href="/mot-du-directeur"
                        defaultLabel={d.t('accueil.lire_la_suite', 'Lire la suite')}
                        icon={ArrowRight}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-isstm-gold px-5 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    />
                </div>

                <div className="relative mx-auto h-56 w-56 flex-shrink-0 md:h-64 md:w-64">
                    <img
                        src={`/${d.image}`}
                        alt=""
                        className="h-full w-full rounded-2xl object-cover shadow-2xl"
                        loading="lazy"
                        style={imageStyleToCss(d.contentStyles?.directeur_image_path, { includeOpacity: false })}
                    />
                    <EditableImage contentKey="directeur_image_path" value={d.image} />
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 5 — "Polaroid": a tilted polaroid-style photo card with a        */
/* signature-style caption, quote beside it.                               */
/* ---------------------------------------------------------------------- */

function DesignPolaroid({ d, pencil }) {
    return (
        <section className="relative bg-slate-50 px-6 py-14 sm:py-20 dark:bg-slate-900">
            <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-[240px_1fr]">
                {pencil}
                <div className="group relative mx-auto -rotate-3 rounded-sm bg-white p-3 pb-10 shadow-xl transition-transform duration-500 ease-out hover:-rotate-1 dark:bg-slate-800">
                    <div className="relative h-48 w-48 overflow-hidden">
                        <img
                            src={`/${d.image}`}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            loading="lazy"
                            style={imageStyleToCss(d.contentStyles?.directeur_image_path, { includeOpacity: false })}
                        />
                        <EditableImage contentKey="directeur_image_path" value={d.image} />
                    </div>
                    {/* A paperclip pinning the photo to its card at the top
                        left, held flat/horizontal — placed after the photo in
                        the DOM (and given z-20) so it paints on top of it
                        rather than sitting behind it. Wiggles on hover, as if
                        the clip just caught the card settling back from the
                        photo's own hover tilt. */}
                    <Paperclip
                        className="pointer-events-none absolute top-1 left-1 z-20 h-10 w-10 rotate-90 text-slate-500 drop-shadow-md transition-transform duration-500 ease-out group-hover:rotate-[75deg] dark:text-slate-300"
                        aria-hidden="true"
                    />
                    <p className="font-caveat mt-3 text-center text-xl text-isstm-navy dark:text-white">
                        <EditableText as="span" contentKey="directeur_nom">
                            {d.nom}
                        </EditableText>
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                        <EditableText as="span" contentKey="accueil_mot_directeur_titre">
                            {d.titre}
                        </EditableText>
                    </h2>

                    <blockquote className="mt-3 flex gap-2.5 text-base leading-relaxed text-slate-600 italic dark:text-slate-300">
                        <Quote className="mt-0.5 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="mot_directeur_contenu" className="line-clamp-4">
                            {d.contenu}
                        </EditableText>
                    </blockquote>

                    <p className="mt-4 text-xs font-semibold tracking-wide text-isstm-gold uppercase">
                        <EditableText as="span" contentKey="directeur_fonction">
                            {d.fonction}
                        </EditableText>
                    </p>

                    <EditableButton
                        contentKey="directeur_bouton"
                        href="/mot-du-directeur"
                        defaultLabel={d.t('accueil.lire_la_suite', 'Lire la suite')}
                        icon={ArrowRight}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:text-isstm-gold dark:text-white"
                    />
                </div>
            </div>
        </section>
    );
}

const DESIGNS = {
    1: DesignPortrait,
    2: DesignCard,
    3: DesignQuote,
    4: DesignBand,
    5: DesignPolaroid,
};

/* Tiny CSS mockups for the design-picker dialog. */
function PortraitThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-white p-2">
            <span className="h-full w-1/3 flex-shrink-0 rounded-md bg-isstm-gold/40" />
            <div className="flex-1 space-y-1">
                <span className="block h-1 w-3/4 rounded-full bg-isstm-navy/60" />
                <span className="block h-1 w-full rounded-full bg-slate-300" />
                <span className="block h-1 w-2/3 rounded-full bg-slate-300" />
            </div>
        </div>
    );
}

function CardThumbnail() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-100 p-2">
            <span className="h-4 w-4 rounded-full bg-isstm-gold/60" />
            <span className="h-1 w-1/2 rounded-full bg-isstm-navy/60" />
            <span className="h-1 w-3/4 rounded-full bg-slate-300" />
        </div>
    );
}

function QuoteThumbnail() {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 bg-white p-2">
            <span className="absolute top-0 font-serif text-2xl text-slate-200" aria-hidden="true">
                &rdquo;
            </span>
            <span className="h-1 w-3/4 rounded-full bg-isstm-navy/60" />
            <span className="h-1 w-1/2 rounded-full bg-slate-300" />
        </div>
    );
}

function BandThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-isstm-navy p-2">
            <div className="flex-1 space-y-1">
                <span className="block h-1 w-3/4 rounded-full bg-isstm-gold" />
                <span className="block h-1 w-full rounded-full bg-white/40" />
            </div>
            <span className="h-full w-1/3 flex-shrink-0 rounded-md bg-white/20" />
        </div>
    );
}

function PolaroidThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-slate-100 p-2">
            <span className="h-full w-1/3 flex-shrink-0 -rotate-6 rounded-sm bg-white p-1 shadow">
                <span className="block h-full w-full bg-isstm-gold/40" />
            </span>
            <div className="flex-1 space-y-1">
                <span className="block h-1 w-3/4 rounded-full bg-isstm-navy/60" />
                <span className="block h-1 w-full rounded-full bg-slate-300" />
            </div>
        </div>
    );
}

const DESIGN_OPTIONS = [
    { value: '1', label: 'Portrait', Thumbnail: PortraitThumbnail },
    { value: '2', label: 'Carte', Thumbnail: CardThumbnail },
    { value: '3', label: 'Citation', Thumbnail: QuoteThumbnail },
    { value: '4', label: 'Bandeau', Thumbnail: BandThumbnail },
    { value: '5', label: 'Polaroid', Thumbnail: PolaroidThumbnail },
];

export default function Director({ content }) {
    const { t } = useTranslations();
    const { contentStyles } = usePage().props;
    const design = contentStyles?.directeur_design?.design ?? '1';

    const d = {
        t,
        contentStyles,
        image: content.directeur_image_path ?? 'images/directeur.jpg',
        titre: content.accueil_mot_directeur_titre,
        contenu: content.mot_directeur_contenu,
        nom: content.directeur_nom,
        fonction: content.directeur_fonction,
    };

    const DesignComponent = DESIGNS[design] ?? DesignPortrait;
    const pencil = (
        <EditableDesignPicker
            contentKey="directeur_design"
            title="Design du mot du directeur"
            description="Choisissez la mise en forme du mot du directeur affiché sur l'accueil."
            designs={DESIGN_OPTIONS}
            className="absolute top-0 right-0 z-40"
        />
    );

    return <DesignComponent d={d} pencil={pencil} />;
}
