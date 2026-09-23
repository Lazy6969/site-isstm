import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../QuickEdit/EditableText';
import EditableButton from '../QuickEdit/EditableButton';

const IMAGE_DURATION_MS = 5000;
const IMAGE_ZOOM_DURATION_MS = 9000;

export default function Hero({ slides }) {
    const { t } = useTranslations();
    const { content } = usePage().props;
    const [active, setActive] = useState(0);
    // The very first slide mounts already "active" — without this, its zoom
    // class would be present on the first paint, so the scale-100→scale-110
    // transition would have nothing to animate from and the zoom would never
    // play. Flipping this true one frame after mount gives it a real
    // transition to run, just like every later slide already gets when it
    // becomes active.
    const [zoomReady, setZoomReady] = useState(false);
    const safeSlides = slides.length > 0 ? slides : [{ image_path: 'images/slide1.jpg', media_type: 'image' }];
    const timerRef = useRef(null);
    const videoRefs = useRef({});

    function goToNext() {
        setActive((current) => (current + 1) % safeSlides.length);
    }

    useEffect(() => {
        const frame = requestAnimationFrame(() => setZoomReady(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    // Image slides advance on a fixed timer; video slides advance themselves
    // once playback reaches the end (see the <video>'s onEnded below), so no
    // timer is started for them here — the video's own length drives the pace.
    useEffect(() => {
        clearTimeout(timerRef.current);
        if (safeSlides.length < 2) {
            return;
        }

        const currentSlide = safeSlides[active];
        if (currentSlide.media_type === 'video') {
            const videoEl = videoRefs.current[active];
            if (videoEl) {
                videoEl.currentTime = 0;
                videoEl.play().catch(() => {});
            }
            return;
        }

        timerRef.current = setTimeout(goToNext, IMAGE_DURATION_MS);
        return () => clearTimeout(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, safeSlides.length]);

    return (
        <section id="accueil" className="relative flex h-[92vh] min-h-[560px] items-center justify-center overflow-hidden bg-isstm-navy-dark text-white">
            {safeSlides.map((slide, index) =>
                slide.media_type === 'video' ? (
                    <video
                        key={slide.image_path}
                        ref={(el) => {
                            videoRefs.current[index] = el;
                        }}
                        src={`/${slide.image_path}`}
                        muted
                        playsInline
                        preload={index === active ? 'auto' : 'metadata'}
                        onEnded={() => index === active && goToNext()}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                            index === active ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                ) : (
                    <img
                        key={slide.image_path}
                        src={`/${slide.image_path}`}
                        alt=""
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className={`absolute inset-0 h-full w-full object-cover ${
                            index === active ? (zoomReady ? 'scale-110 opacity-100' : 'scale-100 opacity-100') : 'scale-100 opacity-0'
                        }`}
                        style={{
                            transitionProperty: 'opacity, transform',
                            transitionDuration: `1000ms, ${IMAGE_ZOOM_DURATION_MS}ms`,
                            transitionTimingFunction: 'ease, linear',
                        }}
                    />
                ),
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-isstm-navy-dark/55 via-isstm-navy-dark/35 to-isstm-navy-dark/70" />

            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                <h1 className="font-script text-5xl leading-tight text-balance text-isstm-gold drop-shadow-[2px_2px_5px_rgba(0,0,0,0.5)] sm:text-6xl">
                    <span className="align-top text-[1.15em] leading-none text-isstm-gold" aria-hidden="true">
                        &ldquo;
                    </span>
                    <EditableText as="span" contentKey="accueil_hero_titre_ligne1">
                        {content.accueil_hero_titre_ligne1}
                    </EditableText>
                    <br />
                    <EditableText as="span" contentKey="accueil_hero_titre_ligne2">
                        {content.accueil_hero_titre_ligne2}
                    </EditableText>
                    <span className="align-bottom text-[1.15em] leading-none text-isstm-gold" aria-hidden="true">
                        &rdquo;
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
                    <EditableText as="span" contentKey="accueil_hero_soustitre">
                        {content.accueil_hero_soustitre}
                    </EditableText>
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <EditableButton
                        contentKey="accueil_hero_bouton"
                        href="/inscription"
                        defaultLabel={t('nav.inscrivez_vous', 'Inscrivez-vous')}
                        className="rounded-full bg-isstm-gold px-7 py-3 text-sm font-semibold text-isstm-navy-dark shadow-lg transition hover:brightness-110"
                    />
                </div>
            </div>

            {safeSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {safeSlides.map((slide, index) => (
                        <button
                            key={slide.image_path}
                            type="button"
                            aria-label={`${t('accueil.aller_diapositive', 'Aller à la diapositive')} ${index + 1}`}
                            onClick={() => setActive(index)}
                            className={`h-2.5 rounded-full transition-all ${
                                index === active ? 'w-8 bg-isstm-gold' : 'w-2.5 bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
