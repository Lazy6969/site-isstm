import { usePage } from '@inertiajs/react';
import EditableText from '../QuickEdit/EditableText';

export default function Partenaires({ partenaires }) {
    const { content } = usePage().props;

    if (!partenaires || partenaires.length === 0) return null;

    const track = [...partenaires, ...partenaires];

    return (
        <section className="bg-white py-10 sm:py-16 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-6 text-center">
                <h2 className="text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                    <EditableText as="span" contentKey="accueil_partenaires_titre">
                        {content.accueil_partenaires_titre}
                    </EditableText>
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    <EditableText as="span" contentKey="accueil_partenaires_soustitre">
                        {content.accueil_partenaires_soustitre}
                    </EditableText>
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
