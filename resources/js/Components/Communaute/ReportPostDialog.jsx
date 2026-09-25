import { useForm } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useTranslations } from '../../lib/useTranslations';

export default function ReportPostDialog({ open, onClose, postId }) {
    const { t } = useTranslations();
    const { data, setData, post, processing, reset } = useForm({ reason: '' });

    function submit(e) {
        e.preventDefault();
        post(`/communaute/${postId}/signaler`, {
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
                        <Flag className="h-4 w-4 text-red-500" aria-hidden="true" />
                        {t('communaute.signaler_titre', 'Signaler cette publication')}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('communaute.signaler_description', "Expliquez brièvement pourquoi cette publication pose problème (facultatif). L'équipe administrative sera informée.")}
                    </p>
                    <Textarea
                        value={data.reason}
                        onChange={(e) => setData('reason', e.target.value)}
                        rows={3}
                        maxLength={255}
                        placeholder={t('communaute.signaler_placeholder', 'Raison (facultatif)…')}
                    />
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
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {t('communaute.signaler', 'Signaler')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
