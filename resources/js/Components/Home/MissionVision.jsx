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
        <section className="flex flex-col">
            {blocks.map((block) => (
                <div
                    key={block.title}
                    className="relative flex min-h-[360px] items-center bg-cover bg-center"
                    style={{ backgroundImage: `url('/${block.image}')` }}
                >
                    <div className="absolute inset-0 bg-isstm-navy-dark/70" />
                    <div className="relative mx-auto w-full max-w-6xl px-6">
                        <div
                            className={`max-w-lg rounded-2xl bg-white/10 p-8 text-white backdrop-blur-sm ${
                                block.align === 'right' ? 'ml-auto text-right' : ''
                            }`}
                        >
                            <h3 className="text-2xl font-bold text-isstm-gold">{block.title}</h3>
                            <p className="mt-4 leading-relaxed text-white/90">{block.text}</p>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
