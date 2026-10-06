import { usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import { Card } from '../Components/ui/card';
import { useTranslations } from '../lib/useTranslations';
import EditableText from '../Components/QuickEdit/EditableText';
import EditableImage from '../Components/QuickEdit/EditableImage';
import EditableButton from '../Components/QuickEdit/EditableButton';
import EditableLinkButton from '../Components/QuickEdit/EditableLinkButton';
import ExternalPencil from '../Components/QuickEdit/ExternalPencil';
import EditLinkDialog from '../Components/QuickEdit/EditLinkDialog';
import EditableCardStyle from '../Components/QuickEdit/EditableCardStyle';
import SeoHead from '../Components/QuickEdit/SeoHead';
import { imageStyleToCss } from '../lib/imageStyle';
import { cardContainerStyle } from '../lib/cardStyle';
import BannerBackground from '../Components/QuickEdit/BannerBackground';
import { useQuickEdit } from '../lib/useQuickEdit';

export default function Bourse({ content = {} }) {
    const { t } = useTranslations();
    const { contentStyles } = usePage().props;
    const { active: quickEditActive } = useQuickEdit();

    const links = [
        {
            key: 'bourse_lien1',
            logo: content.bourse_lien1_logo ?? 'images/partenariat/mesupres.png',
            title: t(
                'bourse.externe_titre',
                "Postuler pour une Bourse d'État",
            ),
            description: t(
                'bourse.externe_desc',
                "Les demandes de bourses d'études de l'État malagasy se font désormais en ligne via la plateforme officielle du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESupReS).",
            ),
            button: content.bourse_lien1_bouton,
            href: 'https://boursesext.mesupres.edu.mg/',
        },
        {
            key: 'bourse_lien2',
            logo: content.bourse_lien2_logo ?? 'images/partenariat/tresor-public.png',
            title: t(
                'bourse.tresor_titre',
                'Créer votre portefeuille Trésor Public',
            ),
            description: t(
                'bourse.tresor_desc',
                "Inscrivez-vous sur la plateforme du Trésor Public de Madagascar pour créer votre propre portefeuille électronique et gérer directement votre bourse d'études.",
            ),
            button: content.bourse_lien2_bouton,
            href: 'https://app.tresorpublic.mg:12000/wallet/login',
        },
    ];

    const lien3Logo = content.bourse_lien3_logo ?? 'images/logo-isstm.svg';
    const lien3Href = content.bourse_lien3_href ?? '';
    const lien3Bouton = content.bourse_lien3_bouton ?? t('bourse.option3_bouton', 'Accéder à la plateforme');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <SeoHead
                seoKey="bourse"
                defaultTitle="Bourse d'études"
                defaultDescription="Bourses d'études de l'État malagasy et portefeuille Trésor Public : démarches et plateformes officielles pour les étudiants de l'ISSTM."
            />

            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="bourse_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="bourse_titre">
                            {content.bourse_titre}
                        </EditableText>
                    </h1>

                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="bourse_soustitre">
                            {content.bourse_soustitre}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                <div className="flex justify-end">
                    <EditableCardStyle contentKey="bourse_carte" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {links.map((link) => (
                        <Card
                            key={link.key}
                            className="flex flex-col items-center p-7 text-center"
                            style={cardContainerStyle(contentStyles?.bourse_carte)}
                        >
                            <div className="relative">
                                <img
                                    src={`/${link.logo}`}
                                    alt=""
                                    className="h-32 w-auto object-contain sm:h-40"
                                    loading="lazy"
                                    style={imageStyleToCss(contentStyles?.[`${link.key}_logo`])}
                                />
                                <EditableImage contentKey={`${link.key}_logo`} value={link.logo} />
                            </div>

                            <EditableText
                                as="h2"
                                contentKey={`${link.key}_titre`}
                                className="mt-6 text-lg font-semibold text-isstm-navy dark:text-white"
                            >
                                {content[`${link.key}_titre`] ?? link.title}
                            </EditableText>

                            <EditableText
                                as="p"
                                contentKey={`${link.key}_description`}
                                className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
                            >
                                {content[`${link.key}_description`] ??
                                    link.description}
                            </EditableText>

                            <EditableButton
                                contentKey={`${link.key}_bouton`}
                                href={link.href}
                                defaultLabel={link.button}
                                icon={ExternalLink}
                                external
                                className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                            />
                        </Card>
                    ))}

                    <Card
                        className="flex flex-col items-center p-7 text-center"
                        style={cardContainerStyle(contentStyles?.bourse_carte)}
                    >
                        <div className="relative">
                            <img
                                src={`/${lien3Logo}`}
                                alt=""
                                className="h-32 w-auto object-contain sm:h-40"
                                loading="lazy"
                                style={imageStyleToCss(contentStyles?.bourse_lien3_logo)}
                            />
                            <EditableImage contentKey="bourse_lien3_logo" value={lien3Logo} />
                        </div>

                        <EditableText
                            as="h2"
                            contentKey="bourse_lien3_titre"
                            className="mt-6 text-lg font-semibold text-isstm-navy dark:text-white"
                        >
                            {content.bourse_lien3_titre}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="bourse_lien3_description"
                            className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
                        >
                            {content.bourse_lien3_description}
                        </EditableText>

                        <span className="relative mt-5 inline-flex">
                            <EditableLinkButton
                                contentKey="bourse_lien3_href"
                                className="flex items-center justify-center gap-1.5 rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                                disabledClassName="flex items-center justify-center gap-1.5 rounded-full bg-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                            >
                                {lien3Bouton}
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </EditableLinkButton>
                            <ExternalPencil
                                label="Modifier le texte du bouton"
                                className="absolute -top-2 -left-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                                dialog={EditLinkDialog}
                                dialogProps={{
                                    contentKey: 'bourse_lien3_bouton',
                                    initialValue: lien3Bouton,
                                    title: 'Modifier le texte du bouton',
                                    label: 'Texte du bouton',
                                    placeholder: 'Accéder à la plateforme',
                                    helpText: '',
                                    inputType: 'text',
                                }}
                            />
                        </span>
                        {!lien3Href && quickEditActive && (
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                Section indisponible pour les visiteurs — ajoutez un lien avec le crayon pour l'activer.
                            </p>
                        )}
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}