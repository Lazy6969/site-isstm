import { Link, router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { markNotificationRead, notificationLink } from '../../lib/notifications';

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
    switch (notification.type) {
        case 'nouvelle_preinscription':
            return `Nouvelle préinscription de ${notification.candidate_name ?? 'un candidat'}`;
        default:
            return notification.actor?.name ? `${notification.actor.name} a une activité à signaler` : 'Nouvelle notification';
    }
}

export default function AdminNotificationBell() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const unreadCount = auth?.unreadNotificationsCount ?? 0;

    function onOpenChange(next) {
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
        router.post(
            '/notifications/tout-lire',
            {},
            { preserveScroll: true, onSuccess: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))) },
        );
    }

    async function openNotification(notification) {
        const link = notificationLink(notification);
        if (!notification.read) {
            setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
            await markNotificationRead(notification.id);
        }
        setOpen(false);
        router.visit(link);
    }

    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger
                        className="relative flex h-9 w-9 items-center justify-center rounded-full text-admin-chrome-text-secondary transition-colors duration-200 hover:bg-admin-chrome-hover hover:text-admin-chrome-text focus:outline-none"
                        aria-label="Notifications"
                    >
                        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                        {unreadCount > 0 && (
                            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-80 bg-admin-card p-0 text-admin-text">
                <div className="flex items-center justify-between px-3 py-2.5">
                    <p className="text-sm font-semibold text-admin-text">Notifications</p>
                    {unreadCount > 0 && (
                        <button type="button" onClick={markAllRead} className="text-xs font-medium text-admin-accent hover:underline">
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="bg-admin-border" />

                <div className="max-h-96 overflow-y-auto">
                    {loading && <p className="px-3 py-6 text-center text-sm text-admin-muted">Chargement…</p>}

                    {!loading && notifications.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-admin-muted">Aucune notification pour le moment.</p>
                    )}

                    {!loading &&
                        notifications.map((notification) => (
                            <button
                                type="button"
                                key={notification.id}
                                onClick={() => openNotification(notification)}
                                className={`block w-full border-b border-admin-border px-3 py-2.5 text-left text-sm transition last:border-b-0 hover:bg-admin-hover ${
                                    !notification.read ? 'bg-admin-accent/5' : ''
                                }`}
                            >
                                <span className="flex items-start gap-2">
                                    <span className="flex-1 text-admin-text">{notificationText(notification)}</span>
                                    {!notification.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-admin-accent" />}
                                </span>
                                <span className="mt-0.5 block text-xs text-admin-muted">{timeAgo(notification.created_at)}</span>
                            </button>
                        ))}
                </div>

                <Link
                    href="/notifications"
                    className="block border-t border-admin-border px-3 py-2.5 text-center text-sm font-medium text-admin-accent hover:bg-admin-hover"
                >
                    Voir toutes les notifications
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
