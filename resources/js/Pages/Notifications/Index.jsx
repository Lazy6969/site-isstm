import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, CheckSquare, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import Skeleton from '../../Components/Loading/Skeleton';
import { Card } from '../../Components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';
import { markNotificationRead, notificationLink } from '../../lib/notifications';

const periodOrder = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];
const LONG_PRESS_MS = 500;

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ groups, pagination }) {
    const { t } = useTranslations();
    const [pageLoading, setPageLoading] = useState(false);
    const [selected, setSelected] = useState(() => new Set());
    const [selectMode, setSelectMode] = useState(false);
    const longPressTimer = useRef(null);
    const longPressFired = useRef(false);

    const allIds = useMemo(
        () => periodOrder.flatMap((period) => (groups[period] ?? []).map((n) => n.id)),
        [groups],
    );
    const allSelected = allIds.length > 0 && selected.size === allIds.length;

    function notificationText(notification) {
        const actor = notification.actor?.name ?? t('notifications.quelquun', "Quelqu'un");

        switch (notification.type) {
            case 'reponse_commentaire':
                return `${actor} ${t('notifications.a_repondu', 'a répondu à votre commentaire')}`;
            case 'demande_ami':
                return `${actor} ${t('notifications.demande_ami', "vous a envoyé une demande d'ami")}`;
            case 'ami_accepte':
                return `${actor} ${t('notifications.ami_accepte', 'a accepté votre demande d\'ami')}`;
            case 'nouveau_message':
                return `${actor} ${t('notifications.nouveau_message', 'vous a envoyé un message')}`;
            default:
                return `${actor} ${t('notifications.a_publie', 'a publié :')} « ${notification.post_excerpt ?? ''} »`;
        }
    }

    function markRead(id) {
        router.post(`/notifications/${id}/lu`, {}, { preserveScroll: true });
    }

    async function openNotification(notification) {
        if (longPressFired.current) {
            longPressFired.current = false;
            return;
        }

        if (selectMode) {
            toggleSelected(notification.id);
            return;
        }

        const link = notificationLink(notification);
        if (!notification.read) {
            await markNotificationRead(notification.id);
        }
        router.visit(link);
    }

    function startLongPress(id) {
        longPressFired.current = false;
        longPressTimer.current = setTimeout(() => {
            longPressFired.current = true;
            setSelectMode(true);
            setSelected((prev) => new Set(prev).add(id));
            navigator.vibrate?.(15);
        }, LONG_PRESS_MS);
    }

    function cancelLongPress() {
        clearTimeout(longPressTimer.current);
    }

    function toggleSelectMode() {
        setSelectMode((v) => !v);
        setSelected(new Set());
    }

    function markAllRead() {
        router.post('/notifications/tout-lire', {}, { preserveScroll: true });
    }

    function destroy(id) {
        router.delete(`/notifications/${id}`, { preserveScroll: true });
    }

    function toggleSelected(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }

    function toggleSelectAll() {
        setSelected((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
    }

    function destroySelected() {
        if (selected.size === 0) return;

        router.post(
            '/notifications/supprimer',
            { ids: Array.from(selected) },
            { preserveScroll: true, onSuccess: () => setSelected(new Set()) },
        );
    }

    function destroyAllNotifications() {
        if (!confirm(t('notifications.confirmer_tout_supprimer', 'Supprimer toutes les notifications ?'))) return;

        router.post('/notifications/tout-supprimer', {}, { preserveScroll: true, onSuccess: () => setSelected(new Set()) });
    }

    function goToPage(page) {
        router.get(
            '/notifications',
            { page },
            { preserveScroll: true, onStart: () => setPageLoading(true), onFinish: () => setPageLoading(false) },
        );
    }

    const hasAny = periodOrder.some((period) => groups[period]?.length > 0);

    return (
        <AppLayout title={t('nav.notifications', 'Notifications')}>
            <Head title="Notifications" />

            <div className="mx-auto max-w-2xl">

            <Link href="/communaute" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('communaute.retour_fil', 'Retour au fil')}
            </Link>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {selectMode ? (
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            disabled={allIds.length === 0}
                            className="rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                        />
                        {allSelected
                            ? t('notifications.tout_deselectionner', 'Tout désélectionner')
                            : t('notifications.tout_selectionner', 'Tout sélectionner')}
                        {selected.size > 0 && ` (${selected.size})`}
                    </label>
                ) : (
                    <span />
                )}

                <div className="flex flex-wrap items-center gap-4">
                    {selectMode && selected.size > 0 && (
                        <button onClick={destroySelected} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {t('notifications.supprimer_selection', 'Supprimer la sélection')}
                        </button>
                    )}
                    {!selectMode && (
                        <button onClick={destroyAllNotifications} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {t('notifications.tout_supprimer', 'Tout supprimer')}
                        </button>
                    )}
                    {!selectMode && (
                        <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm font-medium text-isstm-gold hover:underline">
                            <CheckCheck className="h-4 w-4" aria-hidden="true" />
                            {t('notifications.tout_marquer_lu', 'Tout marquer comme lu')}
                        </button>
                    )}
                    <button onClick={toggleSelectMode} className="flex items-center gap-1.5 text-sm font-medium text-isstm-navy dark:text-white hover:underline">
                        <CheckSquare className="h-4 w-4" aria-hidden="true" />
                        {selectMode ? t('notifications.terminer', 'Terminé') : t('notifications.selectionner_cta', 'Sélectionner')}
                    </button>
                </div>
            </div>

            {pageLoading && (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                            <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3.5 w-2/3" />
                                <Skeleton className="h-2.5 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!pageLoading && !hasAny && (
                <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    {t('notifications.aucune_notification', 'Aucune notification pour le moment.')}
                </p>
            )}

            {!pageLoading && (
            <div className="space-y-8">
                {periodOrder.map(
                    (period) =>
                        groups[period]?.length > 0 && (
                            <section key={period}>
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{period}</h2>
                                <div className="space-y-2">
                                    {groups[period].map((notification) => (
                                        <Card
                                            key={notification.id}
                                            className={`flex items-start gap-3 p-4 ${!notification.read ? 'ring-1 ring-isstm-gold/30' : ''}`}
                                        >
                                            {selectMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(notification.id)}
                                                    onChange={() => toggleSelected(notification.id)}
                                                    aria-label={t('notifications.selectionner', 'Sélectionner')}
                                                    className="mt-1.5 flex-shrink-0 rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                                                />
                                            )}
                                            <Avatar className="mt-0.5 h-9 w-9 flex-shrink-0">
                                                <AvatarImage src={notification.actor?.avatar_path ? `/storage/${notification.actor.avatar_path}` : undefined} alt="" />
                                                <AvatarFallback>{notification.actor?.name?.[0] ?? '?'}</AvatarFallback>
                                            </Avatar>
                                            <button
                                                type="button"
                                                onClick={() => openNotification(notification)}
                                                onTouchStart={() => startLongPress(notification.id)}
                                                onTouchEnd={cancelLongPress}
                                                onTouchMove={cancelLongPress}
                                                onContextMenu={(e) => e.preventDefault()}
                                                className="min-w-0 flex-1 text-left"
                                            >
                                                <p className="text-sm text-slate-700 dark:text-slate-200">{notificationText(notification)}</p>
                                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatTime(notification.created_at)}</p>
                                            </button>
                                            {!selectMode && (
                                                <div className="flex flex-shrink-0 gap-3 text-xs">
                                                    {!notification.read && (
                                                        <button onClick={() => markRead(notification.id)} className="font-medium text-isstm-navy dark:text-white hover:underline">
                                                            {t('notifications.marquer_lu', 'Marquer lu')}
                                                        </button>
                                                    )}
                                                    <button onClick={() => destroy(notification.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-600" aria-label={t('communaute.supprimer', 'Supprimer')}>
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ),
                )}
            </div>
            )}

            {pagination.last_page > 1 && (
                <div className="mt-8 flex justify-center gap-3">
                    <button
                        disabled={pagination.current_page <= 1}
                        onClick={() => goToPage(pagination.current_page - 1)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                        {t('pagination.precedent', 'Précédent')}
                    </button>
                    <button
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => goToPage(pagination.current_page + 1)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                        {t('pagination.suivant', 'Suivant')}
                    </button>
                </div>
            )}
            </div>
        </AppLayout>
    );
}
