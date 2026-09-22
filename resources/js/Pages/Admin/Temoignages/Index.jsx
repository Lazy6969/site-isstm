import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Textarea } from '../../../Components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = {
    author_name: '',
    program: '',
    quote_fr: '',
    quote_en: '',
    quote_mg: '',
    display_order: '',
    image: null,
};

function truncate(value, length = 80) {
    if (!value) return '—';
    return value.length > length ? `${value.slice(0, length)}…` : value;
}

export default function Index({ testimonials }) {
    const { flash } = usePage().props;
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

    function openEdit(testimonial) {
        setEditing(testimonial);
        form.setData({
            author_name: testimonial.author_name,
            program: testimonial.program ?? '',
            quote_fr: testimonial.quote_fr ?? '',
            quote_en: testimonial.quote_en ?? '',
            quote_mg: testimonial.quote_mg ?? '',
            display_order: testimonial.display_order ?? '',
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
            form.put(`/console/temoignages/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/temoignages', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(testimonial) {
        if (!confirm(`Supprimer le témoignage de « ${testimonial.author_name} » ?`)) return;
        router.delete(`/console/temoignages/${testimonial.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Témoignages">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{testimonials.length} témoignage(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouveau témoignage
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
                            <TableHead>Photo</TableHead>
                            <TableHead>Auteur</TableHead>
                            <TableHead>Filière/Programme</TableHead>
                            <TableHead>Extrait</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testimonials.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucun témoignage pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {testimonials.map((testimonial) => (
                            <TableRow key={testimonial.id}>
                                <TableCell>
                                    {testimonial.image_path ? (
                                        <img
                                            src={`/${testimonial.image_path}`}
                                            alt=""
                                            className="h-10 w-10 rounded-full border border-admin-border object-cover"
                                        />
                                    ) : (
                                        <span className="text-admin-muted">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{testimonial.author_name}</TableCell>
                                <TableCell>{testimonial.program ?? '—'}</TableCell>
                                <TableCell className="max-w-xs whitespace-normal">{truncate(testimonial.quote_fr)}</TableCell>
                                <TableCell>{testimonial.display_order ?? '—'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(testimonial)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${testimonial.author_name}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(testimonial)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${testimonial.author_name}`}
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
                        <DialogTitle>{editing ? 'Modifier le témoignage' : 'Nouveau témoignage'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="author_name">Auteur</Label>
                                <Input
                                    id="author_name"
                                    value={form.data.author_name}
                                    onChange={(e) => form.setData('author_name', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.author_name && <p className="mt-1 text-sm text-red-500">{form.errors.author_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="program">Filière/Programme (optionnel)</Label>
                                <Input
                                    id="program"
                                    value={form.data.program}
                                    onChange={(e) => form.setData('program', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="quote_fr">Citation (français)</Label>
                            <Textarea
                                id="quote_fr"
                                value={form.data.quote_fr}
                                onChange={(e) => form.setData('quote_fr', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                            {form.errors.quote_fr && <p className="mt-1 text-sm text-red-500">{form.errors.quote_fr}</p>}
                        </div>

                        <div>
                            <Label htmlFor="quote_en">Citation (anglais, optionnel)</Label>
                            <Textarea
                                id="quote_en"
                                value={form.data.quote_en}
                                onChange={(e) => form.setData('quote_en', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="quote_mg">Citation (malgache, optionnel)</Label>
                            <Textarea
                                id="quote_mg"
                                value={form.data.quote_mg}
                                onChange={(e) => form.setData('quote_mg', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="image">Photo (optionnel)</Label>
                            {(preview || (editing && editing.image_path)) && (
                                <img
                                    src={preview ?? `/${editing.image_path}`}
                                    alt=""
                                    className="mt-1.5 h-32 w-32 rounded-full border border-admin-border object-cover"
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

                        <div>
                            <Label htmlFor="display_order">Ordre d'affichage (optionnel)</Label>
                            <Input
                                id="display_order"
                                type="number"
                                value={form.data.display_order}
                                onChange={(e) => form.setData('display_order', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.display_order && <p className="mt-1 text-sm text-red-500">{form.errors.display_order}</p>}
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
