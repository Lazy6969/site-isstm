import { usePage } from '@inertiajs/react';
import { ListChecks } from 'lucide-react';
import EditableText from '../QuickEdit/EditableText';
import { useTranslations } from '../../lib/useTranslations';

const STEPS = [
    {
        number: 1,
        rotateClass: '-rotate-2',
        badgeClass: 'bg-isstm-navy text-white',
        titleClass: 'text-isstm-navy dark:text-white',
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
        titleKey: 'rejoindre_etape4_titre',
        titleFallback: 'rejoindre.etape4_titre',
        titleDefault: 'Activation du compte',
        texteKey: 'rejoindre_etape4_texte',
        texteFallback: 'rejoindre.etape4_texte',
        texteDefault:
            "Consultez votre adresse e-mail après la validation de votre dossier.\n\nVous recevrez les informations nécessaires pour créer votre propre mot de passe et accéder à la plateforme de l'établissement.",
    },
];

/**
 * The 4-step enrollment walkthrough — reused under the home page's
 * "Rejoignez-nous" banner and at the bottom of the Aide/Inscription page.
 * Step numbers are structural (a real fixed sequence), so they stay plain
 * markup and carry the one design touch (a distinct color per step,
 * matching the reference layout) — only each step's title/text is editable.
 */
export default function EtapesInscription() {
    const { t } = useTranslations();
    const { content } = usePage().props;

    return (
        <section className="bg-white py-14 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl px-6">
                <h2 className="flex items-center justify-center gap-2 text-center text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                    <ListChecks className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                    <EditableText as="span" contentKey="rejoindre_etapes_titre">
                        {content?.rejoindre_etapes_titre ?? t('rejoindre.etapes_titre', 'Les étapes de votre inscription')}
                    </EditableText>
                </h2>

                <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map((step) => (
                        <div
                            key={step.number}
                            className={`group relative rounded-2xl border border-slate-200 bg-white p-5 pt-7 shadow-sm transition duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:border-transparent hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 ${step.rotateClass}`}
                        >
                            <span
                                className={`absolute -top-4 left-5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base font-bold shadow-md ring-4 ring-white transition-transform duration-300 group-hover:scale-110 dark:ring-slate-900 ${step.badgeClass}`}
                            >
                                {step.number}
                            </span>
                            <h3 className={`text-base font-bold ${step.titleClass}`}>
                                <EditableText as="span" contentKey={step.titleKey}>
                                    {content?.[step.titleKey] ?? t(step.titleFallback, step.titleDefault)}
                                </EditableText>
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-500 dark:text-slate-400">
                                <EditableText as="span" contentKey={step.texteKey}>
                                    {content?.[step.texteKey] ?? t(step.texteFallback, step.texteDefault)}
                                </EditableText>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
