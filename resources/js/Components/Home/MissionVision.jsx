import { useTranslations } from '../../lib/useTranslations';

export default function MissionVision({ content }) {
    const { t } = useTranslations();
    const blocks = [
        {
            title: t('accueil.mission_titre', 'Notre Mission'),
            text: content.mission_contenu,
            image: content.mission_image_path ?? 'images/mission.jpg',
            align: 'left',
        },
        {
            title: t('accueil.vision_titre', 'Notre Vision'),
            text: content.vision_contenu,
            image: content.vision_image_path ?? 'images/vision.jpg',
            align: 'right',
        },
    ];

    return (
        <section className="flex flex-col shadow-[inset_0_10px_15px_-10px_rgba(0,0,0,0.5),inset_0_-10px_15px_-10px_rgba(0,0,0,0.5)]">
            {blocks.map((block) => (
                <div
                    key={block.title}
                    className={`relative flex min-h-[60vh] items-center overflow-hidden bg-fixed bg-cover bg-center px-6 py-20 text-white ${
                        block.align === 'left' ? 'border-b-[3px] border-isstm-gold' : ''
                    }`}
                    style={{ backgroundImage: `url('/${block.image}')` }}
                >
                    <div className="absolute inset-0 bg-isstm-navy-dark/45" />
                    <div className="relative mx-auto w-full max-w-6xl">
                        <div
                            className={`max-w-lg rounded-2xl bg-isstm-navy-dark/35 p-7 backdrop-blur-md sm:p-9 ${
                                block.align === 'right' ? 'ml-auto text-right' : ''
                            }`}
                        >
                            <h3 className="text-xl font-bold text-isstm-gold sm:text-2xl">{block.title}</h3>
                            <p className="mt-4 leading-relaxed text-white/90">{block.text}</p>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
