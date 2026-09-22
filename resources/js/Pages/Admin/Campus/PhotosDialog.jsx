import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../Components/ui/dialog';
import { Button } from '../../../Components/ui/button';

export default function PhotosDialog({ bloc, onClose }) {
    const [files, setFiles] = useState([]);
    const form = useForm({ photos: [] });
    const images = bloc?.images ?? [];

    function onFilesChange(e) {
        const selected = Array.from(e.target.files ?? []);
        setFiles(selected);
        form.setData('photos', selected);
    }

    function upload(e) {
        e.preventDefault();
        form.post(`/console/campus/${bloc.id}/photos`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setFiles([]);
                form.reset();
            },
        });
    }

    function destroyPhoto(index) {
        if (!confirm('Supprimer cette photo ?')) return;
        router.delete(`/console/campus/${bloc.id}/photos/${index}`, { preserveScroll: true });
    }

    return (
        <Dialog open={bloc !== null} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Photos — {bloc?.nom}</DialogTitle>
                </DialogHeader>

                {bloc && (
                    <>
                        <form onSubmit={upload} className="flex items-end gap-3">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={onFilesChange}
                                    className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                                />
                                {form.errors['photos.0'] && <p className="mt-1 text-sm text-red-500">{form.errors['photos.0']}</p>}
                            </div>
                            <Button
                                type="submit"
                                disabled={form.processing || files.length === 0}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                <Upload className="h-4 w-4" aria-hidden="true" />
                                Ajouter
                            </Button>
                        </form>

                        {images.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-admin-muted">Aucune photo pour ce bloc.</p>
                        ) : (
                            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {images.map((image, index) => (
                                    <div key={image} className="group relative aspect-square overflow-hidden rounded-lg border border-admin-border">
                                        <img src={`/${image}`} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => destroyPhoto(index)}
                                            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition group-hover:opacity-100"
                                            aria-label="Supprimer cette photo"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
