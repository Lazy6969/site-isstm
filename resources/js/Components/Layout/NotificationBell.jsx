import { Link, router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Skeleton from '../Loading/Skeleton';

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "à l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);

    return `il y a ${days} j`;
}

function notificationText(notification) {
    const actor = notification.actor?.name ?? 'Quelqu\'un';

    switch (notification.type) {
        case 'reponse_commentaire':
            return `${actor} a répondu à votre commentaire`;
        case 'demande_ami':
            return `${actor} vous a envoyé une demande d'ami`;
        case 'ami_accepte':
            return `${actor} a accepté votre demande d'ami`;
        case 'nouveau_message':
            return `${actor} vous a envoyé un message`;
        default:
            return `${actor} a publié dans le fil communautaire`;
    }
}

function notificationLink(notification) {
    switch (notification.type) {
        case 'demande_ami':
        case 'ami_accepte':
            return '/amis';
        case 'nouveau_message':
            return notification.conversation_id ? `/messages/${notification.conversation_id}` : '/messages';
        case 'reponse_commentaire':
        case 'nouvelle_publication':
            return '/communaute';
        default:
            return '/notifications';
    }
}

export default function NotificationBell() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const unreadCount = auth?.unreadNotificationsCount ?? 0;

    useEffect(() => {
        function onClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    function toggle() {
        const next = !open;
        setOpen(next);
        if (next) {
            setLoading(true);
            fetch('/notifications/recentes', { headers: { Accept: 'application/json' } })
                .then((res) => res.json())
                .then((json) => setNotifications(json.notifications))
                .finally(() => setLoading(false));
        }
    }

    function markAllRead() {
        router.post('/notifications/tout-lire', {}, {
            preserveScroll: true,
            onSuccess: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
        });
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={toggle}
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
                aria-label="Notifications"
            >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                        <span className="text-sm font-semibold text-isstm-navy dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-medium text-isstm-gold hover:underline">
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading &&
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 dark:border-slate-700">
                                    <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-2.5 w-16" />
                                    </div>
                                </div>
                            ))}

                        {!loading && notifications.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-slate-400">Aucune notification pour le moment.</p>
                        )}

                        {!loading &&
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notificationLink(notification)}
                                    className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 ${
                                        !notification.read ? 'bg-isstm-navy/5 dark:bg-isstm-gold/10' : ''
                                    }`}
                                >
                                    <img
                                        src={notification.actor?.avatar_path ? `/storage/${notification.actor.avatar_path}` : '/images/logo-isstm.jpg'}
                                        alt=""
                                        className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                    />
                                    <span className="flex-1">
                                        <span className="block text-slate-700 dark:text-slate-200">{notificationText(notification)}</span>
                                        <span className="mt-0.5 block text-xs text-slate-400">{timeAgo(notification.created_at)}</span>
                                    </span>
                                    {!notification.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-isstm-gold" />}
                                </Link>
                            ))}
                    </div>

                    <Link
                        href="/notifications"
                        className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-medium text-isstm-navy hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700/50"
                    >
                        Voir toutes les notifications
                    </Link>
                </div>
            )}
        </div>
    );
}
