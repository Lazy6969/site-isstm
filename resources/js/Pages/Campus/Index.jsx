import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ blocs }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Campus" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <Link href="/vie-etudiante" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('nav.vie_etudiante', 'Vie étudiante')}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold">{t('campus.titre', 'La Vie au Campus')}</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        {t('campus.soustitre', "L'université est un melting-pot culturel :")} {blocs.length}{' '}
                        {t(
                            'campus.soustitre_suite',
                            'associations régionales, appelées « blocs », représentent la diversité et la solidarité des étudiants venus de toute Madagascar.',
                        )}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {blocs.map((bloc) => (
                        <Link key={bloc.bloc_key} href={`/campus/${bloc.bloc_key}`} className="group block">
                            <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                                <div
                                    className="h-28 bg-cover bg-center bg-isstm-navy/10"
                                    style={bloc.images?.[0] ? { backgroundImage: `url('/${bloc.images[0]}')` } : undefined}
                                />
                                <div className="p-3">
                                    <h2 className="truncate text-sm font-semibold text-isstm-navy">{bloc.nom}</h2>
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{bloc.signification}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
