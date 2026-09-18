import { GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function Filieres({ filieres }) {
    const { t } = useTranslations();

    if (filieres.length === 0) return null;

    return (
        <section id="filieres" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-isstm-navy sm:text-3xl">
                            <GraduationCap className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                            {t('accueil.filieres_titre', 'Nos filières')}
                        </h2>
                        <p className="mt-2 text-slate-500">
                            {t('accueil.filieres_soustitre', "Des formations d'ingénieurs et de techniciens reconnues.")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filieres.map((filiere) => (
                        <Card
                            key={filiere.slug}
                            className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div
                                className="h-40 bg-cover bg-center"
                                style={{ backgroundImage: `url('/${filiere.image_path}')` }}
                            />
                            <CardContent className="p-5">
                                {filiere.mention && <Badge>{filiere.mention}</Badge>}
                                <h3 className="mt-3 text-lg font-semibold text-isstm-navy">{filiere.nom}</h3>
                                <p className="mt-2 line-clamp-3 text-sm text-slate-500">{filiere.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
