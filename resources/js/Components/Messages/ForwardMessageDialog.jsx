import { router } from '@inertiajs/react';
import { Forward, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function ForwardMessageDialog({ open, onClose, messageId, conversations, friends = [] }) {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open) {
            setSearch('');
        }
    }, [open]);

    // Lets you forward to any friend, not just someone you already have a
    // conversation with — mirrors the merged conversations+friends list
    // Messages/Index.jsx builds for its own sidebar (`items`/
    // `withoutConversation`). An entry without a `id` has no conversation
    // yet, so forwarding posts `user_id` instead and the backend finds or
    // creates the conversation (see MessageForwardController::store()).
    const items = useMemo(() => {
        const conversationUserIds = new Set(conversations.map((c) => c.user.id));
        const withoutConversation = friends
            .filter((f) => !conversationUserIds.has(f.id))
            .map((f) => ({ id: null, user: f }));

        return [...conversations.map((c) => ({ id: c.id, user: c.user })), ...withoutConversation].filter((item) =>
            item.user.name.toLowerCase().includes(search.trim().toLowerCase()),
        );
    }, [conversations, friends, search]);

    function forwardTo(item) {
        const payload = item.id ? { conversation_id: item.id } : { user_id: item.user.id };
        router.post(`/messages/message/${messageId}/transferer`, payload, { preserveScroll: true, onSuccess: onClose });
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
                <label className="mb-3 flex items-center gap-2 rounded-full border border-slate-300 px-3.5 py-1.5 dark:border-slate-600">
                    <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('messages.rechercher_ami', 'Rechercher un ami…')}
                        className="w-full bg-transparent text-sm focus:outline-none dark:text-white"
                        autoFocus
                    />
                </label>
                <div className="max-h-80 space-y-1 overflow-y-auto">
                    {items.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">
                            {search.trim()
                                ? t('messages.aucun_resultat', 'Aucun résultat.')
                                : t('messages.aucune_conversation', 'Aucune conversation.')}
                        </p>
                    )}
                    {items.map((item) => (
                        <button
                            key={item.id ?? `friend-${item.user.id}`}
                            type="button"
                            onClick={() => forwardTo(item)}
                            className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={item.user.avatar_path ? `/storage/${item.user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback>{item.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.user.name}</span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
