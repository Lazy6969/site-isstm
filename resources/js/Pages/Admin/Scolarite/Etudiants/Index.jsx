import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Plus, Eye, Trash2 } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Button } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Badge } from '../../../../Components/ui/badge';
import { Avatar, AvatarFallback } from '../../../../Components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../Components/ui/dialog';

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

export default function Index({ etudiants, classes, eligibleUsers }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ user_id: '', classe_id: '', matricule: '' });

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
        if (!confirm(`Supprimer le dossier de ${etudiant.user?.name} ? Ses inscriptions seront supprimées avec.`)) return;
        router.delete(`/console/scolarite/etudiants/${etudiant.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Étudiants">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{etudiants.length} étudiant(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouveau dossier
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Étudiant</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {etudiants.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-admin-muted">
                                    Aucun dossier étudiant pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {etudiants.map((etudiant) => (
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
                                    <Badge variant={statutVariants[etudiant.statut]}>{statutLabels[etudiant.statut]}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={`/console/scolarite/etudiants/${etudiant.id}`}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                        aria-label={`Voir le dossier de ${etudiant.user?.name}`}
                                    >
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => destroy(etudiant)}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600"
                                        aria-label={`Supprimer le dossier de ${etudiant.user?.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau dossier étudiant</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="user_id">Compte étudiant</Label>
                            <Select
                                id="user_id"
                                value={form.data.user_id}
                                onChange={(e) => form.setData('user_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">Sélectionner...</option>
                                {eligibleUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </Select>
                            {eligibleUsers.length === 0 && (
                                <p className="mt-1 text-xs text-admin-muted">
                                    Tous les comptes étudiants ont déjà un dossier, ou aucun n'a encore été créé (via l'approbation d'une
                                    préinscription).
                                </p>
                            )}
                            {form.errors.user_id && <p className="mt-1 text-sm text-red-500">{form.errors.user_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="matricule">Matricule</Label>
                            <Input
                                id="matricule"
                                value={form.data.matricule}
                                onChange={(e) => form.setData('matricule', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.matricule && <p className="mt-1 text-sm text-red-500">{form.errors.matricule}</p>}
                        </div>

                        <div>
                            <Label htmlFor="classe_id">Classe (optionnel)</Label>
                            <Select
                                id="classe_id"
                                value={form.data.classe_id}
                                onChange={(e) => form.setData('classe_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">Aucune</option>
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
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                Créer le dossier
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
