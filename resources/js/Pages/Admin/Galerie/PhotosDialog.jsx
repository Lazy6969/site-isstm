import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../Components/ui/dialog';
import { Button } from '../../../Components/ui/button';

export default function PhotosDialog({ album, onClose }) {
    const [files, setFiles] = useState([]);
    const form = useForm({ photos: [] });

    function onFilesChange(e) {
        const selected = Array.from(e.target.files ?? []);
        setFiles(selected);
        form.setData('photos', selected);
    }

    function upload(e) {
        e.preventDefault();
        form.post(`/console/galerie/${album.id}/photos`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setFiles([]);
                form.reset();
            },
        });
    }

    function destroyPhoto(photo) {
        if (!confirm('Supprimer cette photo ?')) return;
        router.delete(`/console/galerie/photos/${photo.id}`, { preserveScroll: true });
    }

    return (
        <Dialog open={album !== null} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Photos — {album?.title}</DialogTitle>
                </DialogHeader>

                {album && (
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

                        {album.photos.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-admin-muted">Aucune photo dans cet album.</p>
                        ) : (
                            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {album.photos.map((photo) => (
                                    <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-admin-border">
                                        <img src={`/${photo.image_path}`} alt={photo.alt_text ?? ''} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => destroyPhoto(photo)}
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
