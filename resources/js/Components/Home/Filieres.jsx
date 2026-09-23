import { Link } from '@inertiajs/react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function Filieres({ filieres }) {
    const { t } = useTranslations();

    if (filieres.length === 0) return null;

    return (
        <section id="filieres" className="bg-white py-12 sm:py-20 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-isstm-navy sm:text-3xl dark:text-white">
                            <GraduationCap className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                            {t('accueil.filieres_titre', 'Nos filières')}
                        </h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            {t('accueil.filieres_soustitre', "Des formations d'ingénieurs et de techniciens reconnues.")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filieres.map((filiere) => (
                        <Link key={filiere.slug} href={`/filieres/${filiere.slug}`}>
                            <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="h-28 overflow-hidden">
                                    <div
                                        className="h-full w-full scale-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url('/${filiere.image_path}')` }}
                                    />
                                </div>
                                <CardContent className="p-3.5 transition-transform duration-300 group-hover:scale-[1.03]">
                                    {filiere.mention && (
                                        <Badge className="px-2 py-0 text-[0.65rem]">{filiere.mention}</Badge>
                                    )}
                                    <h3 className="mt-2 text-sm font-semibold text-isstm-navy group-hover:text-isstm-gold dark:text-white">
                                        {filiere.nom}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{filiere.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/filieres"
                        className="inline-flex items-center gap-2 rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                    >
                        {t('filieres.toutes_les_filieres', 'Toutes les filières')}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
