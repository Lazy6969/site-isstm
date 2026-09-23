import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

/**
 * Minimal "quick add" for a gallery album, reachable from the public Galerie
 * page in quick-edit mode — posts to the same admin endpoint
 * (POST /console/galerie) the full Admin/Galerie/Index.jsx form uses, as a
 * draft the admin can add photos to and publish later from the admin panel.
 */
export default function QuickAddGalleryDialog({ open, onClose }) {
    const form = useForm({ title: '', location: '', status: 'brouillon', cover_image: null });
    const [preview, setPreview] = useState(null);

    function onImageChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('cover_image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.post('/console/galerie', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setPreview(null);
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un album</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="qag-title">Titre</Label>
                        <Input id="qag-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" autoFocus />
                        {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="qag-location">Lieu (optionnel)</Label>
                        <Input
                            id="qag-location"
                            value={form.data.location}
                            onChange={(e) => form.setData('location', e.target.value)}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="qag-cover">Image de couverture (optionnel)</Label>
                        {preview && <img src={preview} alt="" className="mt-1.5 h-32 w-full rounded-lg border border-admin-border object-cover" />}
                        <input
                            id="qag-cover"
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                        />
                    </div>
                    <p className="text-xs text-admin-muted">
                        Créé comme brouillon — ajoutez des photos et publiez-le depuis l'admin Galerie.
                    </p>
                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            Créer le brouillon
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
