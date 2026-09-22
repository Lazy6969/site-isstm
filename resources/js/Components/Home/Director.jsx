import { Link } from '@inertiajs/react';
import { ArrowRight, Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';

export default function Director({ content }) {
    const { t } = useTranslations();
    const imgRef = useRef(null);
    const [visible, setVisible] = useState(false);

    const directeurImage = content.directeur_image_path ?? 'images/directeur.jpg';

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { threshold: 0.3 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <section className="bg-white px-6 py-12 sm:py-20 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[220px_1fr]">
                    <div
                        className="relative mx-auto h-44 w-44 md:h-52 md:w-52"
                        ref={imgRef}
                    >
                        <div
                            aria-hidden="true"
                            className={`absolute -top-3 -left-3 h-full w-full rounded-2xl border-2 border-isstm-gold transition-all duration-700 ease-out ${
                                visible ? 'translate-0 opacity-100' : 'translate-x-2 translate-y-2 opacity-0'
                            }`}
                        />
                        <img
                            src={`/${directeurImage}`}
                            alt={t(
                                'accueil.directeur_photo_alt',
                                "Photo du Directeur de l'ISSTM",
                            )}
                            className={`relative h-full w-full rounded-2xl object-cover shadow-xl ring-1 ring-black/5 transition-all duration-700 ease-out dark:ring-white/10 ${
                                visible
                                    ? 'scale-100 opacity-100'
                                    : 'scale-90 opacity-0'
                            }`}
                            loading="lazy"
                        />

                        <EditableImage
                            contentKey="directeur_image_path"
                            value={directeurImage}
                        />

                        <p className="mt-3 text-center text-xs font-semibold tracking-wide text-isstm-gold uppercase">
                            {t(
                                'accueil.directeur_fonction',
                                "Directeur de l'ISSTM",
                            )}
                        </p>
                    </div>

                    <div className="w-full min-w-0">
                        <h2 className="text-xl font-bold text-isstm-navy sm:text-2xl dark:text-white">
                            {t(
                                'accueil.mot_directeur_titre',
                                'Le mot du Directeur',
                            )}
                        </h2>

                        <blockquote className="mt-3 flex gap-2.5 text-sm leading-relaxed text-slate-600 italic dark:text-slate-300">
                            <Quote
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold"
                                aria-hidden="true"
                            />

                            <EditableText
                                as="span"
                                contentKey="mot_directeur_contenu"
                                className="line-clamp-3"
                            >
                                {content.mot_directeur_contenu}
                            </EditableText>
                        </blockquote>

                        <p className="mt-4 text-sm font-semibold text-isstm-navy dark:text-white">
                            <EditableText
                                as="span"
                                contentKey="directeur_nom"
                            >
                                {content.directeur_nom}
                            </EditableText>

                            <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">
                                {t(
                                    'accueil.directeur_fonction',
                                    "Directeur de l'ISSTM",
                                )}
                            </span>
                        </p>

                        <Link
                            href="/mot-du-directeur"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:text-isstm-gold dark:text-white"
                        >
                            {t(
                                'accueil.lire_la_suite',
                                'Lire la suite',
                            )}
                            <ArrowRight
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}