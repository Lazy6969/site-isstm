import { Head, Link, usePage } from '@inertiajs/react';
import { Download, FileText, Lock } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import OrgNode from '../Components/Parcours/OrgNode';
import { administrativePole, cursusLadder, direction, pedagogicalPole } from '../Components/Parcours/orgChartData';
import { Card } from '../Components/ui/card';
import { useTranslations } from '../lib/useTranslations';

export default function Parcours() {
    const { auth } = usePage().props;
    const { t } = useTranslations();
    const isLoggedIn = Boolean(auth?.user);

    const documents = [
        {
            title: t('parcours.doc_organigramme_titre', 'Organigramme Complet'),
            desc: t('parcours.doc_organigramme_desc', "La structure organisationnelle complète de l'institut."),
        },
        {
            title: t('parcours.doc_cursus_titre', 'Cursus Académique'),
            desc: t('parcours.doc_cursus_desc', 'Le détail des filières, mentions et parcours proposés.'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Organigramme & Parcours" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('parcours.titre', 'Organigramme & Parcours')}</h1>
                    <p className="mt-2 text-white/80">{t('parcours.soustitre', "Structure organisationnelle et académique de l'ISSTM.")}</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-14 px-6 py-12">
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                    {t(
                        'parcours.intro',
                        "Derrière chaque diplôme délivré par l'ISSTM se cache une organisation rigoureuse, portée par des femmes et des hommes engagés à chaque échelon, de la gouvernance aux équipes de terrain.",
                    )}
                </p>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.gouvernance', 'Gouvernance')}
                    </h2>
                    <div className="space-y-3">
                        <div className="rounded-xl border border-isstm-navy/20 bg-isstm-navy/5 px-4 py-3">
                            <span className="block text-sm font-semibold text-isstm-navy dark:text-white">
                                {t('parcours.conseil', "Conseil d'Établissement")}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">{t('parcours.organe_collegial', 'Organe collégial')}</span>
                        </div>
                        <div className="rounded-xl bg-isstm-navy px-4 py-3 text-white">
                            <span className="block text-sm font-semibold">{t('parcours.directeur', 'Directeur')}</span>
                            <span className="block text-xs text-white/70">Dr. Hary Tiana R.</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.direction_titre', 'Direction & Services Rattachés')}
                    </h2>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {direction.map((item) => (
                            <div key={item.title} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                                <span className="block text-sm font-semibold text-isstm-navy dark:text-white">{item.title}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.poles_titre', 'Pôle Pédagogique & Pôle Administratif')}
                    </h2>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t('parcours.poles_hint', 'Cliquez sur un pôle pour découvrir son équipe.')}</p>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <OrgNode node={pedagogicalPole} />
                        <OrgNode node={administrativePole} />
                    </div>
                </section>

                <section>
                    <p className="mb-6 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                        {t(
                            'parcours.cursus_intro',
                            "Du baccalauréat scientifique jusqu'au Master, chaque étape de votre parcours à l'ISSTM est pensée pour vous mener, pas à pas, vers l'excellence.",
                        )}
                    </p>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.cursus_titre', 'Schéma du Cursus')}
                    </h2>
                    <ol className="space-y-3">
                        {[...cursusLadder].reverse().map((step) => (
                            <Card key={step.key} className="p-4">
                                <span className="font-semibold text-isstm-navy dark:text-white">{step.level}</span>
                                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-slate-500 dark:text-slate-400">
                                    {step.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </ol>
                </section>

                <Card className="p-7">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                        <FileText className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        {t('parcours.documents_titre', 'Télécharger les Documents')}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('parcours.documents_soustitre', "Retrouvez l'organigramme et le cursus complet de l'ISSTM dans le format qui vous convient.")}
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {documents.map((doc) => (
                            <div key={doc.title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                                <h3 className="font-semibold text-isstm-navy dark:text-white">{doc.title}</h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{doc.desc}</p>
                                {isLoggedIn ? (
                                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('parcours.telechargements_a_venir', 'Téléchargements à venir')}
                                    </p>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                                    >
                                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('parcours.connexion_requise', 'Connectez-vous pour télécharger')}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
