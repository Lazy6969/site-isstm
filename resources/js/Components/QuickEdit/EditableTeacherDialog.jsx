import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

const CATEGORY_OPTIONS = [
    { value: 'permanent', label: 'Permanent' },
    { value: 'vacataire', label: 'Vacataire' },
];

/**
 * In-place edit for one teacher card on the public Enseignants page — reuses
 * the existing admin endpoint (PUT /console/enseignants/{teacher}, gated by
 * `enseignants.edit`) rather than adding a second update path; only the
 * fields the public card actually shows are editable here (full bio/EN/MG
 * specialty still go through the admin panel).
 */
export default function EditableTeacherDialog({ open, onClose, teacher }) {
    const form = useForm({
        name: teacher.name ?? '',
        category: teacher.category ?? 'permanent',
        specialty_fr: teacher.specialty ?? '',
        photo: null,
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (open) {
            form.setData({
                name: teacher.name ?? '',
                category: teacher.category ?? 'permanent',
                specialty_fr: teacher.specialty ?? '',
                photo: null,
            });
            form.clearErrors();
            setPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, teacher.id]);

    function onPhotoChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.put(`/console/enseignants/${teacher.id}`, {
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
                    <DialogTitle>Modifier l'enseignant</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <img
                        src={preview ?? (teacher.photo_path ? `/${teacher.photo_path}` : '/images/logo-isstm.jpg')}
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
                        <Label htmlFor="teacher-name">Nom</Label>
                        <Input id="teacher-name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1.5" />
                        {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="teacher-specialty">Spécialité</Label>
                        <Input
                            id="teacher-specialty"
                            value={form.data.specialty_fr}
                            onChange={(e) => form.setData('specialty_fr', e.target.value)}
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Label htmlFor="teacher-category">Catégorie</Label>
                        <Select
                            id="teacher-category"
                            value={form.data.category}
                            onChange={(e) => form.setData('category', e.target.value)}
                            className="mt-1.5"
                        >
                            {CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
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
