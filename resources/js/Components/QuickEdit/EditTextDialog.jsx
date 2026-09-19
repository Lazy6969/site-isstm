import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

export default function EditTextDialog({ open, onClose, contentKey, initialValue }) {
    const form = useForm({ key: contentKey, value: initialValue });

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, value: initialValue });
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier ce contenu</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <Textarea
                        value={form.data.value}
                        onChange={(e) => form.setData('value', e.target.value)}
                        rows={6}
                        autoFocus
                    />
                    {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={onClose}
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
    );
}
