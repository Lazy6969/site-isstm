import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Trash2 } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Button } from '../../../../Components/ui/button';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Input } from '../../../../Components/ui/input';
import { Badge } from '../../../../Components/ui/badge';
import { Avatar, AvatarFallback } from '../../../../Components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { useTranslations } from '../../../../lib/useTranslations';

const statutVariants = { actif: 'success', suspendu: 'warning', diplome: 'outline', abandon: 'danger' };
const statutLabels = { actif: 'Actif', suspendu: 'Suspendu', diplome: 'Diplômé', abandon: 'Abandon' };
const statutI18nKeys = {
    actif: 'admin.common.active',
    suspendu: 'admin.etudiants.statut_suspendu',
    diplome: 'admin.etudiants.statut_diplome',
    abandon: 'admin.etudiants.statut_abandon',
};
const inscriptionStatutVariants = { en_attente: 'warning', validee: 'success', annulee: 'danger' };
const inscriptionStatutLabels = { en_attente: 'En attente', validee: 'Validée', annulee: 'Annulée' };
const inscriptionStatutI18nKeys = {
    en_attente: 'admin.inscriptions.statut_en_attente',
    validee: 'admin.inscriptions.statut_validee',
    annulee: 'admin.inscriptions.statut_annulee',
};

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** One label / value line; renders nothing when the candidate left the field empty. */
function Row({ label, children }) {
    if (children === null || children === undefined || children === '' || children === false) return null;

    return (
        <div className="flex justify-between gap-4">
            <dt className="flex-shrink-0 text-admin-text-secondary">{label}</dt>
            <dd className="text-right text-admin-text">{children}</dd>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <>
            <h3 className="mt-6 mb-3 text-xs font-semibold tracking-wide text-admin-muted uppercase">{title}</h3>
            <dl className="space-y-2 text-sm">{children}</dl>
        </>
    );
}

