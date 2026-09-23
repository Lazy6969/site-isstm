import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const TITLE_RECOMMENDED_MAX = 60;
const DESCRIPTION_RECOMMENDED_MAX = 155;

/**
 * Edits both the meta title and meta description for one page in a single
 * dialog. They're two separate site_contents rows (see SeoHead), so this
 * fires two independent posts to the same /console/content/update endpoint
 * QuickEditController already exposes — no new backend route needed.
 */
export default function EditSeoDialog({ open, onClose, titleKey, descriptionKey, initialTitle, initialDescription }) {
    const titleForm = useForm({ key: titleKey, value: initialTitle });
    const descriptionForm = useForm({ key: descriptionKey, value: initialDescription });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            titleForm.setData({ key: titleKey, value: initialTitle });
            descriptionForm.setData({ key: descriptionKey, value: initialDescription });
            titleForm.clearErrors();
            descriptionForm.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        setSubmitting(true);
        titleForm.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                descriptionForm.post('/console/content/update', {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setSubmitting(false),
                    onSuccess: onClose,
                });
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Référencement (SEO) de cette page</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="seo-title">Titre (balise title)</Label>
                        <Input
                            id="seo-title"
                            value={titleForm.data.value}
                            onChange={(e) => titleForm.setData('value', e.target.value)}
                            autoFocus
                        />
                        <p className={`text-xs ${titleForm.data.value.length > TITLE_RECOMMENDED_MAX ? 'text-amber-600' : 'text-admin-muted'}`}>
                            {titleForm.data.value.length} / {TITLE_RECOMMENDED_MAX} caractères recommandés
                        </p>
                        {titleForm.errors.value && <p className="text-sm text-red-500">{titleForm.errors.value}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="seo-description">Meta description</Label>
                        <Textarea
                            id="seo-description"
                            value={descriptionForm.data.value}
                            onChange={(e) => descriptionForm.setData('value', e.target.value)}
                            rows={3}
                        />
                        <p
                            className={`text-xs ${
                                descriptionForm.data.value.length > DESCRIPTION_RECOMMENDED_MAX ? 'text-amber-600' : 'text-admin-muted'
                            }`}
                        >
                            {descriptionForm.data.value.length} / {DESCRIPTION_RECOMMENDED_MAX} caractères recommandés
                        </p>
                        {descriptionForm.errors.value && <p className="text-sm text-red-500">{descriptionForm.errors.value}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={submitting} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
