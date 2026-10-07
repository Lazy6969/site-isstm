import { usePage } from '@inertiajs/react';
import { CircleHelp } from 'lucide-react';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';
import EditableButton from '../QuickEdit/EditableButton';
import EtapesInscription from '../Rejoindre/EtapesInscription';
import { imageStyleToCss } from '../../lib/imageStyle';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Full-bleed "join us" banner between Actualités and Témoignages — a photo
 * with a dark left-to-right gradient (text sits on the dark side, unlike
 * Hero's centered/top-to-bottom gradient), an eyebrow, a headline and a CTA.
 * Everything here (photo, eyebrow, headline, button label) is admin-editable,
 * and the whole section can be hidden via SectionVisibility (see Home.jsx).
 * The 4-step enrollment walkthrough sits directly below it, as one visual
 * block — both toggle together under the same "rejoignez_nous" section.
 */
export default function RejoignezNous() {
    const { t } = useTranslations();
    const { content, contentStyles } = usePage().props;
    const image = content.accueil_rejoindre_image_path ?? 'images/accueil-rejoindre.png';

    return (
        <>
            <section className="relative flex h-[60vh] min-h-[420px] items-center overflow-hidden bg-isstm-navy-dark text-white">
            <img
                src={`/${image}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={imageStyleToCss(contentStyles?.accueil_rejoindre_image_path)}
            />
            {/* Dark on the left (where the text sits) fading to clear on the
                right (where the photo's subject shows through), plus a light
                bottom wash for legibility — neutral black, not the theme
                color, same reasoning as Hero's own overlay. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <EditableImage contentKey="accueil_rejoindre_image_path" value={image} className="absolute top-3 right-3 z-20" />

            <EditableButton
                contentKey="accueil_rejoindre_aide_bouton"
                href="/aide-inscription"
                defaultLabel={t('rejoindre.aide_lien', "Aide pour Comment s'inscrire à l'ISSTM ?")}
                icon={CircleHelp}
                className="absolute top-14 right-3 z-20 flex items-center gap-2 rounded-full bg-isstm-navy px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
            />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
                <div className="max-w-lg">
                    <EditableText
                        as="p"
                        contentKey="accueil_rejoindre_eyebrow"
                        className="text-xs font-semibold tracking-[0.2em] text-isstm-gold uppercase"
                    >
                        {content.accueil_rejoindre_eyebrow ?? t('accueil.rejoindre_eyebrow', 'Admissions ouvertes')}
                    </EditableText>
                    <h2 className="mt-3 text-3xl leading-tight font-bold text-balance sm:text-4xl">
                        <EditableText as="span" contentKey="accueil_rejoindre_titre">
                            {content.accueil_rejoindre_titre ??
                                t('accueil.rejoindre_titre', "Rejoignez l'ISSTM et construisez votre avenir")}
                        </EditableText>
                    </h2>
                    <div className="relative mt-8 inline-flex">
                        {/* The "other animated design" asked for — a pulsing glow ring
                            (Tailwind's own animate-ping) behind the button, as opposed
                            to Hero's animate-bounce CTA just above on the same page. */}
                        <span className="absolute inset-0 rounded-full bg-isstm-gold opacity-75 animate-ping" aria-hidden="true" />
                        <EditableButton
                            contentKey="accueil_rejoindre_bouton"
                            href="/rejoindre"
                            defaultLabel={t('nav.rejoignez_nous', 'Rejoignez-nous')}
                            className="relative rounded-full bg-isstm-gold px-7 py-3 text-sm font-semibold text-isstm-navy-dark shadow-lg transition hover:brightness-110"
                        />
                    </div>
                </div>
            </div>
            </section>

            <EtapesInscription />
        </>
    );
}
