import { usePage } from '@inertiajs/react';
import { ChevronDown, ListChecks } from 'lucide-react';
import { useState } from 'react';
import EditableText from '../QuickEdit/EditableText';
import EditableDesignPicker from '../QuickEdit/EditableDesignPicker';
import { useTranslations } from '../../lib/useTranslations';

const STEPS = [
    {
        number: 1,
        rotateClass: '-rotate-2',
        badgeClass: 'bg-isstm-navy text-white',
        titleClass: 'text-isstm-navy dark:text-white',
        borderClass: 'border-isstm-navy',
        titleKey: 'rejoindre_etape1_titre',
        titleFallback: 'rejoindre.etape1_titre',
        titleDefault: 'Préinscription',
        texteKey: 'rejoindre_etape1_texte',
        texteFallback: 'rejoindre.etape1_texte',
        texteDefault:
            "Remplissez votre dossier de préinscription et envoyez-le par voie postale à :\n\nMme le Chef de Service de la Scolarité Centrale\nUniversité de Mahajanga\nBP 652, Mahajanga (401)\nTél. : 034 44 889 86\n\nVous pouvez également déposer directement votre dossier auprès du service concerné.",
    },
    {
        number: 2,
        rotateClass: 'rotate-2',
        badgeClass: 'bg-blue-600 text-white',
        titleClass: 'text-blue-600 dark:text-blue-400',
        borderClass: 'border-blue-600',
        titleKey: 'rejoindre_etape2_titre',
        titleFallback: 'rejoindre.etape2_titre',
        titleDefault: 'Fiche du candidat',
        texteKey: 'rejoindre_etape2_texte',
        texteFallback: 'rejoindre.etape2_texte',
        texteDefault:
            "Remplissez soigneusement la fiche du candidat, joignez les pièces demandées, puis envoyez votre dossier en ligne pour qu'il soit examiné par l'établissement.",
    },
    {
        number: 3,
        rotateClass: '-rotate-2',
        badgeClass: 'bg-emerald-600 text-white',
        titleClass: 'text-emerald-600 dark:text-emerald-400',
        borderClass: 'border-emerald-600',
        titleKey: 'rejoindre_etape3_titre',
        titleFallback: 'rejoindre.etape3_titre',
        titleDefault: 'Inscription & validation',
        texteKey: 'rejoindre_etape3_texte',
        texteFallback: 'rejoindre.etape3_texte',
        texteDefault:
            "Si votre candidature est acceptée par l'établissement, procédez à votre inscription définitive en déposant les documents nécessaires.\n\nLe dépôt de votre dossier permet au service de la scolarité de vérifier et d'approuver votre compte étudiant.",
    },
    {
        number: 4,
        rotateClass: 'rotate-2',
        badgeClass: 'bg-isstm-gold text-isstm-navy-dark',
        titleClass: 'text-amber-600 dark:text-amber-400',
        borderClass: 'border-isstm-gold',
        titleKey: 'rejoindre_etape4_titre',
        titleFallback: 'rejoindre.etape4_titre',
        titleDefault: 'Activation du compte',
        texteKey: 'rejoindre_etape4_texte',
        texteFallback: 'rejoindre.etape4_texte',
        texteDefault:
            "Consultez votre adresse e-mail après la validation de votre dossier.\n\nVous recevrez les informations nécessaires pour créer votre propre mot de passe et accéder à la plateforme de l'établissement.",
    },
];

