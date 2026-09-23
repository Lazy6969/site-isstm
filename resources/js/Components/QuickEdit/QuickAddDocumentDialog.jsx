import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

/**
 * Minimal "quick add" for an administrative document, reachable from the
 * public Documents page in quick-edit mode — posts to the same admin
 * endpoint (POST /console/documents) the admin panel's own form uses. The
 * public/étudiant choice is the audience field the admin panel already has
 * (Document.category, Rule::in(['public', 'etudiant'])).
 */
export default function QuickAddDocumentDialog({ open, onClose }) {
    const form = useForm({ title: '', category: 'public', file: null });

    function submit(e) {
        e.preventDefault();
        form.post('/console/documents', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un document</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="qad-title">Titre</Label>
                        <Input id="qad-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" autoFocus />
                        {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                    </div>
                    <div>
                        <Label htmlFor="qad-category">Destiné à</Label>
                        <Select id="qad-category" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} className="mt-1.5">
                            <option value="public">Public</option>
                            <option value="etudiant">Étudiants</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="qad-file">Fichier (PDF, Word, Excel, PowerPoint)</Label>
                        <input
                            id="qad-file"
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                            className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                        />
                        {form.errors.file && <p className="mt-1 text-sm text-red-500">{form.errors.file}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
