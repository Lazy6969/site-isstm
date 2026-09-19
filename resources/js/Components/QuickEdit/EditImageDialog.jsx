import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

export default function EditImageDialog({ open, onClose, contentKey, currentValue }) {
    const form = useForm({ key: contentKey, file: null });
    const [preview, setPreview] = useState(null);

    function onFileChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('file', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier l'image</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <img
                        src={preview ?? `/${currentValue}`}
                        alt=""
                        className="h-40 w-full rounded-lg border border-admin-border object-cover"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.file}
                            className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                        >
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
