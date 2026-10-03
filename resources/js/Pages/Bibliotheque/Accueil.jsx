import { usePage } from '@inertiajs/react';
import { BookOpen, ExternalLink } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import SeoHead from '../../Components/QuickEdit/SeoHead';
import EditableText from '../../Components/QuickEdit/EditableText';
import EditableImage from '../../Components/QuickEdit/EditableImage';
import EditableLinkButton from '../../Components/QuickEdit/EditableLinkButton';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';
import PhotoCarousel from '../../Components/Bibliotheque/PhotoCarousel';
import { imageStyleToCss } from '../../lib/imageStyle';
import { useTranslations } from '../../lib/useTranslations';

const SLIDES = [
    {
        imageKey: 'bibliotheque_slide1_image_path',
        defaultImage: 'images/bibliotheque/slide1.jpg',
        captionKey: 'bibliotheque_slide1_texte',
        defaultCaption: "Bibliothèque numérique de l'ISSTM, en partenariat avec Peace Corps Madagascar — inaugurée le 10 avril 2024.",
    },
    {
        imageKey: 'bibliotheque_slide2_image_path',
        defaultImage: 'images/bibliotheque/slide2.jpg',
        captionKey: 'bibliotheque_slide2_texte',
        defaultCaption: "Les mentions de l'ISSTM : Génies Civils, Technologies Industrielles, et Sciences et Techniques du Numérique et Physiques Appliquées.",
    },
    {
        imageKey: 'bibliotheque_slide3_image_path',
        defaultImage: 'images/bibliotheque/slide3.jpg',
        captionKey: 'bibliotheque_slide3_texte',
        defaultCaption: "La bibliothèque numérique s'étend aussi à l'École des Langues et Civilisations Internationales (ELCI).",
    },
    {
        imageKey: 'bibliotheque_slide4_image_path',
        defaultImage: 'images/bibliotheque/slide4.jpg',
        captionKey: 'bibliotheque_slide4_texte',
        defaultCaption: 'La salle informatique de la bibliothèque numérique, équipée pour la consultation en ligne.',
    },
    {
        imageKey: 'bibliotheque_slide5_image_path',
        defaultImage: 'images/bibliotheque/slide5.jpg',
        captionKey: 'bibliotheque_slide5_texte',
        defaultCaption: 'Inauguration officielle de la bibliothèque numérique, le 10 avril 2024.',
    },
    {
        imageKey: 'bibliotheque_slide6_image_path',
        defaultImage: 'images/bibliotheque/slide6.jpg',
        captionKey: 'bibliotheque_slide6_texte',
        defaultCaption: "Un espace de travail numérique au service des étudiants de l'ISSTM.",
    },
];

/**
 * Purely informational — no database behind it. The only thing a candidate
 * or student can do here is follow the "Accéder à la bibliothèque" button,
 * whose target is a plain external URL only a super admin can set (see
 * EditableLinkButton), left empty (disabled) until one is configured.
 */
export default function Accueil() {
    const { t } = useTranslations();
    const { content, contentStyles } = usePage().props;
    const introImage = content.bibliotheque_intro_image_path ?? 'images/campus/etudiant1.png';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <SeoHead
                seoKey="bibliotheque"
                defaultTitle="Bibliothèque"
                defaultDescription="Canevas de mémoire, mémoires et projets consultables, et tout le fonds documentaire de l'ISSTM Mahajanga."
            />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="bibliotheque_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-6xl px-6">
                    <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                        <BookOpen className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="bibliotheque_titre">
                            {content.bibliotheque_titre ?? t('bibliotheque.titre', 'Bibliothèque')}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        <EditableText as="span" contentKey="bibliotheque_soustitre">
                            {content.bibliotheque_soustitre ??
                                t(
                                    'bibliotheque.soustitre',
                                    "Canevas de mémoire, mémoires et projets d'anciens étudiants, et tout le fonds documentaire de l'ISSTM.",
                                )}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                    <div className="relative w-full max-w-xs flex-shrink-0 overflow-hidden rounded-2xl sm:w-64">
                        <img src={`/${introImage}`} alt="" className="w-full" style={imageStyleToCss(contentStyles?.bibliotheque_intro_image_path)} />
                        <EditableImage contentKey="bibliotheque_intro_image_path" value={introImage} />
                    </div>
                    <div className="space-y-4">
                        <EditableText as="p" contentKey="bibliotheque_intro_texte" className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                            {content.bibliotheque_intro_texte ??
                                t(
                                    'bibliotheque.intro_texte',
                                    "La bibliothèque de l'ISSTM met à disposition les canevas de mémoire officiels, les mémoires et projets d'anciens étudiants, ainsi que l'ensemble du fonds documentaire de l'établissement.",
                                )}
                        </EditableText>
                        <EditableText
                            as="p"
                            contentKey="bibliotheque_texte_inspirant"
                            className="text-base leading-relaxed text-slate-700 dark:text-slate-200"
                        >
                            {content.bibliotheque_texte_inspirant ??
                                t(
                                    'bibliotheque.texte_inspirant',
                                    "Explorez, apprenez, découvrez et construisez votre avenir : la bibliothèque universitaire vous ouvre les portes d'un vaste univers de connaissances, de ressources et de références pour accompagner chaque étudiant dans son parcours académique, stimuler sa curiosité et favoriser la réussite de ses projets.",
                                )}
                        </EditableText>
                    </div>
                </div>

                <div className="mt-10 flex justify-center">
                    <EditableLinkButton
                        contentKey="bibliotheque_lien"
                        className="flex items-center gap-2 rounded-full bg-isstm-navy px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                        disabledClassName="flex cursor-not-allowed items-center gap-2 rounded-full bg-slate-300 px-7 py-3 text-sm font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    >
                        {t('bibliotheque.acceder', 'Accéder à la bibliothèque')}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </EditableLinkButton>
                </div>

                <div className="mt-14">
                    <h2 className="mb-4 text-xl font-bold text-isstm-navy dark:text-white">
                        {t('bibliotheque.galerie_titre', 'La bibliothèque en images')}
                    </h2>
                    <PhotoCarousel slides={SLIDES} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
