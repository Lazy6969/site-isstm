import { useTranslations } from '../../lib/useTranslations';

export default function Partenaires({ partenaires }) {
    const { t } = useTranslations();

    if (!partenaires || partenaires.length === 0) return null;

    const track = [...partenaires, ...partenaires];

    return (
        <section className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-6 text-center">
                <h2 className="text-2xl font-bold text-isstm-navy sm:text-3xl">{t('partenaires.titre', 'Nos Partenaires')}</h2>
                <p className="mt-2 text-slate-500">
                    {t('partenaires.soustitre', "L'ISSTM collabore avec des institutions académiques et professionnelles de renom.")}
                </p>
            </div>

            <div className="partenaires-marquee mt-10 overflow-hidden">
                <div className="partenaires-track flex w-max items-center gap-14">
                    {track.map((partenaire, index) => (
                        <a
                            key={`${partenaire.nom}-${index}`}
                            href={partenaire.site_url}
                            target="_blank"
                            rel="noopener"
                            title={partenaire.nom}
                            className="flex h-20 w-40 flex-shrink-0 items-center justify-center grayscale opacity-75 transition hover:scale-105 hover:opacity-100 hover:grayscale-0"
                        >
                            <img src={`/${partenaire.logo_path}`} alt={partenaire.nom} className="max-h-full max-w-full object-contain" loading="lazy" />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
