import { Head, usePage } from '@inertiajs/react';
import { CalendarClock, Wallet } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import BackButton from '../Components/Layout/BackButton';
import Footer from '../Components/Home/Footer';
import ParcoursSelector from '../Components/Preinscription/ParcoursSelector';
import EditableText from '../Components/QuickEdit/EditableText';
import BannerBackground from '../Components/QuickEdit/BannerBackground';
import { useTranslations } from '../lib/useTranslations';

export default function Rejoindre() {
    const { content } = usePage().props;
    const { t } = useTranslations();

    const dateLimite = content?.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Rejoindre l'ISSTM" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-8 text-white sm:py-10">
                <BannerBackground contentKey="rejoindre_banniere_image_path" />
                <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <BackButton />
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            <EditableText as="span" contentKey="rejoindre_titre">
                                {content?.rejoindre_titre ?? t('rejoindre.titre', 'Rejoindre l’ISSTM')}
                            </EditableText>
                        </h1>
                        <p className="mt-2 text-white/80">
                            <EditableText as="span" contentKey="rejoindre_soustitre">
                                {content?.rejoindre_soustitre ?? t('rejoindre.soustitre', 'Choisissez le parcours qui correspond à votre situation.')}
                            </EditableText>
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                        {dateLimite && (
                            <p className="flex items-center gap-2 text-sm text-white/80">
                                <CalendarClock className="h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                {t('preinscription.cloture', 'Clôture des dépôts')} : <strong className="text-white">{dateLimite}</strong>
                            </p>
                        )}
                        <a
                            href="/inscription"
                            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            <Wallet className="h-4 w-4" aria-hidden="true" />
                            {t('preinscription.voir_frais', 'Voir les frais')}
                        </a>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-10">
                <ParcoursSelector />
            </main>

            <Footer />
        </div>
    );
}
