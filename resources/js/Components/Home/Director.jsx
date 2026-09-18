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
        <section className="bg-white px-6 py-12 sm:py-20 dark:bg-slate-950">
            <div className="mx-auto max-w-4xl">
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left md:gap-10">
                    <div className="flex-shrink-0" ref={imgRef}>
                        <img
                            src={`/${content.directeur_image_path ?? 'images/directeur.jpg'}`}
                            alt={t('accueil.directeur_photo_alt', "Photo du Directeur de l'ISSTM")}
                            className={`mx-auto h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/40 transition-all duration-700 ease-out sm:h-36 sm:w-36 md:h-44 md:w-44 ${
                                visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                            }`}
                            loading="lazy"
                        />
                        <p className="mt-3 text-xs font-semibold tracking-wide text-isstm-gold uppercase">
                            {t('accueil.directeur_fonction', "Directeur de l'ISSTM")}
                        </p>
                    </div>
                    <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                        <h2 className="text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                            {t('accueil.mot_directeur_titre', 'Le mot du Directeur')}
                        </h2>
                        <blockquote className="mt-3 flex justify-center gap-2.5 text-sm leading-relaxed text-slate-600 italic sm:justify-start dark:text-slate-300">
                            <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                            <span className="line-clamp-3 text-left">{content.mot_directeur_contenu}</span>
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