function EtapesHeader({ pencil }) {
    const { t } = useTranslations();
    const { content } = usePage().props;

    return (
        <div className="relative">
            {pencil}
            <h2 className="flex items-center justify-center gap-2 text-center text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                <ListChecks className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                <EditableText as="span" contentKey="rejoindre_etapes_titre">
                    {content?.rejoindre_etapes_titre ?? t('rejoindre.etapes_titre', 'Les étapes de votre inscription')}
                </EditableText>
            </h2>
        </div>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 1 — "Cartes": the original design — gently tilted cards that     */
/* straighten and lift on hover, one color per step.                       */
/* ---------------------------------------------------------------------- */

function DesignCards({ steps, pencil }) {
    return (
        <section className="bg-white py-14 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl px-6">
                <EtapesHeader pencil={pencil} />

                <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className={`group relative rounded-2xl border border-slate-200 bg-white p-5 pt-7 shadow-sm transition duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:border-transparent hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 ${step.rotateClass}`}
                        >
                            <span
                                className={`absolute -top-4 left-5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base font-bold shadow-md ring-4 ring-white transition-transform duration-300 group-hover:scale-110 dark:ring-slate-900 ${step.badgeClass}`}
                            >
                                {step.number}
                            </span>
                            <EditableText as="h3" contentKey={step.titleKey} className={`text-base font-bold ${step.titleClass}`}>
                                {step.title}
                            </EditableText>
                            <EditableText
                                as="p"
                                contentKey={step.texteKey}
                                className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400"
                            >
                                {step.text}
                            </EditableText>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 2 — "Chronologie": numbered nodes on a single connecting line.   */
/* ---------------------------------------------------------------------- */

function DesignTimeline({ steps, pencil }) {
    return (
        <section className="bg-white py-14 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl px-6">
                <EtapesHeader pencil={pencil} />

                <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div
                        className="pointer-events-none absolute inset-x-0 top-5 hidden h-0.5 bg-slate-200 lg:block dark:bg-slate-700"
                        aria-hidden="true"
                    />
                    {steps.map((step) => (
                        <div key={step.number} className="relative flex flex-col items-center text-center">
                            <span
                                className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow ring-4 ring-white dark:ring-slate-900 ${step.badgeClass}`}
                            >
                                {step.number}
                            </span>
                            <EditableText as="h3" contentKey={step.titleKey} className={`mt-4 text-base font-bold ${step.titleClass}`}>
                                {step.title}
                            </EditableText>
                            <EditableText
                                as="p"
                                contentKey={step.texteKey}
                                className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400"
                            >
                                {step.text}
                            </EditableText>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 3 — "Accordéon": a click-to-expand vertical list, one open step  */
/* at a time.                                                               */
/* ---------------------------------------------------------------------- */

function DesignAccordion({ steps, pencil }) {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="bg-white py-14 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-3xl px-6">
                <EtapesHeader pencil={pencil} />

                <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                    {steps.map((step, index) => {
                        const open = index === openIndex;

                        return (
                            <div key={step.number}>
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(open ? -1 : index)}
                                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                                    aria-expanded={open}
                                >
                                    <span
                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${step.badgeClass}`}
                                    >
                                        {step.number}
                                    </span>
                                    <EditableText as="span" contentKey={step.titleKey} className={`flex-1 text-base font-bold ${step.titleClass}`}>
                                        {step.title}
                                    </EditableText>
                                    <ChevronDown
                                        className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                                <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <EditableText
                                            as="p"
                                            contentKey={step.texteKey}
                                            className="px-5 pb-5 pl-[3.25rem] text-sm leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400"
                                        >
                                            {step.text}
                                        </EditableText>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 4 — "Minimal": an editorial list with a ghost numeral and a      */
/* colored rule, no card background.                                       */
/* ---------------------------------------------------------------------- */

function DesignMinimal({ steps, pencil }) {
    return (
        <section className="bg-white py-14 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-4xl px-6">
                <EtapesHeader pencil={pencil} />

                <div className="mt-12 space-y-10">
                    {steps.map((step) => (
                        <div key={step.number} className={`relative border-l-4 py-1 pl-6 ${step.borderClass}`}>
                            <span
                                className="pointer-events-none absolute -top-3 right-0 text-6xl font-black text-slate-100 select-none sm:text-7xl dark:text-slate-800"
                                aria-hidden="true"
                            >
                                {String(step.number).padStart(2, '0')}
                            </span>
                            <EditableText as="h3" contentKey={step.titleKey} className={`relative text-lg font-bold ${step.titleClass}`}>
                                {step.title}
                            </EditableText>
                            <EditableText
                                as="p"
                                contentKey={step.texteKey}
                                className="relative mt-2 max-w-2xl text-sm leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400"
                            >
                                {step.text}
                            </EditableText>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------------- */
/* Design 5 — "Parcours": a vertical roadmap, connected circles down the   */
/* left edge with each step's content beside it.                           */
/* ---------------------------------------------------------------------- */

function DesignRoadmap({ steps, pencil }) {
    return (
        <section className="bg-white py-14 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-2xl px-6">
                <EtapesHeader pencil={pencil} />

                <div className="relative mt-12 space-y-10 pl-1">
                    <div
                        className="pointer-events-none absolute top-2 bottom-2 left-[1.6rem] w-0.5 bg-slate-200 dark:bg-slate-700"
                        aria-hidden="true"
                    />
                    {steps.map((step) => (
                        <div key={step.number} className="relative flex gap-5">
                            <span
                                className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow ring-4 ring-white dark:ring-slate-900 ${step.badgeClass}`}
                            >
                                {step.number}
                            </span>
                            <div className="pt-1">
                                <EditableText as="h3" contentKey={step.titleKey} className={`text-base font-bold ${step.titleClass}`}>
                                    {step.title}
                                </EditableText>
                                <EditableText
                                    as="p"
                                    contentKey={step.texteKey}
                                    className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400"
                                >
                                    {step.text}
                                </EditableText>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const DESIGNS = {
    1: DesignCards,
    2: DesignTimeline,
    3: DesignAccordion,
    4: DesignMinimal,
    5: DesignRoadmap,
};

/* Tiny CSS mockups for the design-picker dialog. */
function CardsThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1 bg-slate-100 p-2">
            {['-rotate-6', 'rotate-3', '-rotate-3', 'rotate-6'].map((rotate, i) => (
                <span key={i} className={`h-8 flex-1 rounded-md border border-slate-300 bg-white shadow-sm ${rotate}`} />
            ))}
        </div>
    );
}

function TimelineThumbnail() {
    return (
        <div className="relative flex h-full w-full items-start justify-center gap-2 p-2 pt-3">
            <span className="pointer-events-none absolute inset-x-3 top-4 h-px bg-slate-300" aria-hidden="true" />
            {['bg-isstm-navy', 'bg-blue-600', 'bg-emerald-600', 'bg-isstm-gold'].map((color, i) => (
                <div key={i} className="relative z-10 flex flex-1 flex-col items-center gap-1">
                    <span className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="h-1 w-full rounded-full bg-slate-300" />
                </div>
            ))}
        </div>
    );
}

function AccordionThumbnail() {
    return (
        <div className="flex h-full w-full flex-col justify-center gap-1 bg-white p-2">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5 rounded border border-slate-200 px-1.5 py-1">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-isstm-navy" />
                    <span className="h-1 flex-1 rounded-full bg-slate-300" />
                </div>
            ))}
        </div>
    );
}

function MinimalThumbnail() {
    return (
        <div className="flex h-full w-full flex-col justify-center gap-1.5 bg-white p-2 pl-2.5">
            {['border-isstm-navy', 'border-blue-600', 'border-emerald-600'].map((border, i) => (
                <div key={i} className={`border-l-2 pl-1.5 ${border}`}>
                    <span className="block h-1 w-3/4 rounded-full bg-slate-400" />
                </div>
            ))}
        </div>
    );
}

function RoadmapThumbnail() {
    return (
        <div className="relative flex h-full w-full flex-col justify-center gap-1.5 bg-white p-2 pl-3">
            <span className="pointer-events-none absolute top-2 bottom-2 left-3 w-px bg-slate-300" aria-hidden="true" />
            {['bg-isstm-navy', 'bg-blue-600', 'bg-emerald-600'].map((color, i) => (
                <div key={i} className="relative z-10 flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${color}`} />
                    <span className="h-1 flex-1 rounded-full bg-slate-300" />
                </div>
            ))}
        </div>
    );
}

const DESIGN_OPTIONS = [
    { value: '1', label: 'Cartes', Thumbnail: CardsThumbnail },
    { value: '2', label: 'Chronologie', Thumbnail: TimelineThumbnail },
    { value: '3', label: 'Accordéon', Thumbnail: AccordionThumbnail },
    { value: '4', label: 'Minimal', Thumbnail: MinimalThumbnail },
    { value: '5', label: 'Parcours', Thumbnail: RoadmapThumbnail },
];

/**
 * The 4-step enrollment walkthrough — reused under the home page's
 * "Rejoignez-nous" banner and at the bottom of the Aide/Inscription page.
 * Step numbers are structural (a real fixed sequence) and each step's own
 * color stays fixed, but the overall layout is now a quick-edit design
 * choice like Stats/MissionVision — only each step's title/text, plus the
 * chosen layout, are editable.
 */
export default function EtapesInscription() {
    const { t } = useTranslations();
    const { content, contentStyles } = usePage().props;
    const design = contentStyles?.rejoindre_etapes_design?.design ?? '1';

    const steps = STEPS.map((step) => ({
        ...step,
        title: content?.[step.titleKey] ?? t(step.titleFallback, step.titleDefault),
        text: content?.[step.texteKey] ?? t(step.texteFallback, step.texteDefault),
    }));

    const DesignComponent = DESIGNS[design] ?? DesignCards;
    const pencil = (
        <EditableDesignPicker
            contentKey="rejoindre_etapes_design"
            title="Design des étapes d'inscription"
            description="Choisissez la mise en forme des 4 étapes d'inscription."
            designs={DESIGN_OPTIONS}
            className="absolute top-0 right-0 z-40"
        />
    );

    return <DesignComponent steps={steps} pencil={pencil} />;
}
