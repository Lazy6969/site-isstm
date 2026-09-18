import { Link } from '@inertiajs/react';
import { ArrowRight, Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

export default function Director({ content }) {
    const { t } = useTranslations();
    const imgRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.3 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="bg-white px-6 py-20 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[220px_1fr]">
                    <div className="text-center" ref={imgRef}>
                        <img
                            src={`/${content.directeur_image_path ?? 'images/directeur.jpg'}`}
                            alt={t('accueil.directeur_photo_alt', "Photo du Directeur de l'ISSTM")}
                            className={`mx-auto h-44 w-44 rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/40 transition-all duration-700 ease-out md:h-52 md:w-52 ${
                                visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                            }`}
                            loading="lazy"
                        />
                        <p className="mt-3 text-xs font-semibold tracking-wide text-isstm-gold uppercase">
                            {t('accueil.directeur_fonction', "Directeur de l'ISSTM")}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                            {t('accueil.mot_directeur_titre', 'Le mot du Directeur')}
                        </h2>
                        <blockquote className="mt-3 flex gap-2.5 text-sm leading-relaxed text-slate-600 italic dark:text-slate-300">
                            <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                            <span className="line-clamp-3">{content.mot_directeur_contenu}</span>
                        </blockquote>
                        <p className="mt-4 text-sm font-semibold text-isstm-navy dark:text-white">{content.directeur_nom}</p>
                        <Link
                            href="/mot-du-directeur"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:text-isstm-gold dark:text-white"
                        >
                            {t('accueil.lire_la_suite', 'Lire la suite')}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
