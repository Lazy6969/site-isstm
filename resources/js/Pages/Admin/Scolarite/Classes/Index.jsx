import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Button } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../Components/ui/dialog';

const emptyForm = { nom: '', filiere_id: '', niveau: '', annee: '', effectif_max: '' };

export default function Index({ classes, filieres }) {
    const { flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(classe) {
        setEditing(classe);
        form.setData({
            nom: classe.nom,
            filiere_id: String(classe.filiere_id),
            niveau: classe.niveau,
            annee: classe.annee,
            effectif_max: classe.effectif_max ?? '',
        });
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/scolarite/classes/${editing.id}`, { onSuccess, preserveScroll: true });
        } else {
            form.post('/console/scolarite/classes', { onSuccess, preserveScroll: true });
        }
    }

    function destroy(classe) {
        if (!confirm(`Supprimer la classe « ${classe.nom} » ?`)) return;
        router.delete(`/console/scolarite/classes/${classe.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Classes">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{classes.length} classe(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvelle classe
                </Button>
            </div>

            {flash?.status && (
                <p className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {flash.status}
                </p>
            )}

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Filière</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Année</TableHead>
                            <TableHead>Étudiants</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucune classe pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {classes.map((classe) => (
                            <TableRow key={classe.id}>
                                <TableCell className="font-medium">{classe.nom}</TableCell>
                                <TableCell>{classe.filiere?.nom_fr ?? '—'}</TableCell>
                                <TableCell>{classe.niveau}</TableCell>
                                <TableCell>{classe.annee}</TableCell>
                                <TableCell>
                                    {classe.etudiants_count}
                                    {classe.effectif_max ? ` / ${classe.effectif_max}` : ''}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(classe)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${classe.nom}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(classe)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${classe.nom}`}
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
                        <DialogTitle>{editing ? 'Modifier la classe' : 'Nouvelle classe'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="nom">Nom</Label>
                            <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                            {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                        </div>

                        <div>
                            <Label htmlFor="filiere_id">Filière</Label>
                            <Select
                                id="filiere_id"
                                value={form.data.filiere_id}
                                onChange={(e) => form.setData('filiere_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">Sélectionner...</option>
                                {filieres.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nom_fr}
                                    </option>
                                ))}
                            </Select>
                            {form.errors.filiere_id && <p className="mt-1 text-sm text-red-500">{form.errors.filiere_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="niveau">Niveau</Label>
                                <Input
                                    id="niveau"
                                    value={form.data.niveau}
                                    onChange={(e) => form.setData('niveau', e.target.value)}
                                    placeholder="L1"
                                    className="mt-1.5"
                                />
                                {form.errors.niveau && <p className="mt-1 text-sm text-red-500">{form.errors.niveau}</p>}
                            </div>
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
                        </div>

                        <div>
                            <Label htmlFor="effectif_max">Effectif maximum (optionnel)</Label>
                            <Input
                                id="effectif_max"
                                type="number"
                                min="1"
                                value={form.data.effectif_max}
                                onChange={(e) => form.setData('effectif_max', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.effectif_max && <p className="mt-1 text-sm text-red-500">{form.errors.effectif_max}</p>}
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
                                {editing ? 'Enregistrer' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
