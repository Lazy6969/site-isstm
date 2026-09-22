import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = {
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    lieu: '',
    categorie: 'general',
    image: null,
};

const categorieOptions = [
    { value: 'general', label: 'Général' },
    { value: 'examen', label: 'Examen' },
    { value: 'ceremonie', label: 'Cérémonie' },
    { value: 'atelier', label: 'Atelier' },
    { value: 'vacances', label: 'Vacances' },
    { value: 'inscription', label: 'Inscription' },
];

const categorieLabels = Object.fromEntries(categorieOptions.map((c) => [c.value, c.label]));

function toDatetimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ evenements }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function openEdit(evenement) {
        setEditing(evenement);
        form.setData({
            titre: evenement.titre,
            description: evenement.description ?? '',
            date_debut: toDatetimeLocal(evenement.date_debut),
            date_fin: toDatetimeLocal(evenement.date_fin),
            lieu: evenement.lieu ?? '',
            categorie: evenement.categorie,
            image: null,
        });
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function onImageChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/evenements/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/evenements', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(evenement) {
        if (!confirm(`Supprimer l'événement « ${evenement.titre} » ?`)) return;
        router.delete(`/console/evenements/${evenement.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Événements">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{evenements.length} événement(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvel événement
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Lieu</TableHead>
                            <TableHead>Début</TableHead>
                            <TableHead>Fin</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {evenements.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucun événement pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {evenements.map((evenement) => (
                            <TableRow key={evenement.id}>
                                <TableCell className="font-medium">{evenement.titre}</TableCell>
                                <TableCell>
                                    <Badge>{categorieLabels[evenement.categorie] ?? evenement.categorie}</Badge>
                                </TableCell>
                                <TableCell>{evenement.lieu ?? '—'}</TableCell>
                                <TableCell>{formatDate(evenement.date_debut)}</TableCell>
                                <TableCell>{formatDate(evenement.date_fin)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(evenement)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${evenement.titre}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(evenement)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${evenement.titre}`}
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
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Modifier l'événement" : 'Nouvel événement'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="titre">Titre</Label>
                            <Input id="titre" value={form.data.titre} onChange={(e) => form.setData('titre', e.target.value)} className="mt-1.5" />
                            {form.errors.titre && <p className="mt-1 text-sm text-red-500">{form.errors.titre}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="categorie">Catégorie</Label>
                                <Select
                                    id="categorie"
                                    value={form.data.categorie}
                                    onChange={(e) => form.setData('categorie', e.target.value)}
                                    className="mt-1.5"
                                >
                                    {categorieOptions.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="lieu">Lieu (optionnel)</Label>
                                <Input id="lieu" value={form.data.lieu} onChange={(e) => form.setData('lieu', e.target.value)} className="mt-1.5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="date_debut">Date de début</Label>
                                <Input
                                    id="date_debut"
                                    type="datetime-local"
                                    value={form.data.date_debut}
                                    onChange={(e) => form.setData('date_debut', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.date_debut && <p className="mt-1 text-sm text-red-500">{form.errors.date_debut}</p>}
                            </div>
                            <div>
                                <Label htmlFor="date_fin">Date de fin (optionnel)</Label>
                                <Input
                                    id="date_fin"
                                    type="datetime-local"
                                    value={form.data.date_fin}
                                    onChange={(e) => form.setData('date_fin', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.date_fin && <p className="mt-1 text-sm text-red-500">{form.errors.date_fin}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description (optionnel)</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                rows={4}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="image">Image (optionnel)</Label>
                            {(preview || (editing && editing.image_path)) && (
                                <img
                                    src={preview ?? `/${editing.image_path}`}
                                    alt=""
                                    className="mt-1.5 h-32 w-full rounded-lg border border-admin-border object-cover"
                                />
                            )}
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                            />
                            {form.errors.image && <p className="mt-1 text-sm text-red-500">{form.errors.image}</p>}
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
