import { LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useLogoutConfirm } from '../../lib/useLogoutConfirm';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Global "confirm before logging out" prompt, mounted once in app.jsx
 * alongside <LogoutConfirmProvider>. Every logout trigger site-wide calls
 * requestLogout() instead of posting to /logout directly.
 */
export default function LogoutConfirmDialog() {
    const { open, cancel, confirm } = useLogoutConfirm();
    const { t } = useTranslations();

    return (
        <Dialog open={open} onOpenChange={(next) => !next && cancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        {t('nav.deconnexion_titre', 'Se déconnecter ?')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('nav.deconnexion_confirmation', 'Vous devrez vous reconnecter pour accéder de nouveau à votre compte.')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" onClick={cancel} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                        {t('nav.annuler', 'Annuler')}
                    </Button>
                    <Button type="button" onClick={confirm} className="bg-red-600 text-white hover:bg-red-700">
                        {t('nav.deconnexion', 'Déconnexion')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
