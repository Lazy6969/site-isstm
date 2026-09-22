import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { roleLabels } from '../../../Components/Parcours/orgChartData';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

export default function Index({ orgPeople }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const form = useForm({ name: '', photo: null });

    function openEdit(person) {
        setEditing(person);
        form.setData({ name: person.name, photo: null });
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
        form.put(`/console/organigramme/${editing.id}`, {
            onSuccess: () => setOpen(false),
            preserveScroll: true,
            forceFormData: true,
        });
    }

    return (
        <AdminLayout title="Organigramme">
            <div className="mb-5">
                <p className="text-sm text-admin-text-secondary">{orgPeople.length} poste(s)</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Photo</TableHead>
                            <TableHead>Poste</TableHead>
                            <TableHead>Nom actuel</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orgPeople.map((person) => (
                            <TableRow key={person.id}>
                                <TableCell>
                                    {person.photo_path ? (
                                        <img
                                            src={`/${person.photo_path}`}
                                            alt=""
                                            className="h-10 w-10 rounded-full border border-admin-border object-cover"
                                        />
                                    ) : (
                                        <span className="text-admin-muted">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{roleLabels[person.title_key] ?? person.title_key}</TableCell>
                                <TableCell>{person.name}</TableCell>
                                <TableCell>{person.sort_order}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(person)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${roleLabels[person.title_key] ?? person.title_key}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
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
                        <DialogTitle>{editing ? `Modifier — ${roleLabels[editing.title_key] ?? editing.title_key}` : ''}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nom</Label>
                            <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1.5" />
                            {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="photo">Photo (optionnel)</Label>
                            {(preview || (editing && editing.photo_path)) && (
                                <img
                                    src={preview ?? `/${editing.photo_path}`}
                                    alt=""
                                    className="mt-1.5 h-24 w-24 rounded-full border border-admin-border object-cover"
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

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
