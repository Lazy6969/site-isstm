import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, Inbox, Search, Send, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import UserCard from '../../Components/Amis/UserCard';
import UserCardSkeleton from '../../Components/Loading/UserCardSkeleton';
import { Card } from '../../Components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ query, searchResults, friends, received, sent, suggestions }) {
    const { t } = useTranslations();
    const params = useMemo(() => new URLSearchParams(window.location.search), []);
    const highlightId = params.get('highlight');
    const tabs = [
        { key: 'recherche', label: t('amis.onglet_recherche', 'Recherche'), icon: Search },
        { key: 'recues', label: t('amis.onglet_recues', 'Reçues'), icon: Inbox },
        { key: 'envoyees', label: t('amis.onglet_envoyees', 'Envoyées'), icon: Send },
        { key: 'amis', label: t('amis.onglet_amis', 'Amis'), icon: Users },
    ];
    const [tab, setTab] = useState(() => {
        const requested = params.get('tab');

        return tabs.some((item) => item.key === requested) ? requested : 'recherche';
    });
    const [friendFilter, setFriendFilter] = useState('');
    const { data, setData, get, processing } = useForm({ q: query ?? '' });
    const highlightRef = useRef(null);

    useEffect(() => {
        if (highlightId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [tab, highlightId]);

    function search(e) {
        e.preventDefault();
        get('/amis', { preserveState: true, preserveScroll: true });
    }

    function respond(id, action) {
        router.post(`/amis/demandes/${id}/${action}`, {}, { preserveScroll: true });
    }

    const counts = { recues: received.length, envoyees: sent.length, amis: friends.length };

    const filteredFriends = useMemo(
        () => friends.filter((u) => u.name.toLowerCase().includes(friendFilter.trim().toLowerCase())),
        [friends, friendFilter],
    );

    return (
        <AppLayout title={t('nav.amis', 'Amis')}>
            <Head title="Amis" />

            <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setTab(item.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition ${
                            tab === item.key
                                ? 'border-b-2 border-isstm-gold text-isstm-navy dark:text-white'
                                : 'text-slate-500 hover:text-isstm-navy dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                        {counts[item.key] > 0 && <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">({counts[item.key]})</span>}
                    </button>
                ))}
            </div>

            {tab === 'recherche' && (
                <div className="space-y-8">
                    <form onSubmit={search} className="flex gap-2">
                        <input
                            type="text"
                            value={data.q}
                            onChange={(e) => setData('q', e.target.value)}
                            placeholder={t('amis.placeholder_recherche', 'Rechercher un utilisateur par nom ou e-mail…')}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2.5 text-sm shadow-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
                        />
                        <button
                            disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-isstm-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-isstm-navy-dark disabled:opacity-50"
                        >
                            <Search className="h-4 w-4" aria-hidden="true" />
                            {t('nav.rechercher', 'Rechercher')}
                        </button>
                    </form>

                    {(processing || query) && (
                        <section>
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {t('amis.resultats_pour', 'Résultats pour')} « {query} »
                            </h2>
                            {processing ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[...Array(4)].map((_, i) => (
                                        <UserCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : searchResults.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500">{t('amis.aucun_utilisateur', 'Aucun utilisateur trouvé.')}</p>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {searchResults.map((u) => (
                                        <UserCard key={u.id} user={u} />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    <section>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {t('amis.suggestions', 'Suggestions pour vous')}
                        </h2>
                        {suggestions.length === 0 ? (
                            <p className="text-sm text-slate-400 dark:text-slate-500">{t('amis.aucune_suggestion', 'Pas de suggestion pour le moment.')}</p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {suggestions.map((u) => (
                                    <UserCard key={u.id} user={u} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {tab === 'recues' && (
                <div className="space-y-3">
                    {received.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('amis.aucune_demande_recue', 'Aucune demande reçue.')}</p>}
                    {received.map((request) => (
                        <div key={request.id} ref={String(request.id) === highlightId ? highlightRef : null}>
                        <Card
                            className={`flex items-center gap-3 p-4 ${
                                String(request.id) === highlightId ? 'bg-blue-500/10 ring-2 ring-blue-400' : ''
                            }`}
                        >
                            <span className="relative flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={request.user.avatar_path ? `/storage/${request.user.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{request.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                {request.user.online && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <Link href={`/profil/${request.user.id}`} className="block truncate font-semibold text-slate-800 dark:text-slate-100 hover:text-isstm-navy">
                                    {request.user.name}
                                </Link>
                                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{request.user.role_label}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => respond(request.id, 'accepter')}
                                    className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-isstm-navy-dark"
                                >
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                    {t('amis.accepter', 'Accepter')}
                                </button>
                                <button
                                    onClick={() => respond(request.id, 'refuser')}
                                    className="flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                >
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                    {t('amis.refuser', 'Refuser')}
                                </button>
                            </div>
                        </Card>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'envoyees' && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {sent.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('amis.aucune_demande_envoyee', 'Aucune demande envoyée.')}</p>}
                    {sent.map((request) => (
                        <UserCard key={request.id} user={{ ...request.user, status: 'envoyee', friend_request_id: request.id }} />
                    ))}
                </div>
            )}

            {tab === 'amis' && (
                <div>
                    {friends.length > 0 && (
                        <label className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2.5 dark:border-slate-600 dark:bg-slate-900">
                            <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                            <input
                                type="text"
                                value={friendFilter}
                                onChange={(e) => setFriendFilter(e.target.value)}
                                placeholder={t('amis.filtrer_mes_amis', 'Rechercher parmi vos amis…')}
                                className="w-full bg-transparent text-sm focus:outline-none dark:text-white"
                            />
                        </label>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {friends.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('amis.aucun_ami', "Vous n'avez pas encore d'amis.")}</p>}
                        {friends.length > 0 && filteredFriends.length === 0 && (
                            <p className="text-sm text-slate-400 dark:text-slate-500 sm:col-span-2">{t('amis.aucun_resultat_filtre', 'Aucun ami ne correspond.')}</p>
                        )}
                        {filteredFriends.map((u) => (
                            <div key={u.id} ref={String(u.id) === highlightId ? highlightRef : null}>
                                <UserCard user={u} highlighted={String(u.id) === highlightId} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
