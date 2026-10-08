import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Trash2, X } from 'lucide-react';
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
        case 'nouvelle_reactivation':
            return `Demande de réactivation de ${notification.candidate_name ?? 'un ancien étudiant'}`;
        default:
            return notification.actor?.name ? `${notification.actor.name} a une activité à signaler` : 'Nouvelle notification';
    }
}

export default function AdminNotificationBell() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [confirmingAll, setConfirmingAll] = useState(false);
    const unreadCount = auth?.unreadNotificationsCount ?? 0;

    function onOpenChange(next) {
        setOpen(next);
        setConfirmingAll(false);
        if (next) {
            setLoading(true);
            setFailed(false);
            fetch('/notifications/recentes', { headers: { Accept: 'application/json' } })
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then((json) => setNotifications(json.notifications))
                .catch(() => setFailed(true))
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

    function deleteNotification(notification) {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        router.delete(`/notifications/${notification.id}`, { preserveScroll: true, preserveState: true, only: ['auth'] });
    }

    function deleteAll() {
        setNotifications([]);
        setConfirmingAll(false);
        router.post('/notifications/tout-supprimer', {}, { preserveScroll: true, preserveState: true, only: ['auth'] });
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
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button type="button" onClick={markAllRead} className="text-xs font-medium text-admin-accent hover:underline">
                                Tout marquer comme lu
                            </button>
                        )}
                        {notifications.length > 0 && !confirmingAll && (
                            <button
                                type="button"
                                onClick={() => setConfirmingAll(true)}
                                aria-label="Supprimer toutes les notifications"
                                title="Supprimer toutes les notifications"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
                {confirmingAll && (
                    <div className="animate-in fade-in-0 flex items-center justify-between gap-2 border-t border-admin-border bg-red-500/5 px-3 py-2 duration-150">
                        <p className="text-xs font-medium text-admin-text">Supprimer toutes les notifications ?</p>
                        <div className="flex gap-1.5">
                            <button
                                type="button"
                                onClick={() => setConfirmingAll(false)}
                                className="rounded-md border border-admin-border px-2 py-1 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover"
                            >
                                Non
                            </button>
                            <button type="button" onClick={deleteAll} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-500">
                                Oui, tout supprimer
                            </button>
                        </div>
                    </div>
                )}
                <DropdownMenuSeparator className="bg-admin-border" />

                <div className="max-h-96 overflow-y-auto">
                    {loading && <p className="px-3 py-6 text-center text-sm text-admin-muted">Chargement…</p>}

                    {!loading && failed && (
                        <p className="px-3 py-6 text-center text-sm text-red-500">Impossible de charger les notifications. Réessayez dans un instant.</p>
                    )}

                    {!loading && !failed && notifications.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-admin-muted">Aucune notification pour le moment.</p>
                    )}

                    {!loading &&
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group flex items-start border-b border-admin-border transition last:border-b-0 hover:bg-admin-hover ${
                                    !notification.read ? 'bg-admin-accent/5' : ''
                                }`}
                            >
                                <button type="button" onClick={() => openNotification(notification)} className="block min-w-0 flex-1 px-3 py-2.5 text-left text-sm">
                                    <span className="flex items-start gap-2">
                                        <span className="flex-1 text-admin-text">{notificationText(notification)}</span>
                                        {!notification.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-admin-accent" />}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-admin-muted">{timeAgo(notification.created_at)}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteNotification(notification)}
                                    aria-label="Supprimer cette notification"
                                    title="Supprimer cette notification"
                                    className="mr-2 mt-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-admin-muted transition hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
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
