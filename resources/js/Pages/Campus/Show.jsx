import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Quote } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

function Fact({ label, value }) {
    if (!value) return null;

    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{value}</dd>
        </div>
    );
}

export default function Show({ bloc }) {
    const { t } = useTranslations();
    const images = bloc.images ?? [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={bloc.nom} />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <Link href="/campus" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('campus.tous_les_blocs', 'Tous les blocs')}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold">{bloc.nom}</h1>
                    {bloc.signification && <p className="mt-2 max-w-2xl text-white/80">{bloc.signification}</p>}
                    {bloc.slogan && (
                        <p className="mt-3 flex items-center gap-1.5 text-sm italic text-isstm-gold">
                            <Quote className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {bloc.slogan}
                        </p>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {images.length > 0 && (
                    <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {images.map((image) => (
                            <div key={image} className="h-40 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('/${image}')` }} />
                        ))}
                    </div>
                )}

                <Card className="p-7">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Fact label={t('campus.fondation', 'Fondation')} value={bloc.fondation} />
                        <Fact label={t('campus.fondateurs', 'Fondateurs')} value={bloc.fondateurs} />
                        <Fact label={t('campus.danses', 'Danses')} value={bloc.danse} />
                        <Fact label={t('campus.distinction', 'Ce qui les distingue')} value={bloc.mampiavaka} />
                    </dl>
                </Card>

                <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {bloc.objectifs && (
                        <div>
                            <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{t('campus.objectifs', 'Objectifs')}</h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{bloc.objectifs}</p>
                        </div>
                    )}
                    {bloc.activites && (
                        <div>
                            <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{t('campus.activites', 'Activités')}</h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{bloc.activites}</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
