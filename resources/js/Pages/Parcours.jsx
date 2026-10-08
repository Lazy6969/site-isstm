import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUp, Download, FileImage, FileText, Lock, Pencil } from 'lucide-react';
import { useState } from 'react';
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
import { useQuickEdit } from '../lib/useQuickEdit';
import EditableText from '../Components/QuickEdit/EditableText';
import EditableOrgPersonDialog from '../Components/QuickEdit/EditableOrgPersonDialog';
import DocumentSlotUploadDialog from '../Components/QuickEdit/DocumentSlotUploadDialog';
import BannerBackground from '../Components/QuickEdit/BannerBackground';

const CURSUS_GRADIENTS = {
    bacc: 'from-[#6fa8dc] to-[#4a86c5]',
    l1l2: 'from-[#f0954a] to-[#d9722a]',
    l3: 'from-[#2e5f9e] to-[#1c3f73]',
    m1: 'from-[#e8b93a] to-[#cf9a1a]',
    m2: 'from-[#8bc457] to-[#6b9e3c]',
};

// 3 download formats per document, mirroring the legacy site's download
// section (see parcours.php): an image preview, an editable Word version,
// and a PDF — each its own fixed color so the format is recognizable at a
// glance.
const DOCUMENT_FORMATS = [
    { suffix: 'image', label: 'JPEG', icon: FileImage, color: 'bg-emerald-600 hover:bg-emerald-700' },
    { suffix: 'word', label: 'Word', icon: FileText, color: 'bg-blue-700 hover:bg-blue-800' },
    { suffix: 'pdf', label: 'PDF', icon: FileText, color: 'bg-red-600 hover:bg-red-700' },
];

