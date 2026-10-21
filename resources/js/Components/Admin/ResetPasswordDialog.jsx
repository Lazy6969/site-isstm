import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Lets a Super Admin (users.edit) set a new password for any account — the
 * only other path to a password change is the account's own "forgot
 * password" e-mail flow, which doesn't help a locked-out user or a demo
 * account nobody actually reads mail for.
 */
export default function ResetPasswordDialog({ open, onClose, user }) {
    const { t } = useTranslations();
    const form = useForm({ password: '', password_confirmation: '' });

    useEffect(() => {
        if (open) {
            form.reset('password', 'password_confirmation');
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

    if (!user) {
        return null;
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/console/users/${user.id}/password`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Réinitialiser le mot de passe de {user.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="password">{t('admin.auto.nouveau_mot_de_passe_d383', 'Nouveau mot de passe')}</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                        />
                        {form.errors.password && <p className="text-sm text-red-500">{form.errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password_confirmation">{t('admin.auto.confirmer_le_mot_de_passe_1edd', 'Confirmer le mot de passe')}</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                        />
                    </div>

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
