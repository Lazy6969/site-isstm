import { Head, usePage } from '@inertiajs/react';
import { Download, Video as VideoIcon } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import BackButton from '../../Components/Layout/BackButton';
import Footer from '../../Components/Home/Footer';
import EditableText from '../../Components/QuickEdit/EditableText';
import EditableVideo from '../../Components/QuickEdit/EditableVideo';
import EtapesInscription from '../../Components/Rejoindre/EtapesInscription';
import { useTranslations } from '../../lib/useTranslations';

export default function Inscription() {
    const { t } = useTranslations();
    const { content } = usePage().props;
    const video = content.aide_inscription_video_path;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Comment s'inscrire à l'ISSTM ?" />
            <SiteHeader />

            <div className="bg-isstm-navy py-8 text-white sm:py-10">
                <div className="mx-auto max-w-5xl px-6">
                    <BackButton />
                    <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                        <VideoIcon className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="aide_inscription_titre">
                            {content.aide_inscription_titre ?? "Comment s'inscrire à l'ISSTM ?"}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        <EditableText as="span" contentKey="aide_inscription_soustitre">
                            {content.aide_inscription_soustitre ??
                                "Une courte vidéo explicative pour vous guider dans les démarches d'inscription."}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-8">
                <div className="relative overflow-hidden rounded-2xl bg-black shadow-xl">
                    {video ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                            key={video}
                            src={`/${video}`}
                            controls
                            autoPlay
                            muted
                            playsInline
                            className="aspect-video w-full max-h-[80vh]"
                        />
                    ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 text-white/60">
                            <VideoIcon className="h-10 w-10" aria-hidden="true" />
                            <p className="text-sm">
                                {t('aide.video_a_venir', 'Vidéo à venir — la scolarité la mettra en ligne prochainement.')}
                            </p>
                        </div>
                    )}
                    <EditableVideo contentKey="aide_inscription_video_path" value={video} />
                </div>

                {video && (
                    <div className="mt-5 flex justify-center">
                        <a
                            href={`/${video}`}
                            download
                            className="flex items-center gap-2 rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            {t('aide.telecharger_video', 'Télécharger la vidéo')}
                        </a>
                    </div>
                )}
            </main>

            <EtapesInscription />

            <Footer />
        </div>
    );
}
