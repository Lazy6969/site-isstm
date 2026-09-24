import { Link } from '@inertiajs/react';
import { MessageCircle, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Compact list of recent conversations (1-to-1 and class groups) pinned to
 * the right of the fil communautaire, mirroring the left Archivés/Enregistrés
 * sidebar — a shortcut into /messages without leaving the feed. Reuses the
 * same unified list ConversationListBuilder produces for /messages itself.
 */
export default function ConversationsSidebar({ conversations }) {
    const { t } = useTranslations();

    return (
        <aside className="hidden xl:sticky xl:top-20 xl:block">
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

                {conversations.length === 0 && (
                    <p className="px-1 py-3 text-xs text-slate-400 dark:text-slate-500">{t('messages.aucune_conversation', 'Aucune conversation.')}</p>
                )}

                <div className="space-y-0.5">
                    {conversations.map((item) => (
                        <Link
                            key={item.kind === 'groupe' ? `groupe-${item.id}` : `dm-${item.id}`}
                            href={item.kind === 'groupe' ? `/messages/groupe/${item.id}` : `/messages/${item.id}`}
                            className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                            <span className="relative flex-shrink-0">
                                {item.kind === 'groupe' ? (
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-community-accent/15 text-community-accent">
                                        <Users className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                ) : (
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={item.user.avatar_path ? `/storage/${item.user.avatar_path}` : undefined} alt="" />
                                        <AvatarFallback>{item.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                )}
                                {item.kind !== 'groupe' && item.user.online && (
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{item.kind === 'groupe' ? item.name : item.user.name}</p>
                                {item.last_message && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{item.last_message}</p>}
                            </div>
                            {item.unread_count > 0 && (
                                <span className="flex h-4 min-w-4 flex-shrink-0 items-center justify-center rounded-full bg-isstm-gold px-1 text-[9px] font-bold text-white">
                                    {item.unread_count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
