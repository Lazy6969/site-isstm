import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarClock, CircleHelp, Wallet } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import BackButton from '../Components/Layout/BackButton';
import Footer from '../Components/Home/Footer';
import HeroParcoursCards from '../Components/Rejoindre/HeroParcoursCards';
import LetterRevealText from '../Components/Rejoindre/LetterRevealText';
import EditableText from '../Components/QuickEdit/EditableText';
import EditableImage from '../Components/QuickEdit/EditableImage';
import { imageStyleToCss } from '../lib/imageStyle';
import { useTranslations } from '../lib/useTranslations';

export default function Rejoindre() {
    const { content, contentStyles } = usePage().props;
    const { t } = useTranslations();
    const heroImage = content?.rejoindre_hero_image_path ?? 'images/rejoindre-hero.jpg';
    const accroche = content?.rejoindre_accroche ?? t('rejoindre.accroche', 'Votre avenir commence ici');

    const dateLimite = content?.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Rejoindre l'ISSTM" />
            <SiteHeader />

            <section className="relative flex min-h-[680px] flex-col justify-between overflow-hidden bg-isstm-navy-dark text-white sm:min-h-[760px]">
                <img
                    src={`/${heroImage}`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={imageStyleToCss(contentStyles?.rejoindre_hero_image_path)}
                />
                {/* Dark top (where the buttons/title sit) and dark bottom (where the
                    accroche sits) — clear in the middle so the photo itself still
                    shows through, same neutral-black-not-theme-color reasoning as
                    Hero.jsx's own overlay. */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/10 to-black/75" />
                <EditableImage contentKey="rejoindre_hero_image_path" value={heroImage} className="absolute top-3 right-3 z-20" />

                {/* Top, over the photo's sky: back link, then the heading/date and
                    the 3 frosted parcours cards side by side on the same row
                    (stacks on narrower screens, per the brief). */}
                <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-8 sm:pt-12">
                    <BackButton />

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                <EditableText as="span" contentKey="rejoindre_titre">
                                    {content?.rejoindre_titre ?? t('rejoindre.titre', 'Rejoindre l’ISSTM')}
                                </EditableText>
                            </h1>
                            <p className="mt-1 max-w-xl text-white/85">
                                <EditableText as="span" contentKey="rejoindre_soustitre">
                                    {content?.rejoindre_soustitre ??
                                        t('rejoindre.soustitre', 'Choisissez le parcours qui correspond à votre situation.')}
                                </EditableText>
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                                {dateLimite && (
                                    <p className="flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                        {t('preinscription.cloture', 'Clôture des dépôts')} :{' '}
                                        <strong className="text-white">{dateLimite}</strong>
                                    </p>
                                )}
                                <a
                                    href="/inscription"
                                    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-semibold transition hover:bg-white/20"
                                >
                                    <Wallet className="h-4 w-4" aria-hidden="true" />
                                    {t('preinscription.voir_frais', 'Voir les frais')}
                                </a>
                                <Link
                                    href="/aide-inscription"
                                    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-semibold transition hover:bg-white/20"
                                >
                                    <CircleHelp className="h-4 w-4" aria-hidden="true" />
                                    {t('rejoindre.aide_lien', "Aide pour Comment s'inscrire à l'ISSTM ?")}
                                </Link>
                            </div>
                        </div>

                        <HeroParcoursCards />
                    </div>
                </div>

                {/* Bottom-middle: the catchy phrase, same script styling as the
                    homepage Hero's own "L'excellence technique..." headline,
                    revealed one letter at a time (key=accroche restarts it
                    whenever the admin edits the text). */}
                <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-8 text-center sm:pb-12">
                    <EditableText
                        as="p"
                        contentKey="rejoindre_accroche"
                        value={accroche}
                        className="font-script text-3xl leading-tight text-isstm-gold drop-shadow-[2px_2px_5px_rgba(0,0,0,0.5)] sm:text-4xl"
                    >
                        <LetterRevealText key={accroche} text={accroche} />
                    </EditableText>
                </div>
            </section>

            <Footer />
        </div>
    );
}
