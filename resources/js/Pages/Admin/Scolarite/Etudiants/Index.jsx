import { useMemo, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Plus, Eye, Ban, CheckCircle2, PauseOctagon, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import ViewToggle from '../../../../Components/Admin/ViewToggle';
import { Button } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Badge } from '../../../../Components/ui/badge';
import { Avatar, AvatarFallback } from '../../../../Components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../Components/ui/dialog';
import { useTranslations } from '../../../../lib/useTranslations';

const statutVariants = {
    actif: 'success',
    suspendu: 'warning',
    diplome: 'outline',
    abandon: 'danger',
};

const statutLabels = {
    actif: 'Actif',
    suspendu: 'Suspendu',
    diplome: 'Diplômé',
    abandon: 'Abandon',
};

const statutI18nKeys = {
    actif: 'admin.common.active',
    suspendu: 'admin.etudiants.statut_suspendu',
    diplome: 'admin.etudiants.statut_diplome',
    abandon: 'admin.etudiants.statut_abandon',
};

export default function Index({ etudiants, classes, eligibleUsers }) {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('list');
    const form = useForm({ user_id: '', classe_id: '', matricule: '' });

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return etudiants;
        return etudiants.filter(
            (etudiant) =>
                etudiant.user?.name?.toLowerCase().includes(term) ||
                etudiant.user?.email?.toLowerCase().includes(term) ||
                etudiant.matricule?.toLowerCase().includes(term) ||
                etudiant.classe?.nom?.toLowerCase().includes(term),
        );
    }, [etudiants, search]);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        form.post('/console/scolarite/etudiants', { onSuccess: () => setOpen(false), preserveScroll: true });
    }

    function destroy(etudiant) {
        if (
            !confirm(
                `Supprimer définitivement le compte de ${etudiant.user?.name} ? Il ne pourra plus se connecter et toutes ses données (dossier, inscriptions, publications, messages...) seront effacées. Cette action est irréversible.`,
            )
        )
            return;
        router.delete(`/console/scolarite/etudiants/${etudiant.id}`, { preserveScroll: true });
    }

    function togglePause(etudiant) {
        const suspending = etudiant.statut === 'actif';
        const verb = suspending ? 'mettre en pause' : 'réactiver';
        if (!confirm(`Voulez-vous vraiment ${verb} le compte de ${etudiant.user?.name} ?`)) return;
        router.post(`/console/scolarite/etudiants/${etudiant.id}/pause`, {}, { preserveScroll: true });
    }

    const activeCount = etudiants.filter((e) => e.statut === 'actif').length;

    function pauseAll() {
        if (
            !confirm(
                `Mettre en pause les ${activeCount} compte(s) étudiant(s) actif(s) ? Ils ne pourront plus se connecter et devront faire une demande de réinscription pour récupérer l'accès.`,
            )
        )
            return;
        router.post('/console/scolarite/etudiants/pause-tous', {}, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.etudiants.title', 'Étudiants')}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-admin-text-secondary">
                    {filtered.length} {t('admin.etudiants.count_suffix', 'étudiant(s)')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.etudiants.search_placeholder', 'Rechercher par nom, e-mail, matricule...')}
                            className="pl-9"
                        />
                    </div>
                    <ViewToggle view={view} onChange={setView} />
                    {activeCount > 0 && (
                        <Button onClick={pauseAll} className="bg-transparent text-amber-600 hover:bg-amber-500/10">
                            <PauseOctagon className="h-4 w-4" aria-hidden="true" />
                            {t('admin.etudiants.pause_tous', 'Mettre tous en pause')}
                        </Button>
                    )}
                    <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('admin.etudiants.new_dossier', 'Nouveau dossier')}
                    </Button>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.length === 0 && (
                        <div className="col-span-full rounded-xl border border-admin-border bg-admin-card py-8 text-center text-sm text-admin-muted">
                            {t('admin.etudiants.empty', 'Aucun dossier étudiant pour le moment.')}
                        </div>
                    )}
                    {filtered.map((etudiant) => (
                        <div key={etudiant.id} className="flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-card p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarFallback className="bg-admin-hover text-admin-text">{etudiant.user?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-admin-text">{etudiant.user?.name}</p>
                                    <p className="truncate text-xs text-admin-muted">{etudiant.user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-admin-text-secondary">
                                <span>{etudiant.matricule}</span>
                                <Badge variant={statutVariants[etudiant.statut]}>
                                    {t(statutI18nKeys[etudiant.statut], statutLabels[etudiant.statut])}
                                </Badge>
                            </div>
                            <p className="text-sm text-admin-text-secondary">
                                {etudiant.classe ? `${etudiant.classe.nom} (${etudiant.classe.annee})` : t('admin.etudiants.aucune', 'Aucune')}
                            </p>
                            <div className="mt-auto flex items-center justify-end gap-1 border-t border-admin-border pt-3">
                                <Link
                                    href={`/console/scolarite/etudiants/${etudiant.id}`}
                                    className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                    aria-label={`${t('admin.etudiants.view_dossier_aria', 'Voir le dossier de')} ${etudiant.user?.name}`}
                                >
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                </Link>
                                {(etudiant.statut === 'actif' || etudiant.statut === 'suspendu') && (
                                    <button
                                        type="button"
                                        onClick={() => togglePause(etudiant)}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-amber-500/10 hover:text-amber-600"
                                        aria-label={
                                            etudiant.statut === 'actif'
                                                ? `${t('admin.etudiants.mettre_en_pause', 'Mettre en pause')} — ${etudiant.user?.name}`
                                                : `${t('admin.etudiants.reprendre_compte', 'Réactiver le compte')} — ${etudiant.user?.name}`
                                        }
                                    >
                                        {etudiant.statut === 'actif' ? (
                                            <Ban className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                        )}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => destroy(etudiant)}
                                    className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600"
                                    aria-label={`Supprimer le compte de ${etudiant.user?.name}`}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.etudiants.col_etudiant', 'Étudiant')}</TableHead>
                            <TableHead>{t('admin.etudiants.matricule', 'Matricule')}</TableHead>
                            <TableHead>{t('admin.etudiants.col_classe', 'Classe')}</TableHead>
                            <TableHead>{t('admin.common.status', 'Statut')}</TableHead>
                            <TableHead className="text-right">{t('admin.common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-admin-muted">
                                    {t('admin.etudiants.empty', 'Aucun dossier étudiant pour le moment.')}
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((etudiant) => (
                            <TableRow key={etudiant.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-admin-hover text-admin-text">
                                                {etudiant.user?.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-admin-text">{etudiant.user?.name}</p>
                                            <p className="text-xs text-admin-muted">{etudiant.user?.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{etudiant.matricule}</TableCell>
                                <TableCell>{etudiant.classe ? `${etudiant.classe.nom} (${etudiant.classe.annee})` : '—'}</TableCell>
                                <TableCell>
                                    <Badge variant={statutVariants[etudiant.statut]}>
                                        {t(statutI18nKeys[etudiant.statut], statutLabels[etudiant.statut])}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={`/console/scolarite/etudiants/${etudiant.id}`}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                        aria-label={`${t('admin.etudiants.view_dossier_aria', 'Voir le dossier de')} ${etudiant.user?.name}`}
                                    >
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    {(etudiant.statut === 'actif' || etudiant.statut === 'suspendu') && (
                                        <button
                                            type="button"
                                            onClick={() => togglePause(etudiant)}
                                            className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-amber-500/10 hover:text-amber-600"
                                            aria-label={
                                                etudiant.statut === 'actif'
                                                    ? `${t('admin.etudiants.mettre_en_pause', 'Mettre en pause')} — ${etudiant.user?.name}`
                                                    : `${t('admin.etudiants.reprendre_compte', 'Réactiver le compte')} — ${etudiant.user?.name}`
                                            }
                                        >
                                            {etudiant.statut === 'actif' ? (
                                                <Ban className="h-4 w-4" aria-hidden="true" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                            )}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => destroy(etudiant)}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600"
                                        aria-label={`Supprimer le compte de ${etudiant.user?.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.etudiants.new_dossier_title', 'Nouveau dossier étudiant')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="user_id">{t('admin.etudiants.compte_etudiant', 'Compte étudiant')}</Label>
                            <Select
                                id="user_id"
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">{t('admin.etudiants.select_placeholder', 'Sélectionner...')}</option>
                                {eligibleUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </Select>
                            {eligibleUsers.length === 0 && (
                                <p className="mt-1 text-xs text-admin-muted">
                                    {t(
                                        'admin.etudiants.hint_no_eligible',
                                        "Tous les comptes étudiants ont déjà un dossier, ou aucun n'a encore été créé (via l'approbation d'une préinscription).",
                                    )}
                                </p>
                            )}
                            {form.errors.user_id && <p className="mt-1 text-sm text-red-500">{form.errors.user_id}</p>}
                        </div>

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
                            <Label htmlFor="classe_id">{t('admin.etudiants.classe_optionnelle', 'Classe (optionnel)')}</Label>
                            <Select
                                id="classe_id"
                                value={form.data.classe_id}
                                onChange={(e) => form.setData('classe_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">{t('admin.etudiants.aucune', 'Aucune')}</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom} ({c.niveau}, {c.annee})
                                    </option>
                                ))}
                            </Select>
                            {form.errors.classe_id && <p className="mt-1 text-sm text-red-500">{form.errors.classe_id}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                {t('admin.common.cancel', 'Annuler')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                {t('admin.etudiants.creer_dossier', 'Créer le dossier')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
