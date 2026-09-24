import { Link, router } from '@inertiajs/react';
import { Clock, MessageCircle, UserMinus, UserPlus } from 'lucide-react';
import { Card } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function UserCard({ user, highlighted = false }) {
    const { t } = useTranslations();

    function sendRequest() {
        router.post(`/amis/${user.id}`, {}, { preserveScroll: true });
    }

    function cancel() {
        router.delete(`/amis/demandes/${user.friend_request_id}`, { preserveScroll: true });
    }

    return (
        <Card className={`flex items-center gap-3 p-4 ${highlighted ? 'bg-blue-500/10 ring-2 ring-blue-400' : ''}`}>
            <Link href={`/profil/${user.id}`} className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                {user.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />}
            </Link>
            <div className="min-w-0 flex-1">
                <Link href={`/profil/${user.id}`} className="block truncate font-semibold text-slate-800 hover:text-isstm-navy">
                    {user.name}
                </Link>
                <p className="truncate text-xs text-slate-400">
                    {user.role_label}
                    {user.filiere ? ` · ${user.filiere}` : ''}
                </p>
            </div>

            {user.status === 'aucune' && (
                <button
                    onClick={sendRequest}
                    className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-isstm-navy-dark"
                >
                    <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('amis.ajouter', 'Ajouter')}
                </button>
            )}
            {user.status === 'envoyee' && (
                <button
                    onClick={cancel}
                    className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
                >
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('amis.demande_envoyee', 'Demande envoyée')}
                </button>
            )}
            {user.status === 'recue' && (
                <Badge variant="gold">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {t('amis.en_attente', 'En attente')}
                </Badge>
            )}
            {user.status === 'amis' && (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/messages/nouveau/${user.id}`}
                        method="post"
                        as="button"
                        className="flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/5"
                    >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('amis.message', 'Message')}
                    </Link>
                    <button
                        onClick={cancel}
                        className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-50"
                    >
                        <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('amis.retirer', 'Retirer')}
                    </button>
                </div>
            )}
        </Card>
    );
}
