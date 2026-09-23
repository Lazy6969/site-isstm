import { Head, Link, usePage } from '@inertiajs/react';
import { Download, FileText, Lock } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import OrgNode from '../Components/Parcours/OrgNode';
import { administrativePole, cursusLadder, direction, pedagogicalPole } from '../Components/Parcours/orgChartData';
import { Card } from '../Components/ui/card';
import { useTranslations } from '../lib/useTranslations';
import EditableText from '../Components/QuickEdit/EditableText';

const directionItems = direction.map((item, index) => ({ ...item, key: `parcours_direction_${index + 1}` }));

export default function Parcours() {
    const { auth, content } = usePage().props;
    const { t } = useTranslations();
    const isLoggedIn = Boolean(auth?.user);

    const documents = [
        {
            key: 'parcours_doc_organigramme',
            title: content.parcours_doc_organigramme_titre,
            desc: content.parcours_doc_organigramme_desc,
        },
        {
            key: 'parcours_doc_cursus',
            title: content.parcours_doc_cursus_titre,
            desc: content.parcours_doc_cursus_desc,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Organigramme & Parcours" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="parcours_titre">
                            {content.parcours_titre}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="parcours_soustitre">
                            {content.parcours_soustitre}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-14 px-6 py-12">
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                    <EditableText as="span" contentKey="parcours_intro">
                        {content.parcours_intro}
                    </EditableText>
                </p>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_gouvernance_titre">
                            {content.parcours_gouvernance_titre}
                        </EditableText>
                    </h2>
                    <div className="space-y-3">
                        <div className="rounded-xl border border-isstm-navy/20 bg-isstm-navy/5 px-4 py-3">
                            <span className="block text-sm font-semibold text-isstm-navy dark:text-white">
                                <EditableText as="span" contentKey="parcours_conseil_titre">
                                    {content.parcours_conseil_titre}
                                </EditableText>
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                                <EditableText as="span" contentKey="parcours_organe_collegial">
                                    {content.parcours_organe_collegial}
                                </EditableText>
                            </span>
                        </div>
                        <div className="rounded-xl bg-isstm-navy px-4 py-3 text-white">
                            <span className="block text-sm font-semibold">
                                <EditableText as="span" contentKey="parcours_directeur_label">
                                    {content.parcours_directeur_label}
                                </EditableText>
                            </span>
                            <span className="block text-xs text-white/70">
                                <EditableText as="span" contentKey="parcours_directeur_nom">
                                    {content.parcours_directeur_nom}
                                </EditableText>
                            </span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_direction_titre">
                            {content.parcours_direction_titre}
                        </EditableText>
                    </h2>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {directionItems.map((item) => (
                            <div key={item.key} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                                <span className="block text-sm font-semibold text-isstm-navy dark:text-white">
                                    <EditableText as="span" contentKey={`${item.key}_titre`}>
                                        {content[`${item.key}_titre`] ?? item.title}
                                    </EditableText>
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">
                                    <EditableText as="span" contentKey={`${item.key}_nom`}>
                                        {content[`${item.key}_nom`] ?? item.name}
                                    </EditableText>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_poles_titre">
                            {content.parcours_poles_titre}
                        </EditableText>
                    </h2>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        <EditableText as="span" contentKey="parcours_poles_hint">
                            {content.parcours_poles_hint}
                        </EditableText>
                    </p>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <OrgNode node={pedagogicalPole} />
                        <OrgNode node={administrativePole} />
                    </div>
                </section>

                <section>
                    <p className="mb-6 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                        <EditableText as="span" contentKey="parcours_cursus_intro">
                            {content.parcours_cursus_intro}
                        </EditableText>
                    </p>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_cursus_titre">
                            {content.parcours_cursus_titre}
                        </EditableText>
                    </h2>
                    <ol className="space-y-3">
                        {[...cursusLadder].reverse().map((step) => (
                            <Card key={step.key} className="p-4">
                                <span className="font-semibold text-isstm-navy dark:text-white">
                                    <EditableText as="span" contentKey={`parcours_cursus_${step.key}_niveau`}>
                                        {content[`parcours_cursus_${step.key}_niveau`] ?? step.level}
                                    </EditableText>
                                </span>
                                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-slate-500 dark:text-slate-400">
                                    {step.items.map((item, index) => (
                                        <li key={item}>
                                            <EditableText as="span" contentKey={`parcours_cursus_${step.key}_item${index + 1}`}>
                                                {content[`parcours_cursus_${step.key}_item${index + 1}`] ?? item}
                                            </EditableText>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </ol>
                </section>

                <Card className="p-7">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                        <FileText className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="parcours_documents_titre">
                            {content.parcours_documents_titre}
                        </EditableText>
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <EditableText as="span" contentKey="parcours_documents_soustitre">
                            {content.parcours_documents_soustitre}
                        </EditableText>
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {documents.map((doc) => (
                            <div key={doc.key} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                                <h3 className="font-semibold text-isstm-navy dark:text-white">
                                    <EditableText as="span" contentKey={`${doc.key}_titre`}>
                                        {doc.title}
                                    </EditableText>
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    <EditableText as="span" contentKey={`${doc.key}_desc`}>
                                        {doc.desc}
                                    </EditableText>
                                </p>
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
