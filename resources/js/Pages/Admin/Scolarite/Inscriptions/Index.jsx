import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Download, Eye, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Button, buttonVariants } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../Components/ui/dialog';
import { cn } from '../../../../lib/utils';
import { useTranslations } from '../../../../lib/useTranslations';

const statutLabels = {
    brouillon: 'Brouillon',
    en_attente: 'Soumis',
    en_cours_examen: "En cours d'examen",
    a_completer: 'À compléter',
    validee: 'Validée',
    annulee: 'Refusée',
};
const statutI18nKeys = {
    brouillon: 'admin.inscriptions.statut_brouillon',
    en_attente: 'admin.inscriptions.statut_en_attente',
    en_cours_examen: 'admin.inscriptions.statut_en_cours_examen',
    a_completer: 'admin.inscriptions.statut_a_completer',
    validee: 'admin.inscriptions.statut_validee',
    annulee: 'admin.inscriptions.statut_annulee',
};

const typeLabels = { reinscription: 'Réinscription', redoublement: 'Redoublant' };

export default function Index({ inscriptions, etudiants, classes }) {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const form = useForm({ etudiant_id: '', classe_id: '', annee: '', numero: '', date_inscription: '' });

    function openCreate() {
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        form.post('/console/scolarite/inscriptions', { onSuccess: () => setOpen(false), preserveScroll: true });
    }

    function updateStatut(inscription, statut) {
        router.put(`/console/scolarite/inscriptions/${inscription.id}`, { statut, numero: inscription.numero }, { preserveScroll: true });
    }

    function destroy(inscription) {
        if (!confirm(`${t('admin.inscriptions.confirm_delete', 'Supprimer cette inscription')} (${inscription.annee}) ?`)) return;
        router.delete(`/console/scolarite/inscriptions/${inscription.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.inscriptions.title', 'Inscriptions')}>
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">
                    {inscriptions.length} {t('admin.inscriptions.count_suffix', 'inscription(s)')}
                </p>
                <div className="flex gap-2">
                    <a
                        href="/console/scolarite/inscriptions/export"
                        className={cn(buttonVariants(), 'border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover')}
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {t('admin.inscriptions.exporter', 'Exporter')}
                    </a>
                    <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('admin.inscriptions.nouvelle', 'Nouvelle inscription')}
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.inscriptions.col_etudiant', 'Étudiant')}</TableHead>
                            <TableHead>{t('admin.inscriptions.col_type', 'Type')}</TableHead>
                            <TableHead>{t('admin.inscriptions.col_classe', 'Classe')}</TableHead>
                            <TableHead>{t('admin.inscriptions.annee', 'Année')}</TableHead>
                            <TableHead>{t('admin.inscriptions.numero', 'Numéro')}</TableHead>
                            <TableHead>{t('admin.common.status', 'Statut')}</TableHead>
                            <TableHead className="text-right">{t('admin.common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inscriptions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-admin-muted">
                                    {t('admin.inscriptions.empty', 'Aucune inscription pour le moment.')}
                                </TableCell>
                            </TableRow>
                        )}
                        {inscriptions.map((inscription) => (
                            <TableRow key={inscription.id}>
                                <TableCell className="font-medium">{inscription.etudiant?.user?.name}</TableCell>
                                <TableCell>{typeLabels[inscription.type] ?? t('admin.inscriptions.saisie_manuelle', 'Saisie manuelle')}</TableCell>
                                <TableCell>{inscription.classe?.nom ?? '—'}</TableCell>
                                <TableCell>{inscription.annee}</TableCell>
                                <TableCell>{inscription.numero_dossier ?? inscription.numero ?? '—'}</TableCell>
                                <TableCell>
                                    {inscription.type === null ? (
                                        <Select
                                            value={inscription.statut}
                                            onChange={(e) => updateStatut(inscription, e.target.value)}
                                            className="h-8 w-36 text-xs"
                                        >
                                            {Object.entries(statutLabels).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {t(statutI18nKeys[value], label)}
                                                </option>
                                            ))}
                                        </Select>
                                    ) : (
                                        <span className="text-xs font-medium text-admin-text">{t(statutI18nKeys[inscription.statut], statutLabels[inscription.statut])}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {inscription.type !== null && (
                                            <Link
                                                href={`/console/scolarite/inscriptions/${inscription.id}`}
                                                className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                                aria-label={t('admin.inscriptions.examiner_aria', 'Examiner le dossier')}
                                            >
                                                <Eye className="h-4 w-4" aria-hidden="true" />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => destroy(inscription)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={t('admin.inscriptions.supprimer_aria', "Supprimer l'inscription")}
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.inscriptions.nouvelle', 'Nouvelle inscription')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="etudiant_id">{t('admin.inscriptions.col_etudiant', 'Étudiant')}</Label>
                            <Select
                                id="etudiant_id"
                                value={form.data.etudiant_id}
                                onChange={(e) => form.setData('etudiant_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">{t('admin.inscriptions.select_placeholder', 'Sélectionner...')}</option>
                                {etudiants.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.user?.name} ({e.matricule})
                                    </option>
                                ))}
                            </Select>
                            {form.errors.etudiant_id && <p className="mt-1 text-sm text-red-500">{form.errors.etudiant_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="classe_id">{t('admin.inscriptions.col_classe', 'Classe')}</Label>
                            <Select
                                id="classe_id"
                                value={form.data.classe_id}
                                onChange={(e) => form.setData('classe_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">{t('admin.inscriptions.select_placeholder', 'Sélectionner...')}</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom} ({c.niveau}, {c.annee})
                                    </option>
                                ))}
                            </Select>
                            {form.errors.classe_id && <p className="mt-1 text-sm text-red-500">{form.errors.classe_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="annee">{t('admin.inscriptions.annee', 'Année')}</Label>
                                <Input
                                    id="annee"
                                    value={form.data.annee}
                                    onChange={(e) => form.setData('annee', e.target.value)}
                                    placeholder="2025"
                                    className="mt-1.5"
                                />
                                {form.errors.annee && <p className="mt-1 text-sm text-red-500">{form.errors.annee}</p>}
                            </div>
                            <div>
                                <Label htmlFor="numero">{t('admin.inscriptions.numero_optionnel', 'Numéro (optionnel)')}</Label>
                                <Input
                                    id="numero"
                                    value={form.data.numero}
                                    onChange={(e) => form.setData('numero', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="date_inscription">
                                {t('admin.inscriptions.date_inscription_optionnelle', "Date d'inscription (optionnel)")}
                            </Label>
                            <Input
                                id="date_inscription"
                                type="date"
                                value={form.data.date_inscription}
                                onChange={(e) => form.setData('date_inscription', e.target.value)}
                                className="mt-1.5"
                            />
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
                                {t('admin.common.create', 'Créer')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
