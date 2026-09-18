import { useTranslations } from '../../lib/useTranslations';

export default function MissionVision({ content }) {
    const { t } = useTranslations();
    const blocks = [
        {
            title: t('accueil.mission_titre', 'Notre Mission'),
            text: content.mission_contenu,
            image: content.mission_image_path ?? 'images/mission.jpg',
        },
        {
            title: t('accueil.vision_titre', 'Notre Vision'),
            text: content.vision_contenu,
            image: content.vision_image_path ?? 'images/vision.jpg',
        },
    ];

    return (
        <section className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl space-y-16 px-6 sm:space-y-24">
                {blocks.map((block, index) => (
                    <div key={block.title} className="grid grid-cols-1 items-center gap-8 sm:gap-12 md:grid-cols-2">
                        <div
                            className={`aspect-[4/3] overflow-hidden rounded-2xl bg-isstm-navy/5 dark:bg-slate-800 ${
                                index % 2 === 1 ? 'md:order-2' : ''
                            }`}
                        >
                            <img src={`/${block.image}`} alt="" className="h-full w-full object-contain" loading="lazy" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">{block.title}</h3>
                            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">{block.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
