import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

/**
 * A single-field dialog for a SiteContentType::Url value — no style, no
 * locale breakdown (the value is shared across locales), just the raw value
 * itself. Despite the name, this also serves any other shared/untranslated
 * value with the same shape (e.g. a GPS "latitude,longitude" pair) — the
 * label/placeholder/help text below adapt it to each use.
 */
export default function EditLinkDialog({
    open,
    onClose,
    contentKey,
    initialValue,
    title = 'Modifier le lien',
    label = 'URL externe',
    placeholder = 'https://...',
    helpText = "Laissez vide pour désactiver le bouton tant qu'aucun lien n'est disponible.",
    inputType = 'url',
}) {
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="qel-value">{label}</Label>
                        <Input
                            id="qel-value"
                            type={inputType}
                            placeholder={placeholder}
                            value={form.data.value}
                            onChange={(e) => form.setData('value', e.target.value)}
                            autoFocus
                        />
                        {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                        {helpText && <p className="text-xs text-admin-text-secondary">{helpText}</p>}
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
