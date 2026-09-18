import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

export default function Hero({ slides }) {
    const { t } = useTranslations();
    const [active, setActive] = useState(0);
    const safeSlides = slides.length > 0 ? slides : [{ image_path: 'images/slide1.jpg' }];

    useEffect(() => {
        if (safeSlides.length < 2) return;
        const timer = setInterval(() => {
            setActive((current) => (current + 1) % safeSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [safeSlides.length]);

    return (
        <section id="accueil" className="relative flex h-[92vh] min-h-[560px] items-center justify-center overflow-hidden bg-isstm-navy-dark text-white">
            {safeSlides.map((slide, index) => (
                <img
                    key={slide.image_path}
                    src={`/${slide.image_path}`}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                        index === active ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-isstm-navy-dark/80 via-isstm-navy-dark/60 to-isstm-navy-dark/90" />

            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                <h1 className="font-script text-5xl leading-tight text-balance text-isstm-gold drop-shadow-[2px_2px_5px_rgba(0,0,0,0.5)] sm:text-6xl">
                    <span className="align-top text-[1.15em] leading-none text-isstm-gold" aria-hidden="true">
                        &ldquo;
                    </span>
                    {t('accueil.hero_titre_ligne1', "L'excellence technique")}
                    <br />
                    {t('accueil.hero_titre_ligne2', 'au service de votre avenir')}
                    <span className="align-bottom text-[1.15em] leading-none text-isstm-gold" aria-hidden="true">
                        &rdquo;
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
                    {t(
                        'accueil.hero_soustitre',
                        "L'Institut Supérieur des Sciences, Techniques et Management forme les ingénieurs et techniciens de demain à Mahajanga, Madagascar.",
                    )}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/inscription"
                        className="rounded-full bg-isstm-gold px-7 py-3 text-sm font-semibold text-isstm-navy-dark shadow-lg transition hover:brightness-110"
                    >
                        {t('nav.inscrivez_vous', 'Inscrivez-vous')}
                    </Link>
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
