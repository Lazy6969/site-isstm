import { Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

const BG_TINTS = ['#fbf3e3', '#e6ecf2', '#e3f9ec', '#f1e6f7'];

export default function Testimonials({ testimonials }) {
    const { t } = useTranslations();
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);
    const total = testimonials.length;

    function restartAuto() {
        clearInterval(timerRef.current);
        if (total > 1) {
            timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), 5000);
        }
    }

    useEffect(() => {
        restartAuto();
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total]);

    if (total === 0) return null;

    function goTo(index) {
        setCurrent(index);
        restartAuto();
    }

    return (
        <section id="temoignages" className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
            <div className="mx-auto max-w-4xl px-6">
                <h2 className="mb-12 text-center text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                    {t('accueil.temoignages_titre', "Paroles d'étudiants")}
                </h2>

                <div
                    className="relative flex flex-col items-center gap-6 rounded-[63%_37%_41%_59%/47%_60%_40%_53%] px-5 py-10 transition-colors duration-700 sm:flex-row sm:gap-14 sm:px-16 sm:py-14"
                    style={{ backgroundColor: BG_TINTS[current % BG_TINTS.length] }}
                >
                    <div className="relative z-20 h-40 w-40 flex-shrink-0 sm:h-56 sm:w-56" style={{ perspective: '1400px' }}>
                        {testimonials.map((testimonial, index) => {
                            const dist = (index - current + total) % total;
                            if (dist > 2) return null;

                            const styles = [
                                { transform: 'translate(0, 0) rotateY(0deg) scale(1)', opacity: 1, zIndex: 5 },
                                { transform: 'translate(28px, -22px) rotateY(20deg) scale(0.88)', opacity: 0.9, zIndex: 4 },
                                { transform: 'translate(50px, -36px) rotateY(30deg) scale(0.78)', opacity: 0.55, zIndex: 3 },
                            ][dist];

                            return (
                                <div
                                    key={testimonial.author_name}
                                    className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl transition-[transform,opacity] duration-700"
                                    style={{ ...styles, transformStyle: 'preserve-3d' }}
                                >
                                    <img src={`/${testimonial.image_path}`} alt="" className="h-full w-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative min-h-[9rem] flex-1">
                        <Quote className="mb-2.5 h-8 w-8 text-isstm-gold/60" aria-hidden="true" />
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.author_name}
                                className={`transition-[opacity,transform] duration-700 ${
                                    index === current
                                        ? 'relative translate-x-0 opacity-100'
                                        : 'pointer-events-none absolute inset-x-0 top-0 translate-x-4 opacity-0'
                                }`}
                            >
                                <blockquote className="font-serif text-xl italic leading-relaxed text-isstm-navy">{testimonial.quote}</blockquote>
                                <p className="mt-4 text-lg font-bold text-isstm-navy">{testimonial.author_name}</p>
                                <p className="text-sm text-slate-500">{testimonial.program}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {total > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {testimonials.map((testimonial, index) => (
                            <button
                                key={testimonial.author_name}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`${t('accueil.temoignage_numero', 'Témoignage')} ${index + 1}`}
                                className={`h-2.5 rounded-full transition-all ${
                                    index === current ? 'w-8 bg-isstm-navy' : 'w-2.5 bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