export default function Parcours({ orgPeople = {}, orgDocuments = {} }) {
    const { auth, content, contentStyles } = usePage().props;
    const { t } = useTranslations();
    const { active } = useQuickEdit();
    const isLoggedIn = Boolean(auth?.user);
    const isActive = Boolean(auth?.user?.is_active);
    const canEditOrg = active && (auth?.permissions ?? []).includes('organigramme.edit');
    const [editingPerson, setEditingPerson] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(null);

    function onEditPerson(person, title) {
        setEditingPerson({ person, title });
    }

    const documents = [
        {
            key: 'parcours_doc_organigramme',
            slugPrefix: 'organigramme',
            title: content.parcours_doc_organigramme_titre,
            desc: content.parcours_doc_organigramme_desc,
        },
        {
            key: 'parcours_doc_cursus',
            slugPrefix: 'cursus',
            title: content.parcours_doc_cursus_titre,
            desc: content.parcours_doc_cursus_desc,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Organigramme & Parcours" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="parcours_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-5xl px-6">
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
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_gouvernance_titre">
                            {content.parcours_gouvernance_titre ?? t('parcours.gouvernance', 'Gouvernance')}
                        </EditableText>
                    </h2>
                    <div className="mx-auto max-w-md space-y-3">
                        <OrgNode
                            node={{ key: 'conseil_etablissement' }}
                            people={orgPeople}
                            t={t}
                            content={content}
                            contentStyles={contentStyles}
                            canEdit={canEditOrg}
                            onEditPerson={onEditPerson}
                        />
                        <div className="flex justify-center">
                            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                                &#8595;
                            </span>
                        </div>
                        <OrgNode
                            node={{ key: 'directeur' }}
                            people={orgPeople}
                            t={t}
                            content={content}
                            contentStyles={contentStyles}
                            emphasize
                            canEdit={canEditOrg}
                            onEditPerson={onEditPerson}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_direction_titre">
                            {content.parcours_direction_titre ?? t('parcours.direction_titre', 'Direction & Services Rattachés')}
                        </EditableText>
                    </h2>
                    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {directionGrid.map((key) => (
                            <OrgNode
                                key={key}
                                node={{ key }}
                                people={orgPeople}
                                t={t}
                                content={content}
                                contentStyles={contentStyles}
                                canEdit={canEditOrg}
                                onEditPerson={onEditPerson}
                            />
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
                        <OrgNode
                            node={pedagogicalPole}
                            people={orgPeople}
                            t={t}
                            content={content}
                            contentStyles={contentStyles}
                            canEdit={canEditOrg}
                            onEditPerson={onEditPerson}
                        />
                        <OrgNode
                            node={administrativePole}
                            people={orgPeople}
                            t={t}
                            content={content}
                            contentStyles={contentStyles}
                            canEdit={canEditOrg}
                            onEditPerson={onEditPerson}
                        />
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <EditableText as="span" contentKey="parcours_legende_titre">
                                {content.parcours_legende_titre ?? t('parcours.legende_titre', 'Légende')}
                            </EditableText>
                        </h3>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(categories).map(([key, category]) => {
                                const labelKey = `parcours_legende_${key}`;

                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${category.swatch}`} aria-hidden="true" />
                                        <EditableText as="span" contentKey={labelKey} className="text-xs text-slate-600 dark:text-slate-300">
                                            {content[labelKey] ?? category.label}
                                        </EditableText>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section>
                    <p className="mb-6 text-base leading-relaxed text-slate-700 dark:text-slate-200">
                        <EditableText as="span" contentKey="parcours_cursus_intro">
                            {content.parcours_cursus_intro}
                        </EditableText>
                    </p>
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-isstm-gold">
                        <EditableText as="span" contentKey="parcours_cursus_titre">
                            {content.parcours_cursus_titre ?? t('parcours.cursus_titre', 'Schéma du Cursus')}
                        </EditableText>
                    </h2>
                    <div className="mx-auto flex max-w-[600px] flex-col items-center">
                        {[...cursusLadder].reverse().map((step, index, arr) => {
                            const niveauKey = `parcours_cursus_${step.key}_niveau`;

                            return (
                                <div key={step.key} className="w-full">
                                    <div
                                        className={`w-full rounded-2xl bg-gradient-to-br px-6 py-5 text-center text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-8 ${CURSUS_GRADIENTS[step.key]}`}
                                    >
                                        <EditableText
                                            as="span"
                                            contentKey={niveauKey}
                                            className="block text-lg font-extrabold tracking-wide drop-shadow-sm sm:text-xl"
                                        >
                                            {content[niveauKey] ?? step.level}
                                        </EditableText>
                                        <ul className="mt-1.5 list-none space-y-0.5 text-sm opacity-95">
                                            {step.items.map((item, i) => {
                                                const itemKey = `parcours_cursus_${step.key}_item${i + 1}`;

                                                return (
                                                    <EditableText key={itemKey} as="li" contentKey={itemKey}>
                                                        {content[itemKey] ?? item}
                                                    </EditableText>
                                                );
                                            })}
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
                            );
                        })}
                    </div>
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
                        {documents.map((doc) => {
                            const availableFormats = DOCUMENT_FORMATS.filter((format) => orgDocuments[`${doc.slugPrefix}_${format.suffix}`]);

                            return (
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
                                    {!isLoggedIn && (
                                        <Link
                                            href="/login"
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                                        >
                                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('parcours.connexion_requise', 'Connectez-vous pour télécharger')}
                                        </Link>
                                    )}

                                    {isLoggedIn && !isActive && (
                                        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('parcours.compte_inactif', 'Compte inactif — contactez la scolarité')}
                                        </p>
                                    )}

                                    {isLoggedIn && isActive && availableFormats.length > 0 && (
                                        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                                            {availableFormats.map((format) => {
                                                const slug = `${doc.slugPrefix}_${format.suffix}`;
                                                const Icon = format.icon;

                                                return (
                                                    <a
                                                        key={slug}
                                                        href={`/${orgDocuments[slug]}`}
                                                        download
                                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition ${format.color}`}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {format.label}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {isLoggedIn && isActive && availableFormats.length === 0 && (
                                        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('parcours.telechargements_a_venir', 'Document à venir')}
                                        </p>
                                    )}

                                    {canEditOrg && (
                                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                                            {DOCUMENT_FORMATS.map((format) => {
                                                const slug = `${doc.slugPrefix}_${format.suffix}`;

                                                return (
                                                    <button
                                                        key={slug}
                                                        type="button"
                                                        onClick={() => setUploadingDoc({ slug, title: `${doc.title} — ${format.label}` })}
                                                        className="flex items-center gap-1 text-xs font-medium text-isstm-gold hover:underline"
                                                    >
                                                        <Pencil className="h-3 w-3" aria-hidden="true" />
                                                        {format.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </main>

            <Footer />

            {editingPerson && (
                <EditableOrgPersonDialog
                    open={editingPerson !== null}
                    onClose={() => setEditingPerson(null)}
                    person={editingPerson.person}
                    title={editingPerson.title}
                />
            )}

            {uploadingDoc && (
                <DocumentSlotUploadDialog
                    open={uploadingDoc !== null}
                    onClose={() => setUploadingDoc(null)}
                    endpoint={`/console/organigramme/documents/${uploadingDoc.slug}`}
                    title={uploadingDoc.title}
                />
            )}
        </div>
    );
}
