import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Button } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../Components/ui/dialog';

const statutLabels = { en_attente: 'En attente', validee: 'Validée', annulee: 'Annulée' };

export default function Index({ inscriptions, etudiants, classes }) {
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
        if (!confirm(`Supprimer cette inscription (${inscription.annee}) ?`)) return;
        router.delete(`/console/scolarite/inscriptions/${inscription.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Inscriptions">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{inscriptions.length} inscription(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvelle inscription
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Étudiant</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Année</TableHead>
                            <TableHead>Numéro</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inscriptions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucune inscription pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {inscriptions.map((inscription) => (
                            <TableRow key={inscription.id}>
                                <TableCell className="font-medium">{inscription.etudiant?.user?.name}</TableCell>
                                <TableCell>{inscription.classe?.nom ?? '—'}</TableCell>
                                <TableCell>{inscription.annee}</TableCell>
                                <TableCell>{inscription.numero ?? '—'}</TableCell>
                                <TableCell>
                                    <Select
                                        value={inscription.statut}
                                        onChange={(e) => updateStatut(inscription, e.target.value)}
                                        className="h-8 w-36 text-xs"
                                    >
                                        {Object.entries(statutLabels).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => destroy(inscription)}
                                        className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                        aria-label="Supprimer l'inscription"
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
                        <DialogTitle>Nouvelle inscription</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="etudiant_id">Étudiant</Label>
                            <Select
                                id="etudiant_id"
                                value={form.data.etudiant_id}
                                onChange={(e) => form.setData('etudiant_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">Sélectionner...</option>
                                {etudiants.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.user?.name} ({e.matricule})
                                    </option>
                                ))}
                            </Select>
                            {form.errors.etudiant_id && <p className="mt-1 text-sm text-red-500">{form.errors.etudiant_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="classe_id">Classe</Label>
                            <Select
                                id="classe_id"
                                value={form.data.classe_id}
                                onChange={(e) => form.setData('classe_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">Sélectionner...</option>
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
                                <Label htmlFor="annee">Année</Label>
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
                                <Label htmlFor="numero">Numéro (optionnel)</Label>
                                <Input
                                    id="numero"
                                    value={form.data.numero}
                                    onChange={(e) => form.setData('numero', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="date_inscription">Date d'inscription (optionnel)</Label>
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
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                Créer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
