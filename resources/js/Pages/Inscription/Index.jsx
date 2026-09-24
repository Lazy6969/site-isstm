import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, FileSignature, MapPin, Wallet } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../../Components/QuickEdit/EditableText';

function FeeTable({ title, rows }) {
    return (
        <Card className="overflow-hidden">
            <h3 className="border-b border-slate-100 bg-isstm-navy/5 px-5 py-3 font-semibold text-isstm-navy dark:border-slate-700 dark:text-white">
                {title}
            </h3>

            <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {rows.map(([label, value, contentKey]) => (
                        <tr key={label}>
                            <td className="px-5 py-2.5 text-slate-500 dark:text-slate-400">
                                {label}
                            </td>

                            <td className="px-5 py-2.5 text-right font-medium text-slate-700 dark:text-slate-200">
                                <EditableText as="span" contentKey={contentKey}>
                                    {value}
                                </EditableText>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}

function DossierCard({ title, subtitle, items }) {
    return (
        <Card className="p-6">
            <h3 className="font-semibold text-isstm-navy dark:text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-isstm-gold">{subtitle}</p>}

            <ul className="mt-4 space-y-2.5">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

const FILIERE_COLORS = [
    ['Génie Civil (GC)', 'bg-yellow-400'],
    ['Génie Hydraulique (GH)', 'bg-green-300'],
    ['Génie Architecture (GArch)', 'bg-amber-800'],
    ['Génie Électrique (GE)', 'bg-orange-500'],
    ['Génie Industriel (GI)', 'bg-blue-500'],
    ['Génie Thermique (GT)', 'bg-green-800'],
    ['Génie Informatique (GInfo)', 'bg-pink-400'],
    ['Génie Électronique Informatique (GEI)', 'bg-violet-500'],
    ['Génie Biomédicale (GBM)', 'bg-red-500'],
];

export default function Index({ content }) {
    const { t } = useTranslations();

    const dateLimite = content.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Inscription" />

            <SiteHeader />

            <div
                className="relative bg-isstm-navy bg-cover bg-center py-14 text-white"
                style={{
                    backgroundImage:
                        "linear-gradient(to bottom, rgba(0,51,102,0.85), rgba(0,31,63,0.9)), url('/images/portal_campus_1.jpg')",
                }}
            >
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        {t('inscription.titre', 'Inscription — Année')}{' '}
                        <EditableText
                            as="span"
                            contentKey="inscription_annee_universitaire"
                        >
                            {content.inscription_annee_universitaire}
                        </EditableText>
                    </h1>

                    <p className="mt-2 text-white/80">
                        {t(
                            'inscription.soustitre',
                            'Frais de scolarité, dates et modalités de dépôt.',
                        )}
                    </p>

                    <Link
                        href="/preinscription"
                        className="mt-5 flex w-fit items-center gap-2 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    >
                        <FileSignature
                            className="h-4 w-4"
                            aria-hidden="true"
                        />

                        {t(
                            'inscription.preinscription_cta',
                            'Faire ma préinscription en ligne',
                        )}
                    </Link>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-10 px-6 py-12">
                {dateLimite && (
                    <Card className="flex flex-col items-center gap-1 p-5 text-center">
                        <CalendarClock
                            className="h-5 w-5 text-isstm-gold"
                            aria-hidden="true"
                        />

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t(
                                'inscription.date_limite',
                                'Date limite de dépôt des dossiers',
                            )}
                        </p>

                        <p className="text-xl font-bold text-isstm-navy dark:text-white">
                            <EditableText as="span" contentKey="inscription_date_limite" value={content.inscription_date_limite}>
                                {dateLimite}
                            </EditableText>
                        </p>
                    </Card>
                )}

                <section>
                    <h2 className="mb-4 text-lg font-semibold text-isstm-navy dark:text-white">
                        {t(
                            'inscription.frais_nationaux',
                            'Frais de scolarité — Étudiants nationaux',
                        )}
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FeeTable
                            title="Licence"
                            rows={[
                                [
                                    "Droit d'inscription",
                                    content.frais_nat_lic_droit,
                                    'frais_nat_lic_droit',
                                ],
                                [
                                    '1ère versement',
                                    content.frais_nat_lic_v1,
                                    'frais_nat_lic_v1',
                                ],
                                [
                                    '2ème versement',
                                    content.frais_nat_lic_v2,
                                    'frais_nat_lic_v2',
                                ],
                                [
                                    '3ème versement',
                                    content.frais_nat_lic_v3,
                                    'frais_nat_lic_v3',
                                ],
                            ]}
                        />

                        <FeeTable
                            title="Master"
                            rows={[
                                [
                                    "Droit d'inscription",
                                    content.frais_nat_mas_droit,
                                    'frais_nat_mas_droit',
                                ],
                                [
                                    '1ère versement',
                                    content.frais_nat_mas_v1,
                                    'frais_nat_mas_v1',
                                ],
                                [
                                    '2ème versement',
                                    content.frais_nat_mas_v2,
                                    'frais_nat_mas_v2',
                                ],
                                [
                                    '3ème versement',
                                    content.frais_nat_mas_v3,
                                    'frais_nat_mas_v3',
                                ],
                            ]}
                        />
                    </div>

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {t(
                            'inscription.tenue_reglementaire',
                            'Tenue réglementaire :',
                        )}{' '}
                        <EditableText
                            as="span"
                            contentKey="frais_nat_tenue"
                        >
                            {content.frais_nat_tenue}
                        </EditableText>
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-lg font-semibold text-isstm-navy dark:text-white">
                        {t(
                            'inscription.frais_etrangers',
                            'Frais de scolarité — Étudiants étrangers',
                        )}
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FeeTable
                            title="Licence"
                            rows={[
                                [
                                    "Droit d'inscription",
                                    content.frais_etr_lic_droit,
                                    'frais_etr_lic_droit',
                                ],
                                [
                                    '1ère versement',
                                    content.frais_etr_lic_v1,
                                    'frais_etr_lic_v1',
                                ],
                                [
                                    '2ème versement',
                                    content.frais_etr_lic_v2,
                                    'frais_etr_lic_v2',
                                ],
                                [
                                    '3ème versement',
                                    content.frais_etr_lic_v3,
                                    'frais_etr_lic_v3',
                                ],
                            ]}
                        />

                        <FeeTable
                            title="Master"
                            rows={[
                                [
                                    "Droit d'inscription",
                                    content.frais_etr_mas_droit,
                                    'frais_etr_mas_droit',
                                ],
                                [
                                    '1ère versement',
                                    content.frais_etr_mas_v1,
                                    'frais_etr_mas_v1',
                                ],
                                [
                                    '2ème versement',
                                    content.frais_etr_mas_v2,
                                    'frais_etr_mas_v2',
                                ],
                                [
                                    '3ème versement',
                                    content.frais_etr_mas_v3,
                                    'frais_etr_mas_v3',
                                ],
                            ]}
                        />
                    </div>

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {t(
                            'inscription.tenue_reglementaire',
                            'Tenue réglementaire :',
                        )}{' '}
                        <EditableText
                            as="span"
                            contentKey="frais_etr_tenue"
                        >
                            {content.frais_etr_tenue}
                        </EditableText>
                    </p>
                </section>

                <section>
                    <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                        <ClipboardList className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        {t('inscription.dossiers_titre', 'Dossiers à fournir')}
                    </h2>
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        {t(
                            'inscription.dossiers_soustitre',
                            "La composition du dossier dépend de votre situation : première préinscription, entrée en L1, entrée en Master 1, ou réinscription.",
                        )}
                    </p>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <DossierCard
                            title={t('inscription.dossiers_preinscription_titre', "Préinscription dans l'ISSTM")}
                            items={[
                                t('inscription.dossiers_fiche_preinscription', 'Fiche de préinscription'),
                                t('inscription.dossiers_copie_naissance', "Copie d'acte de naissance (moins de 6 mois)"),
                                t('inscription.dossiers_photocopie_bac', 'Photocopie certifiée du relevé de notes du Baccalauréat'),
                                t('inscription.dossiers_cert_residence_parents', 'Certificat de résidence des parents (moins de 3 mois)'),
                                t('inscription.dossiers_enveloppes', "Deux enveloppes timbrées avec l'adresse du candidat"),
                                t('inscription.dossiers_recu_preinscription', 'Reçu de versement de préinscription : nationaux 70 000 Ar, étrangers 110 000 Ar'),
                            ]}
                        />

                        <DossierCard
                            title={t('inscription.master_preinscription_titre', 'Pré-inscription en Master 1')}
                            subtitle={t('inscription.master_docs_requis', 'Documents requis')}
                            items={[
                                t('inscription.dossiers_fiche_preinscription', 'Fiche de préinscription'),
                                t('inscription.dossiers_photos_4', "Photos d'identité : 04 photos (4×4)"),
                                t('inscription.dossiers_cert_residence_parents', 'Certificat de résidence des parents (moins de 3 mois)'),
                                t('inscription.master_photocopie_licence', "Photocopie certifiée de l'attestation ou du diplôme de Licence"),
                                t('inscription.dossiers_copie_naissance', "Copie d'acte de naissance (moins de 6 mois)"),
                                t('inscription.master_photocopie_cin', 'Photocopie CIN légalisée'),
                                t('inscription.master_enveloppe_pm', 'Une enveloppe PM timbrée'),
                                t('inscription.dossiers_recu_preinscription', 'Reçu de versement de préinscription : nationaux 70 000 Ar, étrangers 110 000 Ar'),
                            ]}
                        />

                        <DossierCard
                            title={t('inscription.dossiers_l1_titre', "Inscription initiale (L1 et L2 Biomédical)")}
                            items={[
                                t('inscription.dossiers_photos_4', "Photos d'identité : 04 photos (4×4)"),
                                t('inscription.dossiers_lettre_engagement', "Lettre d'engagement manuscrite légalisée à la Commune Urbaine de Mahajanga"),
                                t('inscription.dossiers_cert_residence', "Certificats de résidence (du répondant à Mahajanga et de l'étudiant)"),
                                t('inscription.dossiers_releve_bac', 'Relevé de notes du Baccalauréat'),
                                t('inscription.dossiers_preuve_versement_l1', '1er versement : nationaux 250 000 Ar, étrangers 350 000 Ar'),
                                t('inscription.dossiers_fiche_inscription', "Fiche d'inscription : à retirer à la scolarité (200 Ar)"),
                                t('inscription.dossiers_achat_tenue', 'Achat de la tenue ISSTM : 20 000 Ar'),
                            ]}
                        />

                        <DossierCard
                            title={t('inscription.reinscription_titre', 'Réinscriptions (L2, L3 et redoublants)')}
                            items={[
                                t('inscription.dossiers_photos_3', "Photos d'identité : 03 photos (4×4)"),
                                t('inscription.reinscription_carte_etudiant', "Photocopie de la carte d'étudiant"),
                                t('inscription.dossiers_lettre_engagement', "Lettre d'engagement manuscrite légalisée à la Commune Urbaine de Mahajanga"),
                                t('inscription.dossiers_cert_residence', "Certificats de résidence (du répondant à Mahajanga et de l'étudiant)"),
                                t('inscription.dossiers_preuve_versement_l1', '1er versement : nationaux 250 000 Ar, étrangers 350 000 Ar'),
                                t('inscription.reinscription_fiche', 'Fiche de réinscription : 200 Ar (à retirer à la scolarité)'),
                                t('inscription.dossiers_achat_tenue', 'Achat de la tenue ISSTM : 20 000 Ar'),
                            ]}
                        />

                        <DossierCard
                            title={t('inscription.reinscription_m2_titre', 'Réinscriptions M2 et redoublants Master')}
                            items={[
                                t('inscription.dossiers_photos_3', "Photos d'identité : 03 photos (4×4)"),
                                t('inscription.reinscription_carte_etudiant', "Photocopie de la carte d'étudiant"),
                                t('inscription.dossiers_lettre_engagement', "Lettre d'engagement manuscrite légalisée à la Commune Urbaine de Mahajanga"),
                                t('inscription.dossiers_cert_residence', "Certificats de résidence (du répondant à Mahajanga et de l'étudiant)"),
                                t('inscription.reinscription_m2_releve', 'Relevé de notes du Master 1'),
                                t('inscription.reinscription_fiche', 'Fiche de réinscription : 200 Ar (à retirer à la scolarité)'),
                                t('inscription.reinscription_m2_versement', 'Preuve de versement : nationaux 550 000 Ar, étrangers 750 000 Ar'),
                            ]}
                        />

                        <Card className="p-6">
                            <h3 className="font-semibold text-isstm-navy dark:text-white">
                                {t('inscription.chemises_titre', 'Couleur des chemises par filière (L1)')}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">
                                {t('inscription.chemises_soustitre', '2 chemises cartonnées, couleur selon la filière')}
                            </p>
                            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {FILIERE_COLORS.map(([label, colorClass]) => (
                                    <li key={label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className={`h-3 w-3 flex-shrink-0 rounded-full ${colorClass}`} aria-hidden="true" />
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <p className="font-semibold">{t('inscription.dossiers_incomplets', 'Les dossiers incomplets ne seront pas considérés.')}</p>
                    </div>
                </section>

                <Card className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                        <MapPin
                            className="h-5 w-5 text-isstm-gold"
                            aria-hidden="true"
                        />

                        {t(
                            'inscription.modalites_titre',
                            'Modalités de dépôt',
                        )}
                    </h2>

                    <EditableText
                        as="p"
                        contentKey="inscription_adresse_bloc"
                        className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                    >
                        {content.inscription_adresse_bloc}
                    </EditableText>

                    <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Wallet
                            className="h-4 w-4 flex-shrink-0"
                            aria-hidden="true"
                        />

                        {t(
                            'inscription.compte_bancaire',
                            'Compte bancaire :',
                        )}{' '}

                        <EditableText
                            as="span"
                            contentKey="inscription_compte_bancaire"
                            className="font-medium text-slate-700 dark:text-slate-200"
                        >
                            {content.inscription_compte_bancaire}
                        </EditableText>
                    </p>
                </Card>
            </main>

            <Footer />
        </div>
    );
}