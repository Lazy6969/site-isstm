import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import ConversationRow from './ConversationRow';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Class-group chat threads only — the right sidebar's "Groupes" card, split
 * from 1-to-1 messages (see MessagesSidebar). Always shown, even with no
 * group conversation, so the section reads as "nothing here yet" rather
 * than silently disappearing.
 */
export default function GroupsSidebar({ conversations }) {
    const { t } = useTranslations();
    const groupConversations = conversations.filter((item) => item.kind === 'groupe');

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-isstm-navy dark:text-white">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {t('messages.section_groupes', 'Groupes')}
                </h2>
                <Link href="/groupes" className="text-xs font-medium text-slate-400 hover:text-isstm-navy dark:hover:text-white">
                    {t('communaute.voir_tout', 'Tout voir')}
                </Link>
            </div>

            {groupConversations.length === 0 ? (
                <p className="px-1 py-3 text-xs text-slate-400 dark:text-slate-500">{t('messages.aucun_groupe', 'Pas de groupe pour le moment.')}</p>
            ) : (
                <div className="space-y-0.5">
                    {groupConversations.map((item) => (
                        <ConversationRow key={`groupe-${item.id}`} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
