import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

/**
 * In-place edit for one organigramme node's person — reuses the existing
 * admin endpoint (PUT /console/organigramme/{orgPerson}, gated by
 * `organigramme.edit`).
 */
export default function EditableOrgPersonDialog({ open, onClose, person, title }) {
    const form = useForm({ name: person.name ?? '', photo: null });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (open) {
            form.setData({ name: person.name ?? '', photo: null });
            form.clearErrors();
            setPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, person.id]);

    function onPhotoChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.put(`/console/organigramme/${person.id}`, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier — {title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <img
                        src={preview ?? (person.photo_path ? `/${person.photo_path}` : '/images/logo-isstm.jpg')}
                        alt=""
                        className="h-24 w-24 rounded-full border border-admin-border object-cover"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onPhotoChange}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.photo && <p className="text-sm text-red-500">{form.errors.photo}</p>}

                    <div>
                        <Label htmlFor="org-person-name">Nom</Label>
                        <Input
                            id="org-person-name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="mt-1.5"
                        />
                        {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
                    </div>

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
