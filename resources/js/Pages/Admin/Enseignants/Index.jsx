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
    name: '',
    category: 'permanent',
    specialty_fr: '',
    specialty_en: '',
    specialty_mg: '',
    description_fr: '',
    description_en: '',
    description_mg: '',
    email: '',
    display_order: '',
    photo: null,
};

const categorieVariants = { permanent: 'success', vacataire: 'outline' };
const categorieLabels = { permanent: 'Enseignant permanent', vacataire: 'Enseignant vacataire' };

export default function Index({ teachers }) {
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

    function openEdit(teacher) {
        setEditing(teacher);
        form.setData({
            name: teacher.name,
            category: teacher.category,
            specialty_fr: teacher.specialty_fr ?? '',
            specialty_en: teacher.specialty_en ?? '',
            specialty_mg: teacher.specialty_mg ?? '',
            description_fr: teacher.description_fr ?? '',
            description_en: teacher.description_en ?? '',
            description_mg: teacher.description_mg ?? '',
            email: teacher.email ?? '',
            display_order: teacher.display_order ?? '',
            photo: null,
        });
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function onPhotoChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/enseignants/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/enseignants', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(teacher) {
        if (!confirm(`Supprimer l'enseignant « ${teacher.name} » ?`)) return;
        router.delete(`/console/enseignants/${teacher.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Enseignants">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{teachers.length} enseignant(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvel enseignant
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Spécialité</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucun enseignant pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {teachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell className="font-medium">{teacher.name}</TableCell>
                                <TableCell>
                                    <Badge variant={categorieVariants[teacher.category]}>{categorieLabels[teacher.category]}</Badge>
                                </TableCell>
                                <TableCell>{teacher.specialty_fr ?? '—'}</TableCell>
                                <TableCell>{teacher.email ?? '—'}</TableCell>
                                <TableCell>{teacher.display_order ?? '—'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(teacher)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${teacher.name}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(teacher)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${teacher.name}`}
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
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Modifier l'enseignant" : 'Nouvel enseignant'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="name">Nom</Label>
                                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1.5" />
                                {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="category">Catégorie</Label>
                                <Select
                                    id="category"
                                    value={form.data.category}
                                    onChange={(e) => form.setData('category', e.target.value)}
                                    className="mt-1.5"
                                >
                                    <option value="permanent">Enseignant permanent</option>
                                    <option value="vacataire">Enseignant vacataire</option>
                                </Select>
                                {form.errors.category && <p className="mt-1 text-sm text-red-500">{form.errors.category}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <Label htmlFor="specialty_fr">Spécialité (FR)</Label>
                                <Input
                                    id="specialty_fr"
                                    value={form.data.specialty_fr}
                                    onChange={(e) => form.setData('specialty_fr', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.specialty_fr && <p className="mt-1 text-sm text-red-500">{form.errors.specialty_fr}</p>}
                            </div>
                            <div>
                                <Label htmlFor="specialty_en">Spécialité (EN)</Label>
                                <Input
                                    id="specialty_en"
                                    value={form.data.specialty_en}
                                    onChange={(e) => form.setData('specialty_en', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.specialty_en && <p className="mt-1 text-sm text-red-500">{form.errors.specialty_en}</p>}
                            </div>
                            <div>
                                <Label htmlFor="specialty_mg">Spécialité (MG)</Label>
                                <Input
                                    id="specialty_mg"
                                    value={form.data.specialty_mg}
                                    onChange={(e) => form.setData('specialty_mg', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.specialty_mg && <p className="mt-1 text-sm text-red-500">{form.errors.specialty_mg}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <Label htmlFor="description_fr">Description (FR)</Label>
                                <Textarea
                                    id="description_fr"
                                    value={form.data.description_fr}
                                    onChange={(e) => form.setData('description_fr', e.target.value)}
                                    rows={3}
                                    className="mt-1.5"
                                />
                                {form.errors.description_fr && <p className="mt-1 text-sm text-red-500">{form.errors.description_fr}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description_en">Description (EN)</Label>
                                <Textarea
                                    id="description_en"
                                    value={form.data.description_en}
                                    onChange={(e) => form.setData('description_en', e.target.value)}
                                    rows={3}
                                    className="mt-1.5"
                                />
                                {form.errors.description_en && <p className="mt-1 text-sm text-red-500">{form.errors.description_en}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description_mg">Description (MG)</Label>
                                <Textarea
                                    id="description_mg"
                                    value={form.data.description_mg}
                                    onChange={(e) => form.setData('description_mg', e.target.value)}
                                    rows={3}
                                    className="mt-1.5"
                                />
                                {form.errors.description_mg && <p className="mt-1 text-sm text-red-500">{form.errors.description_mg}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email (optionnel)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.email && <p className="mt-1 text-sm text-red-500">{form.errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="photo">Photo (optionnel)</Label>
                                {(preview || (editing && editing.photo_path)) && (
                                    <img
                                        src={preview ?? `/${editing.photo_path}`}
                                        alt=""
                                        className="mt-1.5 h-32 w-full rounded-lg border border-admin-border object-cover"
                                    />
                                )}
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={onPhotoChange}
                                    className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                                />
                                {form.errors.photo && <p className="mt-1 text-sm text-red-500">{form.errors.photo}</p>}
                            </div>
                            <div>
                                <Label htmlFor="display_order">Ordre d'affichage</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    value={form.data.display_order}
                                    onChange={(e) => form.setData('display_order', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.display_order && <p className="mt-1 text-sm text-red-500">{form.errors.display_order}</p>}
                            </div>
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
