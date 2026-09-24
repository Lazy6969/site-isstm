import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useTranslations } from '../../lib/useTranslations';

export default function EditPostDialog({ open, onClose, post }) {
    const { t } = useTranslations();
    const { data, setData, patch, processing, errors, reset } = useForm({ body: post.body ?? '' });

    useEffect(() => {
        if (open) {
            setData({ body: post.body ?? '' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        patch(`/communaute/${post.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        {t('communaute.modifier_titre', 'Modifier la publication')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <Textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={4} maxLength={5000} />
                    {errors.body && <p className="text-sm text-red-600">{errors.body}</p>}
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                        >
                            {t('nav.annuler', 'Annuler')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >
                            {t('profil.enregistrer', 'Enregistrer')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
