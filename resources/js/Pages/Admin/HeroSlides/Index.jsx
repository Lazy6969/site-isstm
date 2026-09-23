import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Video } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = { media: null, display_order: 0 };

export default function Index({ heroSlides }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setPreview(null);
        setPreviewType(null);
        setOpen(true);
    }

    function openEdit(slide) {
        setEditing(slide);
        form.setData({ media: null, display_order: slide.display_order });
        form.clearErrors();
        setPreview(null);
        setPreviewType(null);
        setOpen(true);
    }

    function onMediaChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('media', file);
        setPreview(file ? URL.createObjectURL(file) : null);
        setPreviewType(file?.type.startsWith('video/') ? 'video' : 'image');
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/accueil/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/accueil', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(slide) {
        if (!confirm('Supprimer cette diapositive ?')) return;
        router.delete(`/console/accueil/${slide.id}`, { preserveScroll: true });
    }

    const shownType = previewType ?? editing?.media_type;
    const shownSrc = preview ?? (editing ? `/${editing.image_path}` : null);

    return (
        <AdminLayout title="Images de l'accueil">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{heroSlides.length} diapositive(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Ajouter une image ou vidéo
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aperçu</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {heroSlides.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-admin-muted">
                                    Aucune image pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {heroSlides.map((slide) => (
                            <TableRow key={slide.id}>
                                <TableCell>
                                    {slide.media_type === 'video' ? (
                                        <video
                                            src={`/${slide.image_path}`}
                                            muted
                                            className="h-14 w-28 rounded-lg border border-admin-border object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={`/${slide.image_path}`}
                                            alt=""
                                            className="h-14 w-28 rounded-lg border border-admin-border object-cover"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-admin-text-secondary">
                                        {slide.media_type === 'video' && <Video className="h-3.5 w-3.5" aria-hidden="true" />}
                                        {slide.media_type === 'video' ? 'Vidéo' : 'Image'}
                                    </span>
                                </TableCell>
                                <TableCell>{slide.display_order}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(slide)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label="Modifier cette diapositive"
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(slide)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label="Supprimer cette diapositive"
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
                        <DialogTitle>{editing ? 'Modifier la diapositive' : 'Nouvelle diapositive'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="media">Image ou vidéo {editing ? '(optionnel)' : ''}</Label>
                            {shownSrc &&
                                (shownType === 'video' ? (
                                    <video
                                        src={shownSrc}
                                        controls
                                        muted
                                        className="mt-1.5 h-40 w-full rounded-lg border border-admin-border object-cover"
                                    />
                                ) : (
                                    <img
                                        src={shownSrc}
                                        alt=""
                                        className="mt-1.5 h-40 w-full rounded-lg border border-admin-border object-cover"
                                    />
                                ))}
                            <input
                                id="media"
                                type="file"
                                accept="image/*,video/*"
                                onChange={onMediaChange}
                                className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                            />
                            <p className="mt-1 text-xs text-admin-muted">
                                Une vidéo joue jusqu'à sa fin avant de passer à la diapositive suivante ; une image reste 5 secondes.
                            </p>
                            {form.errors.media && <p className="mt-1 text-sm text-red-500">{form.errors.media}</p>}
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
                                {editing ? 'Enregistrer' : 'Ajouter'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