export default function Show({ etudiant, classes }) {
    const { t } = useTranslations();
    const [expanded, setExpanded] = useState(false);
    const form = useForm({
        matricule: etudiant.matricule,
        classe_id: etudiant.classe_id ? String(etudiant.classe_id) : '',
        statut: etudiant.statut,
        telephone: etudiant.telephone ?? '',
        adresse: etudiant.adresse ?? '',
    });

    // What the candidate typed in the pré-inscription form. The student record
    // holds the identity snapshot taken at approval (and any later edit), the
    // dossier holds the rest — education, filière, level, file number.
    const dossier = etudiant.candidat ?? {};
    const pick = (field) => etudiant[field] ?? dossier[field];
    const niveau = etudiant.classe?.niveau ?? dossier.niveau;
    const filiere = etudiant.classe?.filiere?.nom_fr ?? dossier.filiere?.nom_fr;
    const sexe = pick('sexe') === 'F' ? t('admin.etudiants.feminin', 'Féminin') : pick('sexe') === 'M' ? t('admin.etudiants.masculin', 'Masculin') : null;
    const situation = dossier.code_redoublement === 'R' ? t('admin.etudiants.redoublant', 'Redoublant(e)') : dossier.code_redoublement === 'N' ? t('admin.etudiants.nouveau_bachelier', 'Nouveau bachelier') : null;
    const serie = dossier.serie_bacc === 'AUTRE' ? (dossier.serie_bacc_autre ?? dossier.serie_bacc) : dossier.serie_bacc;
    const niveauLabel = (classe) => `${classe.niveau} — ${classe.filiere?.nom_fr ?? classe.nom} (${classe.annee})`;

    function submit(e) {
        e.preventDefault();
        form.put(`/console/scolarite/etudiants/${etudiant.id}`, { preserveScroll: true });
    }

    function destroy() {
        if (
            !confirm(
                `Supprimer définitivement le compte de ${etudiant.user.name} ? Il ne pourra plus se connecter et toutes ses données (dossier, inscriptions, publications, messages...) seront effacées. Cette action est irréversible.`,
            )
        )
            return;
        router.delete(`/console/scolarite/etudiants/${etudiant.id}`);
    }

    return (
        <AdminLayout title={`${t('admin.etudiants.dossier_titre_prefix', 'Dossier')} — ${etudiant.user.name}`}>
            <Link
                href="/console/scolarite/etudiants"
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-admin-text-secondary transition hover:text-admin-text"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('admin.etudiants.retour', 'Retour aux étudiants')}
            </Link>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-1">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-admin-hover text-admin-text">{etudiant.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-admin-text">{etudiant.user.name}</p>
                            <p className="text-sm text-admin-muted">{etudiant.user.email}</p>
                        </div>
                    </div>

                    <dl className="mt-5 space-y-3 text-sm">
                        <Row label={t('admin.etudiants.filiere', 'Filière')}>{filiere ?? '—'}</Row>
                        <Row label={t('admin.etudiants.niveau', 'Niveau')}>{niveau ? <Badge variant="outline">{niveau}</Badge> : '—'}</Row>
                        <div className="flex justify-between">
                            <dt className="text-admin-text-secondary">{t('admin.etudiants.statut_actuel', 'Statut actuel')}</dt>
                            <dd>
                                <Badge variant={statutVariants[etudiant.statut]}>{t(statutI18nKeys[etudiant.statut], statutLabels[etudiant.statut])}</Badge>
                            </dd>
                        </div>
                        {etudiant.candidat && (
                            <>
                                <Row label={t('admin.etudiants.numero_dossier', 'N° de dossier')}>{dossier.numero_dossier}</Row>
                                <Row label={t('admin.etudiants.preinscription_label', 'Préinscription')}>{formatDate(dossier.submitted_at ?? dossier.created_at)}</Row>
                            </>
                        )}
                    </dl>

                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        aria-expanded={expanded}
                        aria-controls="etudiant-details"
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm font-medium text-admin-text-secondary transition hover:border-admin-accent/50 hover:bg-admin-hover hover:text-admin-text"
                    >
                        {expanded ? t('admin.etudiants.voir_moins', 'Voir moins') : t('admin.etudiants.en_savoir_plus', 'En savoir plus')}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {expanded && (
                        <div id="etudiant-details" className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        <Section title={t('admin.etudiants.section_identite', 'Identité')}>
                            <Row label={t('admin.etudiants.civilite', 'Civilité')}>{[pick('civilite'), sexe].filter(Boolean).join(' · ')}</Row>
                            <Row label={t('admin.etudiants.prenoms', 'Prénom(s)')}>{pick('prenoms')}</Row>
                            <Row label={t('admin.etudiants.nom', 'Nom')}>{pick('nom')}</Row>
                            <Row label={t('admin.etudiants.ne_le', 'Né(e) le')}>
                                {pick('date_naissance') ? `${formatDate(pick('date_naissance'))}${pick('lieu_naissance') ? ` — ${pick('lieu_naissance')}` : ''}` : pick('lieu_naissance')}
                            </Row>
                            <Row label={t('admin.etudiants.nationalite', 'Nationalité')}>{pick('nationalite')}</Row>
                            <Row label={t('admin.etudiants.pays', 'Pays de résidence')}>{pick('pays')}</Row>
                            <Row label={t('admin.etudiants.cin', 'CIN ou passeport')}>{pick('cin')}</Row>
                        </Section>

                        <Section title={t('admin.etudiants.section_contact', 'Coordonnées')}>
                            <Row label={t('admin.etudiants.telephone', 'Téléphone')}>{pick('telephone')}</Row>
                            <Row label={t('admin.etudiants.adresse', 'Adresse')}>{pick('adresse')}</Row>
                        </Section>

                        {(pick('nom_pere') || pick('nom_mere') || pick('contact_parents') || pick('repondant_nom') || pick('repondant_telephone')) && (
                            <Section title={t('admin.etudiants.section_famille', 'Famille')}>
                                <Row label={t('admin.etudiants.pere', 'Père')}>{pick('nom_pere')}</Row>
                                <Row label={t('admin.etudiants.mere', 'Mère')}>{pick('nom_mere')}</Row>
                                <Row label={t('admin.etudiants.tel_parents', 'Tél. parents')}>{pick('contact_parents')}</Row>
                                <Row label={t('admin.etudiants.repondant', 'Répondant')}>
                                    {pick('repondant_nom') ? `${pick('repondant_nom')}${pick('repondant_lien') ? ` (${pick('repondant_lien')})` : ''}` : null}
                                </Row>
                                <Row label={t('admin.etudiants.tel_repondant', 'Tél. répondant')}>{pick('repondant_telephone')}</Row>
                            </Section>
                        )}

                        {(dossier.annee_bacc || dossier.serie_bacc || dossier.mention_bacc || situation) && (
                            <Section title={t('admin.etudiants.section_formation', 'Formation')}>
                                <Row label={t('admin.etudiants.annee_bacc', 'Année du bac')}>{dossier.annee_bacc}</Row>
                                <Row label={t('admin.etudiants.serie_bacc', 'Série du bac')}>{serie}</Row>
                                <Row label={t('admin.etudiants.mention_bacc', 'Mention')}>{dossier.mention_bacc}</Row>
                                <Row label={t('admin.etudiants.situation', 'Situation')}>{situation}</Row>
                            </Section>
                        )}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('admin.etudiants.modifier_dossier', 'Modifier le dossier')}</h2>
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="matricule">{t('admin.etudiants.matricule', 'Matricule')}</Label>
                            <Input id="matricule" value={form.data.matricule} onChange={(e) => form.setData('matricule', e.target.value)} className="mt-1.5" />
                            {form.errors.matricule && <p className="mt-1 text-sm text-red-500">{form.errors.matricule}</p>}
                        </div>

                        <div>
                            <Label htmlFor="classe_id">{t('admin.etudiants.niveau', 'Niveau')}</Label>
                            <Select id="classe_id" value={form.data.classe_id} onChange={(e) => form.setData('classe_id', e.target.value)} className="mt-1.5">
                                <option value="">{t('admin.etudiants.aucun', 'Aucun')}</option>
                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {niveauLabel(classe)}
                                    </option>
                                ))}
                            </Select>
                            {form.errors.classe_id && <p className="mt-1 text-sm text-red-500">{form.errors.classe_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="statut">{t('admin.common.status', 'Statut')}</Label>
                            <Select id="statut" value={form.data.statut} onChange={(e) => form.setData('statut', e.target.value)} className="mt-1.5">
                                {Object.entries(statutLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {t(statutI18nKeys[value], label)}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="telephone">{t('admin.etudiants.telephone', 'Téléphone')}</Label>
                            <Input id="telephone" value={form.data.telephone} onChange={(e) => form.setData('telephone', e.target.value)} className="mt-1.5" />
                            {form.errors.telephone && <p className="mt-1 text-sm text-red-500">{form.errors.telephone}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <Label htmlFor="adresse">{t('admin.etudiants.adresse', 'Adresse')}</Label>
                            <Input id="adresse" value={form.data.adresse} onChange={(e) => form.setData('adresse', e.target.value)} className="mt-1.5" />
                            {form.errors.adresse && <p className="mt-1 text-sm text-red-500">{form.errors.adresse}</p>}
                        </div>

                        <div className="flex items-center gap-3 sm:col-span-3">
                            <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                {t('admin.common.save', 'Enregistrer')}
                            </Button>
                            <Button type="button" onClick={destroy} className="ml-auto bg-transparent text-red-600 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Supprimer le compte
                            </Button>
                        </div>
                    </form>

                    <h2 className="mb-3 mt-8 text-sm font-semibold text-admin-text">{t('admin.etudiants.historique_inscriptions', 'Historique des inscriptions')}</h2>
                    {etudiant.inscriptions.length === 0 ? (
                        <p className="text-sm text-admin-muted">{t('admin.etudiants.aucune_inscription', 'Aucune inscription enregistrée.')}</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-admin-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('admin.etudiants.annee', 'Année')}</TableHead>
                                        <TableHead>{t('admin.etudiants.niveau', 'Niveau')}</TableHead>
                                        <TableHead>{t('admin.common.status', 'Statut')}</TableHead>
                                        <TableHead>{t('admin.common.date', 'Date')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {etudiant.inscriptions.map((inscription) => (
                                        <TableRow key={inscription.id}>
                                            <TableCell>{inscription.annee}</TableCell>
                                            <TableCell>{inscription.classe?.niveau ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant={inscriptionStatutVariants[inscription.statut]}>
                                                    {t(inscriptionStatutI18nKeys[inscription.statut], inscriptionStatutLabels[inscription.statut])}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(inscription.date_inscription)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
