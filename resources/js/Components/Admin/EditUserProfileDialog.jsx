import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

/**
 * Lets an admin (users.edit) correct another account's name/email/phone/photo
 * directly from the Utilisateurs list — the role/active toggles already
 * there don't cover identity fields, and a user can't always do this
 * themselves (e.g. a locked-out account, a typo in their own email).
 */
export default function EditUserProfileDialog({ open, onClose, user }) {
    const form = useForm({ name: '', email: '', phone: '', avatar: null });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (open && user) {
            form.setData({ name: user.name, email: user.email, phone: user.phone ?? '', avatar: null });
            form.clearErrors();
            setPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

    if (!user) {
        return null;
    }

    function onAvatarChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('avatar', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/console/users/${user.id}/profile`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Modifier le profil de {user.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {preview ? (
                                <AvatarImage src={preview} alt="" />
                            ) : (
                                user.avatar_path && <AvatarImage src={`/storage/${user.avatar_path}`} alt="" />
                            )}
                            <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="avatar">Photo de profil</Label>
                            <Input id="avatar" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={onAvatarChange} className="mt-1" />
                            {form.errors.avatar && <p className="mt-1 text-sm text-red-500">{form.errors.avatar}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                        {form.errors.email && <p className="text-sm text-red-500">{form.errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        {form.errors.phone && <p className="text-sm text-red-500">{form.errors.phone}</p>}
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
