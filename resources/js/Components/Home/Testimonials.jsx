import { useState } from 'react';

export default function Testimonials({ testimonials }) {
    const [active, setActive] = useState(0);
    if (testimonials.length === 0) return null;
    const current = testimonials[active];

    return (
        <section id="temoignages" className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-center text-2xl font-bold text-isstm-navy sm:text-3xl">Paroles d'étudiants</h2>

            <div className="mt-10 flex flex-col items-center gap-8 rounded-3xl bg-isstm-navy p-8 text-white sm:flex-row sm:p-10">
                <div className="flex shrink-0 -space-x-4">
                    {testimonials.map((testimonial, index) => (
                        <button
                            key={testimonial.author_name}
                            type="button"
                            onClick={() => setActive(index)}
                            aria-label={`Voir le témoignage de ${testimonial.author_name}`}
                            className={`h-16 w-16 overflow-hidden rounded-full ring-4 transition ${
                                index === active ? 'ring-isstm-gold z-10 scale-110' : 'ring-isstm-navy/60 opacity-60'
                            }`}
                        >
                            <img src={`/${testimonial.image_path}`} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                    ))}
                </div>

                <div>
                    <p className="text-lg leading-relaxed text-white/90">"{current.quote}"</p>
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
                            aria-label={`Témoignage ${index + 1}`}
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
