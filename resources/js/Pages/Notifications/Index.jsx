import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import Skeleton from '../../Components/Loading/Skeleton';

const periodOrder = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function notificationText(notification) {
    const actor = notification.actor?.name ?? "Quelqu'un";

    return notification.type === 'reponse_commentaire'
        ? `${actor} a répondu à votre commentaire`
        : `${actor} a publié : « ${notification.post_excerpt ?? ''} »`;
}

export default function Index({ groups, pagination }) {
    const [pageLoading, setPageLoading] = useState(false);

    function markRead(id) {
        router.post(`/notifications/${id}/lu`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post('/notifications/tout-lire', {}, { preserveScroll: true });
    }

    function destroy(id) {
        router.delete(`/notifications/${id}`, { preserveScroll: true });
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
        <AppLayout title="Notifications">
            <Head title="Notifications" />

            <div className="mb-6 flex justify-end">
                <button onClick={markAllRead} className="text-sm font-medium text-isstm-gold hover:underline">
                    Tout marquer comme lu
                </button>
            </div>

            {pageLoading && (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
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
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                    Aucune notification pour le moment.
                </p>
            )}

            {!pageLoading && (
            <div className="space-y-8">
                {periodOrder.map(
                    (period) =>
                        groups[period]?.length > 0 && (
                            <section key={period}>
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{period}</h2>
                                <div className="space-y-2">
                                    {groups[period].map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm ${
                                                !notification.read ? 'ring-1 ring-isstm-gold/30' : ''
                                            }`}
                                        >
                                            <img
                                                src={notification.actor?.avatar_path ? `/storage/${notification.actor.avatar_path}` : '/images/logo-isstm.jpg'}
                                                alt=""
                                                className="mt-0.5 h-9 w-9 flex-shrink-0 rounded-full object-cover"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-slate-700">{notificationText(notification)}</p>
                                                <p className="mt-0.5 text-xs text-slate-400">{formatTime(notification.created_at)}</p>
                                            </div>
                                            <div className="flex flex-shrink-0 gap-3 text-xs">
                                                {!notification.read && (
                                                    <button onClick={() => markRead(notification.id)} className="font-medium text-isstm-navy hover:underline">
                                                        Marquer lu
                                                    </button>
                                                )}
                                                <button onClick={() => destroy(notification.id)} className="font-medium text-slate-400 hover:text-red-600">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
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
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
                    >
                        Précédent
                    </button>
                    <button
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => goToPage(pagination.current_page + 1)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </AppLayout>
    );
}
