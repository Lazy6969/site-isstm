import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card, CardContent } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ filieres }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Filières" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-3xl font-bold">{t('filieres.titre', 'Nos filières')}</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        {t(
                            'filieres.soustitre',
                            "L'ISSTM forme des ingénieurs et techniciens dans un large éventail de disciplines scientifiques et techniques.",
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filieres.map((filiere) => (
                        <Link key={filiere.slug} href={`/filieres/${filiere.slug}`} className="group block">
                            <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url('/${filiere.image_path}')` }} />
                                <CardContent className="p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {filiere.mention && <Badge>{filiere.mention}</Badge>}
                                        {filiere.niveaux && <Badge variant="outline">{filiere.niveaux}</Badge>}
                                    </div>
                                    <h2 className="mt-3 text-lg font-semibold text-isstm-navy">{filiere.nom}</h2>
                                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{filiere.description}</p>
                                    <span className="mt-3 flex items-center gap-1 text-sm font-medium text-isstm-navy group-hover:underline">
                                        {t('filieres.en_savoir_plus', 'En savoir plus')}
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
