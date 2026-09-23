import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

/**
 * Minimal "quick add" for a news article, reachable straight from the public
 * Actualités page in quick-edit mode — posts to the same admin endpoint
 * (POST /console/actualites) the full Admin/Actualites/Index.jsx form uses,
 * as a draft the admin can flesh out later from the admin panel.
 */
export default function QuickAddNewsDialog({ open, onClose }) {
    const form = useForm({ title: '', excerpt: '', status: 'brouillon', image: null });
    const [preview, setPreview] = useState(null);

    function onImageChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.post('/console/actualites', {
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
                    <DialogTitle>Ajouter une actualité</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="qan-title">Titre</Label>
                        <Input id="qan-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" autoFocus />
                        {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="qan-excerpt">Résumé (optionnel)</Label>
                        <Textarea
                            id="qan-excerpt"
                            value={form.data.excerpt}
                            onChange={(e) => form.setData('excerpt', e.target.value)}
                            rows={3}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="qan-image">Image (optionnel)</Label>
                        {preview && <img src={preview} alt="" className="mt-1.5 h-32 w-full rounded-lg border border-admin-border object-cover" />}
                        <input
                            id="qan-image"
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                        />
                    </div>
                    <p className="text-xs text-admin-muted">
                        Créée comme brouillon — complétez la catégorie, le contenu et publiez-la depuis l'admin Actualités.
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
