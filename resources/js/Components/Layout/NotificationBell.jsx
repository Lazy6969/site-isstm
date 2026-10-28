import { Link, router, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Skeleton from '../Loading/Skeleton';
import { markNotificationRead, notificationLink } from '../../lib/notifications';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { getIcon } from '../QuickEdit/icons';
import EditIconDialog from '../QuickEdit/EditIconDialog';

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
        case 'fichier_a_valider':
            return `${actor} a envoyé un fichier à valider`;
        default:
            return `${actor} a publié dans le fil communautaire`;
    }
}

export default function NotificationBell() {
    const { auth, content } = usePage().props;
    const { canEdit, active } = useQuickEdit();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [iconDialogOpen, setIconDialogOpen] = useState(false);
    const [panelPos, setPanelPos] = useState(null);
    const ref = useRef(null);
    const panelRef = useRef(null);
    const unreadCount = auth?.unreadNotificationsCount ?? 0;
    const iconValue = content?.header_icone_notifications;
    const Icon = getIcon(iconValue ?? 'Bell');
    const editable = canEdit && active;

    useEffect(() => {
        function onClickOutside(e) {
            // panelRef is checked too since the panel itself is portaled to
            // <body> (see render below), so it is no longer a DOM descendant
            // of `ref` even though it's still a React child.
            if (ref.current && !ref.current.contains(e.target) && !panelRef.current?.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // The panel is portaled straight to <body> (see render below) so it
    // always stacks above the floating account/scroll widgets — those are
    // fixed at the document root with their own z-index, and a dropdown
    // nested inside this sticky header would otherwise be capped by the
    // header's own (lower) stacking context no matter its own z-index.
    // Portaling means it is no longer positioned by CSS relative to the
    // bell button, so its coordinates are computed here instead.
    function updatePanelPosition() {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }

    useEffect(() => {
        if (!open) return undefined;
        updatePanelPosition();
        window.addEventListener('resize', updatePanelPosition);
        return () => window.removeEventListener('resize', updatePanelPosition);
    }, [open]);

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
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={toggle}
                className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
                aria-label="Notifications"
            >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {editable && (
                <>
                    <button
                        type="button"
                        onClick={() => setIconDialogOpen(true)}
                        className="absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                        aria-label="Changer cette icône"
                    >
                        <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                    <EditIconDialog
                        open={iconDialogOpen}
                        onClose={() => setIconDialogOpen(false)}
                        contentKey="header_icone_notifications"
                        currentValue={iconValue}
                    />
                </>
            )}

            {open && panelPos && createPortal(
                <div
                    ref={panelRef}
                    className="fixed z-[70] w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                    style={{ top: panelPos.top, right: panelPos.right }}
                >
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
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => openNotification(notification)}
                                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 ${
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
                                </button>
                            ))}
                    </div>

                    <Link
                        href="/notifications"
                        className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-medium text-isstm-navy hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700/50"
                    >
                        Voir toutes les notifications
                    </Link>
                </div>,
                document.body,
            )}
        </div>
    );
}
