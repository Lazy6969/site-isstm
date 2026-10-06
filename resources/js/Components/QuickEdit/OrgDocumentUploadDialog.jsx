import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

/**
 * Uploads (or replaces) the fixed file behind one of the Parcours page's
 * document format slots (pdf/word/image × organigramme/cursus) — see
 * Admin\OrgDocumentController. Unlike QuickAddDocumentDialog, there's no
 * title/audience to pick: the slug already fixes both.
 */
export default function OrgDocumentUploadDialog({ open, onClose, slug, title }) {
    const form = useForm({ file: null });

    useEffect(() => {
        if (open) {
            form.setData('file', null);
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        form.post(`/console/organigramme/documents/${slug}`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}

                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
