import { router } from '@inertiajs/react';
import { Forward } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function ForwardMessageDialog({ open, onClose, messageId, conversations }) {
    const { t } = useTranslations();

    function forwardTo(conversationId) {
        router.post(
            `/messages/message/${messageId}/transferer`,
            { conversation_id: conversationId },
            { preserveScroll: true, onSuccess: onClose },
        );
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Forward className="h-4 w-4" aria-hidden="true" />
                        {t('messages.transferer_titre', 'Transférer le message')}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-80 space-y-1 overflow-y-auto">
                    {conversations.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">{t('messages.aucune_conversation', 'Aucune conversation.')}</p>
                    )}
                    {conversations
                        .filter((c) => c.id)
                        .map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => forwardTo(c.id)}
                                className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={c.user.avatar_path ? `/storage/${c.user.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{c.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.user.name}</span>
                            </button>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
