import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';

export default function MissionVision({ content }) {
    const { t } = useTranslations();
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    const blocks = [
        {
            title: content.mission_titre,
            titleKey: 'mission_titre',
            text: content.mission_contenu,
            contentKey: 'mission_contenu',
            image: content.mission_image_path ?? 'images/mission.jpg',
            imageKey: 'mission_image_path',
            reverse: false,
        },
        {
            title: content.vision_titre,
            titleKey: 'vision_titre',
            text: content.vision_contenu,
            contentKey: 'vision_contenu',
            image: content.vision_image_path ?? 'images/vision.jpg',
            imageKey: 'vision_image_path',
            reverse: true,
        },
    ];

    function restartAuto() {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % blocks.length), 6000);
    }

    useEffect(() => {
        restartAuto();
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function goTo(index) {
        setCurrent(index);
        restartAuto();
    }

    return (
        <section className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl px-6">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-100 shadow-xl dark:bg-slate-800">
                    <div className="relative min-h-[600px] sm:min-h-[520px] md:min-h-[420px]">
                        {blocks.map((block, index) => {
                            const active = index === current;

                            return (
                                <div
                                    key={block.title}
                                    aria-hidden={!active}
                                    className={`absolute inset-0 z-20 flex flex-col transition-transform duration-700 ease-in-out md:grid md:grid-cols-2 ${
                                        active
                                            ? 'translate-x-0'
                                            : `pointer-events-none ${block.reverse ? 'translate-x-full' : '-translate-x-full'}`
                                    }`}
                                >
                                    <div
                                        className={`relative z-20 flex flex-col justify-center bg-isstm-navy px-8 py-14 sm:px-12 sm:py-20 ${
                                            block.reverse ? 'md:order-2' : ''
                                        }`}
                                    >
                                        <h3 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                                            <EditableText as="span" contentKey={block.titleKey}>
                                                {block.title}
                                            </EditableText>
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
                                            className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-isstm-navy transition hover:brightness-95"
                                        >
                                            {t('filieres.en_savoir_plus', 'En savoir plus')}
                                        </Link>
                                    </div>

                                    <div
                                        className={`relative z-0 min-h-[220px] flex-1 md:h-auto md:min-h-0 ${block.reverse ? 'md:order-1' : ''}`}
                                    >
                                        <img src={`/${block.image}`} alt="" className="h-full w-full object-cover" loading="lazy" />
                                        {active && <EditableImage contentKey={block.imageKey} value={block.image} />}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2 md:bottom-6">
                            {blocks.map((b, i) => (
                                <button
                                    key={b.title}
                                    type="button"
                                    onClick={() => goTo(i)}
                                    aria-label={b.title}
                                    className={`h-2 rounded-full shadow transition-all ${
                                        i === current ? 'w-8 bg-isstm-gold' : 'w-2 bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
