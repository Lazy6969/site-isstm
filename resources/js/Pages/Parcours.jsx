import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUp, Download, FileText, Lock } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import OrgNode from '../Components/Parcours/OrgNode';
import {
    administrativePole,
    categories,
    cursusLadder,
    directionGrid,
    pedagogicalPole,
} from '../Components/Parcours/orgChartData';
import { Card } from '../Components/ui/card';
import { useTranslations } from '../lib/useTranslations';

const CURSUS_GRADIENTS = {
    bacc: 'from-[#6fa8dc] to-[#4a86c5]',
    l1l2: 'from-[#f0954a] to-[#d9722a]',
    l3: 'from-[#2e5f9e] to-[#1c3f73]',
    m1: 'from-[#e8b93a] to-[#cf9a1a]',
    m2: 'from-[#8bc457] to-[#6b9e3c]',
};

export default function Parcours({ orgPeople = {} }) {
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
                    <div className="mx-auto max-w-sm space-y-3">
                        <OrgNode node={{ key: 'conseil_etablissement' }} people={orgPeople} t={t} />
                        <div className="flex justify-center">
                            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                                &#8595;
                            </span>
                        </div>
                        <OrgNode node={{ key: 'directeur' }} people={orgPeople} t={t} emphasize />
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.direction_titre', 'Direction & Services Rattachés')}
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {directionGrid.map((key) => (
                            <OrgNode key={key} node={{ key }} people={orgPeople} t={t} />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.poles_titre', 'Pôle Pédagogique & Pôle Administratif')}
                    </h2>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t('parcours.poles_hint', 'Cliquez sur un pôle pour découvrir son équipe.')}</p>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <OrgNode node={pedagogicalPole} people={orgPeople} t={t} />
                        <OrgNode node={administrativePole} people={orgPeople} t={t} />
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {t('parcours.legende_titre', 'Légende')}
                        </h3>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.values(categories).map((category) => (
                                <div key={category.label} className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${category.swatch}`} aria-hidden="true" />
                                    <span className="text-xs text-slate-600 dark:text-slate-300">{category.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <p className="mb-6 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                        {t(
                            'parcours.cursus_intro',
                            "Du baccalauréat scientifique jusqu'au Master, chaque étape de votre parcours à l'ISSTM est pensée pour vous mener, pas à pas, vers l'excellence.",
                        )}
                    </p>
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        {t('parcours.cursus_titre', 'Schéma du Cursus')}
                    </h2>
                    <div className="mx-auto flex max-w-[600px] flex-col items-center">
                        {[...cursusLadder].reverse().map((step, index, arr) => (
                            <div key={step.key} className="w-full">
                                <div
                                    className={`w-full rounded-2xl bg-gradient-to-br px-6 py-5 text-center text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-8 ${CURSUS_GRADIENTS[step.key]}`}
                                >
                                    <span className="block text-lg font-extrabold tracking-wide drop-shadow-sm sm:text-xl">{step.level}</span>
                                    <ul className="mt-1.5 list-none space-y-0.5 text-sm opacity-95">
                                        {step.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                {index < arr.length - 1 && (
                                    <div className="flex justify-center py-2">
                                        <ArrowUp
                                            className="h-6 w-6 animate-bounce text-isstm-gold"
                                            style={{ animationDelay: `${index * 0.15}s` }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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
