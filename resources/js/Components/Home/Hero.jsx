import { useEffect, useState } from 'react';

export default function Hero({ slides }) {
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
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                    L'excellence technique
                    <br />
                    au service de votre avenir
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
                    L'Institut Supérieur des Sciences, Techniques et Management forme les ingénieurs
                    et techniciens de demain à Mahajanga, Madagascar.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <a
                        href="#contact"
                        className="rounded-full bg-isstm-gold px-7 py-3 text-sm font-semibold text-isstm-navy-dark shadow-lg transition hover:brightness-110"
                    >
                        Inscrivez-vous
                    </a>
                    <a
                        href="#contact"
                        className="rounded-full border border-white/70 px-7 py-3 text-sm font-semibold transition hover:bg-white hover:text-isstm-navy"
                    >
                        Se connecter
                    </a>
                </div>
            </div>

            {safeSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {safeSlides.map((slide, index) => (
                        <button
                            key={slide.image_path}
                            type="button"
                            aria-label={`Aller à la diapositive ${index + 1}`}
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
