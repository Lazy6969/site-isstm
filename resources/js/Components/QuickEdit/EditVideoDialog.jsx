import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

export default function EditVideoDialog({ open, onClose, contentKey, currentValue }) {
    const form = useForm({ key: contentKey, file: null });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, file: null });
            form.clearErrors();
            setPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Modifier la vidéo</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    {(preview ?? currentValue) && (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                            src={preview ?? `/${currentValue}`}
                            controls
                            muted
                            className="h-48 w-full rounded-lg border border-admin-border bg-black object-contain"
                        />
                    )}
                    <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={onFileChange}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}
                    <p className="text-xs text-admin-text-secondary">Formats acceptés : MP4, WebM, MOV — 50 Mo maximum.</p>

                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
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
