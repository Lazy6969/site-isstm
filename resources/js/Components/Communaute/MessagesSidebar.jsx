import { Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import ConversationRow from './ConversationRow';
import { useTranslations } from '../../lib/useTranslations';

/**
 * 1-to-1 conversations only — the right sidebar's "Messages" card, split
 * from class-group threads (see GroupsSidebar) so each has its own clearly
 * labelled section instead of one mixed list.
 */
export default function MessagesSidebar({ conversations }) {
    const { t } = useTranslations();
    const dmConversations = conversations.filter((item) => item.kind !== 'groupe');

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-isstm-navy dark:text-white">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {t('messages.titre_court', 'Messages')}
                </h2>
                <Link href="/messages" className="text-xs font-medium text-slate-400 hover:text-isstm-navy dark:hover:text-white">
                    {t('communaute.voir_tout', 'Tout voir')}
                </Link>
            </div>

            {dmConversations.length === 0 ? (
                <p className="px-1 py-3 text-xs text-slate-400 dark:text-slate-500">{t('messages.aucune_conversation', 'Aucune conversation.')}</p>
            ) : (
                <div className="space-y-0.5">
                    {dmConversations.map((item) => (
                        <ConversationRow key={`dm-${item.id}`} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
