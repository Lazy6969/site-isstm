import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

/**
 * One row of either sidebar (MessagesSidebar, GroupsSidebar) — a 1-to-1 chat
 * or a class-group thread, shaped identically by ConversationListBuilder.
 */
export default function ConversationRow({ item }) {
    return (
        <Link
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
    );
}
