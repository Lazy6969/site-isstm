import { router, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarClock, CircleCheck, CircleX, RefreshCw, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { imageStyleToCss, imageStyleToBackgroundCss } from '../../lib/imageStyle';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';
import EditableButton from '../QuickEdit/EditableButton';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';

/**
 * The on-page open/closed switch — gated behind settings.manage (not just
 * quick-edit.access) since it's the same consequential state as the
 * maintenance/inscriptions toggles, just reachable from the banner itself
 * too. Posts to the same endpoint /console/settings/maintenance/admissions
 * uses, so both stay a single source of truth. Sits below (not on top of)
 * SectionVisibility's own "Masquer" pill, which already occupies top-3 left-3
 * on every homepage section.
 */
function AdmissionsToggle({ open, className = '' }) {
    const { auth } = usePage().props;
    const { canEdit, active } = useQuickEdit();
    const [pending, setPending] = useState(false);
    const canManage = (auth?.permissions ?? []).includes('settings.manage');

    if (!canEdit || !active || !canManage) {
        return null;
    }

    function toggle() {
        setPending(true);
        router.put(
            '/console/settings/maintenance/admissions',
            { open: !open },
            { preserveScroll: true, onFinish: () => setPending(false) },
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow ring-2 ring-white transition hover:scale-105 disabled:opacity-60 ${
                open ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
            } ${className}`}
        >
            <RefreshCw className={`h-3 w-3 ${pending ? 'animate-spin' : ''}`} aria-hidden="true" />
            {open ? 'Marquer fermées' : 'Marquer ouvertes'}
        </button>
    );
}

function StatusBadge({ open, className = '' }) {
    const Icon = open ? CircleCheck : CircleX;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
                open ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            } ${className}`}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {open ? 'Ouvertes' : 'Fermées'}
        </span>
    );
}

/** Resolves the state-dependent title/text/button keys, the shared image and
 * the closing date, once, for every design below. */
function useAdmissionsData() {
    const { content, contentStyles, admissionsOpen } = usePage().props;
    const titreKey = admissionsOpen ? 'admissions_titre_ouvert' : 'admissions_titre_ferme';
    const texteKey = admissionsOpen ? 'admissions_texte_ouvert' : 'admissions_texte_ferme';
    const dateLimiteRaw = content?.inscription_date_limite;
    const dateLimite = dateLimiteRaw
        ? new Date(dateLimiteRaw).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return {
        open: admissionsOpen,
        titreKey,
        texteKey,
        titre: content?.[titreKey],
        texte: content?.[texteKey],
        image: content?.admissions_image_path ?? 'images/accueil-rejoindre.png',
        dateLimiteRaw,
        dateLimite,
        contentStyles,
    };
}

/** The closing date for this year's dossier — the same `inscription_date_limite`
 * content key as Rejoindre.jsx / Inscription/Index.jsx, so editing it here
 * keeps every page in sync. Only shown while admissions are open. */
function DateLimite({ d, className = '' }) {
    if (!d.open || !d.dateLimite) {
        return null;
    }

    return (
        <p className={`flex items-center gap-2 text-sm ${className}`}>
            <CalendarClock className="h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
            Clôture des dépôts :{' '}
            <strong>
                <EditableText as="span" contentKey="inscription_date_limite" value={d.dateLimiteRaw}>
                    {d.dateLimite}
                </EditableText>
            </strong>
        </p>
    );
}

/** The 2 CTAs shown while admissions are open — "Voir les frais" links to
 * the now-gated /inscription page, so it's hidden the same as the
 * préinscription button once admissions close. */
function AdmissionsButtons({ className = '', primaryClassName = '', secondaryClassName = '' }) {
    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            <EditableButton
                contentKey="admissions_bouton"
                href="/rejoindre"
                defaultLabel="Faire une préinscription"
                icon={ArrowRight}
                className={primaryClassName}
            />
            <a href="/inscription" className={secondaryClassName}>
                <Wallet className="h-4 w-4" aria-hidden="true" />
                Voir les frais
            </a>
        </div>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 1 — "Bandeau": a full-bleed photo banner, like RejoignezNous.    */
/* ---------------------------------------------------------------------- */

function DesignBanner({ d, pencil }) {
    return (
        <section className="relative flex min-h-[380px] items-center overflow-hidden bg-isstm-navy-dark text-white">
            <img
                src={`/${d.image}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={imageStyleToCss(d.contentStyles?.admissions_image_path)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
            <EditableImage contentKey="admissions_image_path" value={d.image} className="absolute top-3 right-14 z-20" />
            {pencil}
            <AdmissionsToggle open={d.open} className="absolute top-14 left-3 z-20" />

            <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-10">
                <div className="max-w-lg">
                    <StatusBadge open={d.open} />
                    <h2 className="mt-4 text-3xl leading-tight font-bold text-balance sm:text-4xl">
                        <EditableText as="span" contentKey={d.titreKey}>
                            {d.titre}
                        </EditableText>
                    </h2>
                    <EditableText as="p" contentKey={d.texteKey} className="mt-3 max-w-md leading-relaxed text-white/85">
                        {d.texte}
                    </EditableText>
                    <DateLimite d={d} className="mt-4 text-white/85" />
                    {d.open && (
                        <AdmissionsButtons
                            className="mt-6"
                            primaryClassName="inline-flex w-fit items-center gap-1.5 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark shadow-lg transition hover:brightness-110"
                            secondaryClassName="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 2 — "Carte": a floating status card overlapping a cropped photo. */
/* ---------------------------------------------------------------------- */

function DesignCard({ d, pencil }) {
    return (
        <section className="relative flex min-h-[460px] items-center overflow-hidden bg-isstm-navy-dark py-16">
            {/* The photo now fills the whole section behind the card — not
                just a thin strip above it — so it genuinely reads as a
                background rather than a cropped header image. */}
            <img
                src={`/${d.image}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={imageStyleToCss(d.contentStyles?.admissions_image_path)}
            />
            <div className="absolute inset-0 bg-isstm-navy-dark/50" />
            <EditableImage contentKey="admissions_image_path" value={d.image} className="absolute top-3 right-14 z-20" />
            {pencil}
            <AdmissionsToggle open={d.open} className="absolute top-14 left-3 z-20" />

            <div className="relative z-10 mx-auto max-w-xl rounded-[1.75rem] bg-white px-6 py-8 text-center shadow-2xl shadow-black/30 sm:px-10 dark:bg-slate-800">
                <div className="flex justify-center">
                    <StatusBadge
                        open={d.open}
                        className={d.open ? '!bg-emerald-100 !text-emerald-700 dark:!bg-emerald-500/15 dark:!text-emerald-400' : '!bg-red-100 !text-red-700 dark:!bg-red-500/15 dark:!text-red-400'}
                    />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                    <EditableText as="span" contentKey={d.titreKey}>
                        {d.titre}
                    </EditableText>
                </h2>
                <EditableText as="p" contentKey={d.texteKey} className="mt-3 leading-relaxed text-slate-600 dark:text-white/70">
                    {d.texte}
                </EditableText>
                <DateLimite d={d} className="mt-4 justify-center text-slate-600 dark:text-white/70" />
                {d.open && (
                    <AdmissionsButtons
                        className="mt-5 justify-center"
                        primaryClassName="inline-flex items-center gap-1.5 rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                        secondaryClassName="inline-flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-6 py-2.5 text-sm font-semibold text-isstm-navy transition hover:bg-isstm-navy/5 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                    />
                )}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 3 — "Scindé": photo filling one half, status + text the other.  */
/* ---------------------------------------------------------------------- */

function DesignSplit({ d, pencil }) {
    return (
        <section className="relative bg-white dark:bg-slate-950">
            <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="relative h-56 sm:h-auto">
                    <img
                        src={`/${d.image}`}
                        alt=""
                        className="h-full w-full object-cover"
                        style={imageStyleToCss(d.contentStyles?.admissions_image_path)}
                    />
                    <EditableImage contentKey="admissions_image_path" value={d.image} className="absolute top-3 right-3 z-20" />
                </div>
                <div className="relative flex flex-col justify-center bg-isstm-navy px-6 py-12 text-white sm:px-12">
                    {pencil}
                    <AdmissionsToggle open={d.open} className="absolute top-14 left-3 z-20 sm:left-6" />
                    <StatusBadge open={d.open} />
                    <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey={d.titreKey}>
                            {d.titre}
                        </EditableText>
                    </h2>
                    <EditableText as="p" contentKey={d.texteKey} className="mt-3 max-w-md leading-relaxed text-white/80">
                        {d.texte}
                    </EditableText>
                    <DateLimite d={d} className="mt-4 text-white/80" />
                    {d.open && (
                        <AdmissionsButtons
                            className="mt-5"
                            primaryClassName="inline-flex w-fit items-center gap-1.5 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                            secondaryClassName="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 4 — "Ruban": a compact strip — small thumbnail, status and text  */
/* in one line.                                                            */
/* ---------------------------------------------------------------------- */

function DesignRibbon({ d, pencil }) {
    return (
        <section className="relative bg-white py-6 dark:bg-slate-950">
            <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 sm:flex-row">
                {pencil}
                <AdmissionsToggle open={d.open} className="absolute top-11 left-6 sm:static" />

                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                        src={`/${d.image}`}
                        alt=""
                        className="h-full w-full object-cover"
                        style={imageStyleToCss(d.contentStyles?.admissions_image_path)}
                    />
                    <EditableImage contentKey="admissions_image_path" value={d.image} className="h-5 w-5" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                        <StatusBadge open={d.open} className={d.open ? '!bg-emerald-100 !text-emerald-700 dark:!bg-emerald-500/15 dark:!text-emerald-400' : '!bg-red-100 !text-red-700 dark:!bg-red-500/15 dark:!text-red-400'} />
                        <h2 className="text-sm font-bold text-isstm-navy sm:text-base dark:text-white">
                            <EditableText as="span" contentKey={d.titreKey}>
                                {d.titre}
                            </EditableText>
                        </h2>
                    </div>
                    <EditableText as="p" contentKey={d.texteKey} className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        {d.texte}
                    </EditableText>
                    <DateLimite d={d} className="mt-1 justify-center text-xs text-slate-500 sm:justify-start dark:text-slate-400" />
                </div>

                {d.open && (
                    <AdmissionsButtons
                        className="flex-shrink-0"
                        primaryClassName="inline-flex items-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2 text-xs font-semibold text-white transition hover:brightness-110 sm:text-sm"
                        secondaryClassName="inline-flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-5 py-2 text-xs font-semibold text-isstm-navy transition hover:bg-isstm-navy/5 sm:text-sm dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                    />
                )}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 5 — "Affiche": a poster-style layout — blurred full-bleed photo, */
/* circular medallion, centered status.                                    */
/* ---------------------------------------------------------------------- */

function DesignPoster({ d, pencil }) {
    return (
        <section className="relative overflow-hidden bg-isstm-navy-dark py-16 text-center text-white sm:py-20">
            <div
                className="absolute inset-0 opacity-30 blur-md"
                style={{
                    backgroundImage: `url('/${d.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    ...imageStyleToBackgroundCss(d.contentStyles?.admissions_image_path, { includeOpacity: false }),
                }}
            />
            <div className="absolute inset-0 bg-isstm-navy-dark/60" />
            <EditableImage contentKey="admissions_image_path" value={d.image} className="absolute top-3 right-14 z-20" />
            {pencil}
            <AdmissionsToggle open={d.open} className="absolute top-14 left-3 z-20" />

            <div className="relative z-10 mx-auto max-w-xl px-6">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/80">
                    <img
                        src={`/${d.image}`}
                        alt=""
                        className="h-full w-full object-cover"
                        style={imageStyleToCss(d.contentStyles?.admissions_image_path)}
                    />
                </div>

                <div className="mt-5 flex justify-center">
                    <StatusBadge open={d.open} />
                </div>
                <h2 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">
                    <EditableText as="span" contentKey={d.titreKey}>
                        {d.titre}
                    </EditableText>
                </h2>
                <EditableText as="p" contentKey={d.texteKey} className="mx-auto mt-3 max-w-md leading-relaxed text-white/85">
                    {d.texte}
                </EditableText>
                <DateLimite d={d} className="mt-4 justify-center text-white/85" />
                {d.open && (
                    <AdmissionsButtons
                        className="mt-6 justify-center"
                        primaryClassName="inline-flex w-fit items-center gap-1.5 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark shadow-lg transition hover:brightness-110"
                        secondaryClassName="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    />
                )}
            </div>
        </section>
    );
}

const DESIGNS = {
    1: DesignBanner,
    2: DesignCard,
    3: DesignSplit,
    4: DesignRibbon,
    5: DesignPoster,
};

/* Tiny CSS mockups for the design-picker dialog. */
function BannerThumbnail() {
    return (
        <div className="relative flex h-full w-full items-center bg-isstm-navy p-2">
            <div className="space-y-1">
                <span className="block h-1.5 w-10 rounded-full bg-emerald-400" />
                <span className="block h-1 w-14 rounded-full bg-white/60" />
            </div>
        </div>
    );
}

function CardThumbnail() {
    return (
        <div className="flex h-full w-full flex-col bg-slate-200">
            <span className="h-1/2 w-full bg-isstm-navy/50" />
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-white">
                <span className="h-1 w-10 rounded-full bg-isstm-navy/60" />
                <span className="h-1 w-14 rounded-full bg-slate-300" />
            </div>
        </div>
    );
}

function SplitThumbnail() {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <span className="h-full flex-1 bg-isstm-gold/40" />
            <span className="flex h-full flex-1 flex-col justify-center gap-1 bg-isstm-navy p-1.5">
                <span className="block h-1 w-full rounded-full bg-white/70" />
                <span className="block h-1 w-2/3 rounded-full bg-white/40" />
            </span>
        </div>
    );
}

function RibbonThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-white p-2">
            <span className="h-6 w-6 flex-shrink-0 rounded bg-isstm-navy/40" />
            <div className="flex-1 space-y-1">
                <span className="block h-1 w-3/4 rounded-full bg-isstm-navy/60" />
                <span className="block h-1 w-full rounded-full bg-slate-300" />
            </div>
        </div>
    );
}

function PosterThumbnail() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-isstm-navy-dark p-2">
            <span className="h-4 w-4 rounded-full bg-white/70 ring-2 ring-white/40" />
            <span className="h-1 w-10 rounded-full bg-white/70" />
        </div>
    );
}

const DESIGN_OPTIONS = [
    { value: '1', label: 'Bandeau', Thumbnail: BannerThumbnail },
    { value: '2', label: 'Carte', Thumbnail: CardThumbnail },
    { value: '3', label: 'Scindé', Thumbnail: SplitThumbnail },
    { value: '4', label: 'Ruban', Thumbnail: RibbonThumbnail },
    { value: '5', label: 'Affiche', Thumbnail: PosterThumbnail },
];

export default function AdmissionsStatus() {
    const { contentStyles } = usePage().props;
    const d = useAdmissionsData();
    const design = contentStyles?.admissions_design?.design ?? '1';
    const DesignComponent = DESIGNS[design] ?? DesignBanner;
    const pencil = (
        <EditableDesignPicker
            contentKey="admissions_design"
            title="Design admissions"
            description="Choisissez la mise en forme de la bannière admissions ouvertes/fermées."
            designs={DESIGN_OPTIONS}
            className="absolute top-3 right-3 z-40"
        />
    );

    return <DesignComponent d={d} pencil={pencil} />;
}
