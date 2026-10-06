import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Ban, CheckCircle2, Trash2 } from 'lucide-react';
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

export default function Show({ etudiant }) {
    const { t } = useTranslations();
    const form = useForm({
        matricule: etudiant.matricule,
        classe_id: etudiant.classe_id ? String(etudiant.classe_id) : '',
        statut: etudiant.statut,
        telephone: etudiant.telephone ?? '',
        adresse: etudiant.adresse ?? '',
    });

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

    function togglePause() {
        const suspending = etudiant.statut === 'actif';
        const verb = suspending ? 'mettre en pause' : 'réactiver';
        if (!confirm(`Voulez-vous vraiment ${verb} le compte de ${etudiant.user.name} ?`)) return;
        router.post(`/console/scolarite/etudiants/${etudiant.id}/pause`, {}, { preserveScroll: true });
    }

    const canTogglePause = etudiant.statut === 'actif' || etudiant.statut === 'suspendu';

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
                        <div className="flex justify-between">
                            <dt className="text-admin-text-secondary">{t('admin.etudiants.filiere', 'Filière')}</dt>
                            <dd className="text-admin-text">{etudiant.classe?.filiere?.nom_fr ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-admin-text-secondary">{t('admin.etudiants.statut_actuel', 'Statut actuel')}</dt>
                            <dd>
                                <Badge variant={statutVariants[etudiant.statut]}>
                                    {t(statutI18nKeys[etudiant.statut], statutLabels[etudiant.statut])}
                                </Badge>
                            </dd>
                        </div>
                        {etudiant.candidat && (
                            <div className="flex justify-between">
                                <dt className="text-admin-text-secondary">{t('admin.etudiants.preinscription_label', 'Préinscription')}</dt>
                                <dd className="text-admin-text">{formatDate(etudiant.candidat.created_at)}</dd>
                            </div>
                        )}
                    </dl>

                    {(etudiant.date_naissance || etudiant.cin || etudiant.nom_pere || etudiant.nom_mere) && (
                        <>
                            <h3 className="mt-6 mb-3 text-xs font-semibold tracking-wide text-admin-muted uppercase">Identité</h3>
                            <dl className="space-y-2 text-sm">
                                {etudiant.civilite && (
                                    <div className="flex justify-between">
                                        <dt className="text-admin-text-secondary">Civilité</dt>
                                        <dd className="text-admin-text">{etudiant.civilite} · {etudiant.sexe === 'F' ? 'Féminin' : 'Masculin'}</dd>
                                    </div>
                                )}
                                {etudiant.date_naissance && (
                                    <div className="flex justify-between">
                                        <dt className="text-admin-text-secondary">Né(e) le</dt>
                                        <dd className="text-admin-text">{formatDate(etudiant.date_naissance)}{etudiant.lieu_naissance ? ` à ${etudiant.lieu_naissance}` : ''}</dd>
                                    </div>
                                )}
                                {etudiant.cin && (
                                    <div className="flex justify-between">
                                        <dt className="text-admin-text-secondary">CIN</dt>
                                        <dd className="text-admin-text">{etudiant.cin}</dd>
                                    </div>
                                )}
                                {etudiant.nationalite && (
                                    <div className="flex justify-between">
                                        <dt className="text-admin-text-secondary">Nationalité</dt>
                                        <dd className="text-admin-text">{etudiant.nationalite}</dd>
                                    </div>
                                )}
                            </dl>

                            {(etudiant.nom_pere || etudiant.nom_mere || etudiant.repondant_nom) && (
                                <>
                                    <h3 className="mt-5 mb-3 text-xs font-semibold tracking-wide text-admin-muted uppercase">Famille</h3>
                                    <dl className="space-y-2 text-sm">
                                        {etudiant.nom_pere && (
                                            <div className="flex justify-between">
                                                <dt className="text-admin-text-secondary">Père</dt>
                                                <dd className="text-admin-text">{etudiant.nom_pere}</dd>
                                            </div>
                                        )}
                                        {etudiant.nom_mere && (
                                            <div className="flex justify-between">
                                                <dt className="text-admin-text-secondary">Mère</dt>
                                                <dd className="text-admin-text">{etudiant.nom_mere}</dd>
                                            </div>
                                        )}
                                        {etudiant.contact_parents && (
                                            <div className="flex justify-between">
                                                <dt className="text-admin-text-secondary">Tél. parents</dt>
                                                <dd className="text-admin-text">{etudiant.contact_parents}</dd>
                                            </div>
                                        )}
                                        {etudiant.repondant_nom && (
                                            <div className="flex justify-between">
                                                <dt className="text-admin-text-secondary">Répondant</dt>
                                                <dd className="text-admin-text">{etudiant.repondant_nom} ({etudiant.repondant_lien})</dd>
                                            </div>
                                        )}
                                    </dl>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('admin.etudiants.modifier_dossier', 'Modifier le dossier')}</h2>
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="matricule">{t('admin.etudiants.matricule', 'Matricule')}</Label>
                            <Input
                                id="matricule"
                                value={form.data.matricule}
                                onChange={(e) => form.setData('matricule', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.matricule && <p className="mt-1 text-sm text-red-500">{form.errors.matricule}</p>}
                        </div>

                        <div>
                            <Label htmlFor="classe_id">{t('admin.etudiants.col_classe', 'Classe')}</Label>
                            <Select
                                id="classe_id"
                                value={form.data.classe_id}
                                onChange={(e) => form.setData('classe_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">{t('admin.etudiants.aucune', 'Aucune')}</option>
                                {etudiant.classe && (
                                    <option value={etudiant.classe.id}>
                                        {etudiant.classe.nom} ({etudiant.classe.niveau}, {etudiant.classe.annee})
                                    </option>
                                )}
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="statut">{t('admin.common.status', 'Statut')}</Label>
                            <Select
                                id="statut"
                                value={form.data.statut}
                                onChange={(e) => form.setData('statut', e.target.value)}
                                className="mt-1.5"
                            >
                                {Object.entries(statutLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {t(statutI18nKeys[value], label)}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                id="telephone"
                                value={form.data.telephone}
                                onChange={(e) => form.setData('telephone', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.telephone && <p className="mt-1 text-sm text-red-500">{form.errors.telephone}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <Label htmlFor="adresse">Adresse</Label>
                            <Input
                                id="adresse"
                                value={form.data.adresse}
                                onChange={(e) => form.setData('adresse', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.adresse && <p className="mt-1 text-sm text-red-500">{form.errors.adresse}</p>}
                        </div>

                        <div className="flex items-center gap-3 sm:col-span-3">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                {t('admin.common.save', 'Enregistrer')}
                            </Button>
                            {canTogglePause && (
                                <Button
                                    type="button"
                                    onClick={togglePause}
                                    className="ml-auto bg-transparent text-amber-600 hover:bg-amber-500/10"
                                >
                                    {etudiant.statut === 'actif' ? (
                                        <>
                                            <Ban className="h-4 w-4" aria-hidden="true" />
                                            {t('admin.etudiants.mettre_en_pause', 'Mettre en pause')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                            {t('admin.etudiants.reprendre_compte', 'Réactiver le compte')}
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={destroy}
                                className={canTogglePause ? 'bg-transparent text-red-600 hover:bg-red-500/10' : 'ml-auto bg-transparent text-red-600 hover:bg-red-500/10'}
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Supprimer le compte
                            </Button>
                        </div>
                    </form>

                    <h2 className="mb-3 mt-8 text-sm font-semibold text-admin-text">
                        {t('admin.etudiants.historique_inscriptions', 'Historique des inscriptions')}
                    </h2>
                    {etudiant.inscriptions.length === 0 ? (
                        <p className="text-sm text-admin-muted">{t('admin.etudiants.aucune_inscription', 'Aucune inscription enregistrée.')}</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-admin-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('admin.etudiants.annee', 'Année')}</TableHead>
                                        <TableHead>{t('admin.etudiants.col_classe', 'Classe')}</TableHead>
                                        <TableHead>{t('admin.common.status', 'Statut')}</TableHead>
                                        <TableHead>{t('admin.common.date', 'Date')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {etudiant.inscriptions.map((inscription) => (
                                        <TableRow key={inscription.id}>
                                            <TableCell>{inscription.annee}</TableCell>
                                            <TableCell>{inscription.classe?.nom ?? '—'}</TableCell>
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
