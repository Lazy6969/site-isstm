import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Images, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';
import PhotosDialog from './PhotosDialog';

const emptyForm = {
    gallery_category_id: '',
    title: '',
    description: '',
    event_date: '',
    location: '',
    author: '',
    status: 'brouillon',
    cover_image: null,
};

const statutVariants = { brouillon: 'outline', publie: 'success' };
const statutLabels = { brouillon: 'Brouillon', publie: 'Publié' };

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Index({ albums, categories }) {
    const { flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [photosAlbum, setPhotosAlbum] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function openEdit(album) {
        setEditing(album);
        form.setData({
            gallery_category_id: album.gallery_category_id ? String(album.gallery_category_id) : '',
            title: album.title,
            description: album.description ?? '',
            event_date: album.event_date ?? '',
            location: album.location ?? '',
            author: album.author ?? '',
            status: album.status,
            cover_image: null,
        });
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function onCoverChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('cover_image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/galerie/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/galerie', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(album) {
        if (!confirm(`Supprimer l'album « ${album.title} » et ses photos ?`)) return;
        router.delete(`/console/galerie/${album.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Galerie">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{albums.length} album(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvel album
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
                            <TableHead>Titre</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Photos</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {albums.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucun album pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {albums.map((album) => (
                            <TableRow key={album.id}>
                                <TableCell className="font-medium">{album.title}</TableCell>
                                <TableCell>{album.category?.name_fr ?? '—'}</TableCell>
                                <TableCell>{album.photos.length}</TableCell>
                                <TableCell>
                                    <Badge variant={statutVariants[album.status]}>{statutLabels[album.status]}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(album.event_date)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => setPhotosAlbum(album)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Gérer les photos de ${album.title}`}
                                        >
                                            <Images className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => openEdit(album)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${album.title}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(album)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${album.title}`}
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
                        <DialogTitle>{editing ? "Modifier l'album" : 'Nouvel album'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Titre</Label>
                            <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" />
                            {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="gallery_category_id">Catégorie</Label>
                                <Select
                                    id="gallery_category_id"
                                    value={form.data.gallery_category_id}
                                    onChange={(e) => form.setData('gallery_category_id', e.target.value)}
                                    className="mt-1.5"
                                >
                                    <option value="">Aucune</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name_fr}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status">Statut</Label>
                                <Select id="status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className="mt-1.5">
                                    <option value="brouillon">Brouillon</option>
                                    <option value="publie">Publié</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="event_date">Date (optionnel)</Label>
                                <Input
                                    id="event_date"
                                    type="date"
                                    value={form.data.event_date ?? ''}
                                    onChange={(e) => form.setData('event_date', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="location">Lieu (optionnel)</Label>
                                <Input
                                    id="location"
                                    value={form.data.location}
                                    onChange={(e) => form.setData('location', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="author">Auteur (optionnel)</Label>
                            <Input id="author" value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} className="mt-1.5" />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (optionnel)</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cover_image">Image de couverture (optionnel)</Label>
                            {(preview || (editing && editing.cover_image)) && (
                                <img
                                    src={preview ?? `/${editing.cover_image}`}
                                    alt=""
                                    className="mt-1.5 h-32 w-full rounded-lg border border-admin-border object-cover"
                                />
                            )}
                            <input
                                id="cover_image"
                                type="file"
                                accept="image/*"
                                onChange={onCoverChange}
                                className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                            />
                            {form.errors.cover_image && <p className="mt-1 text-sm text-red-500">{form.errors.cover_image}</p>}
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

            <PhotosDialog album={photosAlbum} onClose={() => setPhotosAlbum(null)} />
        </AdminLayout>
    );
}
