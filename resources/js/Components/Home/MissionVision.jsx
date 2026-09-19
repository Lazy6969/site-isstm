import { Link } from '@inertiajs/react';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';

const BLOB_PATHS = {
    left: 'M0,0 H68 C80,15 60,30 75,45 C85,60 65,75 78,90 C82,95 75,100 70,100 H0 Z',
    right: 'M100,0 H32 C20,15 40,30 25,45 C15,60 35,75 22,90 C18,95 25,100 30,100 H100 Z',
};

export default function MissionVision({ content }) {
    const { t } = useTranslations();

    const blocks = [
        {
            title: t('accueil.mission_titre', 'Notre Mission'),
            text: content.mission_contenu,
            contentKey: 'mission_contenu',
            image: content.mission_image_path ?? 'images/mission.jpg',
            imageKey: 'mission_image_path',
            align: 'left',
        },
        {
            title: t('accueil.vision_titre', 'Notre Vision'),
            text: content.vision_contenu,
            contentKey: 'vision_contenu',
            image: content.vision_image_path ?? 'images/vision.jpg',
            imageKey: 'vision_image_path',
            align: 'right',
        },
    ];

    return (
        <section className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl space-y-12 px-6">
                {blocks.map((block, index) => {
                    const reverse = index % 2 === 1;

                    return (
                        <div
                            key={block.title}
                            className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl dark:bg-slate-800"
                        >
                            <div className="relative grid grid-cols-1 md:min-h-[420px] md:grid-cols-2">
                                <div
                                    className={`relative z-20 bg-isstm-navy px-8 py-14 sm:px-12 sm:py-20 ${
                                        reverse ? 'md:order-2' : ''
                                    }`}
                                >
                                    <span
                                        className="mb-5 flex gap-1.5"
                                        aria-hidden="true"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-isstm-gold" />
                                        <span className="h-2 w-2 rounded-full bg-white/40" />
                                        <span className="h-2 w-2 rounded-full bg-white/40" />
                                    </span>

                                    <h3 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                                        {block.title}
                                    </h3>

                                    <EditableText
                                        as="p"
                                        contentKey={block.contentKey}
                                        className="mt-5 max-w-md leading-relaxed text-white/80"
                                    >
                                        {block.text}
                                    </EditableText>

                                    <Link
                                        href="/historique"
                                        className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-isstm-navy transition hover:brightness-95"
                                    >
                                        {t(
                                            'filieres.en_savoir_plus',
                                            'En savoir plus',
                                        )}
                                    </Link>
                                </div>

                                <div
                                    className={`relative h-64 md:h-auto ${
                                        reverse ? 'md:order-1' : ''
                                    }`}
                                >
                                    <img
                                        src={`/${block.image}`}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover"
                                        loading="lazy"
                                    />

                                    <EditableImage
                                        contentKey={block.imageKey}
                                        value={block.image}
                                    />
                                </div>
                            </div>

                            <svg
                                className={`pointer-events-none absolute inset-y-0 z-10 hidden h-full w-[70%] text-isstm-navy md:block ${
                                    reverse ? 'right-0' : 'left-0'
                                }`}
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <path
                                    d={
                                        reverse
                                            ? BLOB_PATHS.right
                                            : BLOB_PATHS.left
                                    }
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}