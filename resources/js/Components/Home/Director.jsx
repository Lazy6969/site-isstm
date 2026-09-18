import { Link } from '@inertiajs/react';
import { ArrowRight, Quote } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

export default function Director({ content }) {
    const { t } = useTranslations();

    return (
        <section className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[220px_1fr]">
                <img
                    src={`/${content.directeur_image_path ?? 'images/directeur.jpg'}`}
                    alt={t('accueil.directeur_photo_alt', "Photo du Directeur de l'ISSTM")}
                    className="mx-auto h-44 w-44 rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/40 md:h-52 md:w-52"
                    loading="lazy"
                />
                <div>
                    <h2 className="text-xl font-bold text-isstm-navy sm:text-2xl">{t('accueil.mot_directeur_titre', 'Le mot du Directeur')}</h2>
                    <blockquote className="mt-3 flex gap-2.5 text-sm leading-relaxed text-slate-600 italic">
                        <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <span className="line-clamp-3">{content.mot_directeur_contenu}</span>
                    </blockquote>
                    <p className="mt-4 text-sm font-semibold text-isstm-navy">
                        {content.directeur_nom}
                        <span className="ml-1.5 font-normal text-slate-500">{t('accueil.directeur_fonction', "Directeur de l'ISSTM")}</span>
                    </p>
                    <Link
                        href="/mot-du-directeur"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-navy hover:text-isstm-gold"
                    >
                        {t('accueil.lire_la_suite', 'Lire la suite')}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
