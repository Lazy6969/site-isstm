import { Quote } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function Testimonials({ testimonials }) {
    const { t } = useTranslations();
    const [active, setActive] = useState(0);
    if (testimonials.length === 0) return null;
    const current = testimonials[active];

    return (
        <section id="temoignages" className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center text-2xl font-bold text-isstm-navy sm:text-3xl">
                {t('accueil.temoignages_titre', "Paroles d'étudiants")}
            </h2>

            <div className="mt-10 flex flex-col items-center gap-8 rounded-3xl bg-isstm-navy p-8 text-white sm:flex-row sm:p-10">
                <div className="flex shrink-0 -space-x-4">
                    {testimonials.map((testimonial, index) => (
                        <button
                            key={testimonial.author_name}
                            type="button"
                            onClick={() => setActive(index)}
                            aria-label={`${t('accueil.voir_temoignage', 'Voir le témoignage de')} ${testimonial.author_name}`}
                            className={`rounded-full ring-4 transition ${
                                index === active ? 'z-10 scale-110 ring-isstm-gold' : 'ring-isstm-navy/60 opacity-60'
                            }`}
                        >
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`/${testimonial.image_path}`} alt="" loading="lazy" />
                                <AvatarFallback>{testimonial.author_name?.[0]}</AvatarFallback>
                            </Avatar>
                        </button>
                    ))}
                </div>

                <div>
                    <p className="flex gap-2 text-lg leading-relaxed text-white/90">
                        <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <span>{current.quote}</span>
                    </p>
                    <p className="mt-4 font-semibold text-isstm-gold">{current.author_name}</p>
                    <p className="text-sm text-white/70">{current.program}</p>
                </div>
            </div>

            {testimonials.length > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {testimonials.map((testimonial, index) => (
                        <button
                            key={testimonial.author_name}
                            type="button"
                            onClick={() => setActive(index)}
                            aria-label={`${t('accueil.temoignage_numero', 'Témoignage')} ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all ${
                                index === active ? 'w-8 bg-isstm-navy' : 'w-2.5 bg-slate-300'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
