import { Head, usePage } from '@inertiajs/react';
import { Quote } from 'lucide-react';
import Footer from '../../Components/Home/Footer';
import SiteHeader from '../../Components/Layout/SiteHeader';
import { useTranslations } from '../../lib/useTranslations';
import { imageStyleToCss } from '../../lib/imageStyle';
import EditableText from '../../Components/QuickEdit/EditableText';
import EditableImage from '../../Components/QuickEdit/EditableImage';

export default function Index({ content }) {
    const { t } = useTranslations();
    const { contentStyles } = usePage().props;
    const directeurImage = content.directeur_image_path ?? 'images/directeur.jpg';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={content.accueil_mot_directeur_titre ?? t('accueil.mot_directeur_titre', 'Le mot du Directeur')} />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="accueil_mot_directeur_titre">
                            {content.accueil_mot_directeur_titre ?? t('accueil.mot_directeur_titre', 'Le mot du Directeur')}
                        </EditableText>
                    </h1>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <div className="relative h-40 w-40 flex-shrink-0">
                            <img
                                src={`/${directeurImage}`}
                                alt={t('accueil.directeur_photo_alt', "Photo du Directeur de l'ISSTM")}
                                className="h-full w-full rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/40"
                                loading="lazy"
                                style={imageStyleToCss(contentStyles?.directeur_image_path)}
                            />
                            <EditableImage contentKey="directeur_image_path" value={directeurImage} />
                        </div>
                        <div>
                            <blockquote className="flex gap-3 text-lg leading-relaxed text-slate-600 italic dark:text-slate-300">
                                <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                <EditableText as="span" contentKey="mot_directeur_contenu">
                                    {content.mot_directeur_contenu}
                                </EditableText>
                            </blockquote>
                            <p className="mt-6 font-semibold text-isstm-navy dark:text-white">
                                <EditableText as="span" contentKey="directeur_nom">
                                    {content.directeur_nom}
                                </EditableText>
                                <br />
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                    {t('accueil.directeur_fonction', "Directeur de l'ISSTM")}
                                </span>
                            </p>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
