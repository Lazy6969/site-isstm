import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import UserCard from '../../Components/Amis/UserCard';

const tabs = [
    { key: 'recherche', label: 'Recherche' },
    { key: 'recues', label: 'Reçues' },
    { key: 'envoyees', label: 'Envoyées' },
    { key: 'amis', label: 'Amis' },
];

export default function Index({ query, searchResults, friends, received, sent, suggestions }) {
    const [tab, setTab] = useState('recherche');
    const { data, setData, get, processing } = useForm({ q: query ?? '' });

    function search(e) {
        e.preventDefault();
        get('/amis', { preserveState: true, preserveScroll: true });
    }

    function respond(id, action) {
        router.post(`/amis/demandes/${id}/${action}`, {}, { preserveScroll: true });
    }

    const counts = { recues: received.length, envoyees: sent.length, amis: friends.length };

    return (
        <AppLayout title="Amis">
            <Head title="Amis" />

            <div className="mb-6 flex gap-1 border-b border-slate-200">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium transition ${
                            tab === t.key ? 'border-b-2 border-isstm-gold text-isstm-navy' : 'text-slate-500 hover:text-isstm-navy'
                        }`}
                    >
                        {t.label}
                        {counts[t.key] > 0 && <span className="ml-1.5 text-xs text-slate-400">({counts[t.key]})</span>}
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
                            placeholder="Rechercher un utilisateur par nom ou e-mail…"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
                        />
                        <button
                            disabled={processing}
                            className="rounded-lg bg-isstm-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-isstm-navy-dark disabled:opacity-50"
                        >
                            Rechercher
                        </button>
                    </form>

                    {query && (
                        <section>
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Résultats pour « {query} »</h2>
                            {searchResults.length === 0 ? (
                                <p className="text-sm text-slate-400">Aucun utilisateur trouvé.</p>
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
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Suggestions pour vous</h2>
                        {suggestions.length === 0 ? (
                            <p className="text-sm text-slate-400">Pas de suggestion pour le moment.</p>
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
                    {received.length === 0 && <p className="text-sm text-slate-400">Aucune demande reçue.</p>}
                    {received.map((request) => (
                        <div key={request.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <img
                                src={request.user.avatar_path ? `/storage/${request.user.avatar_path}` : '/images/logo-isstm.jpg'}
                                alt=""
                                className="h-12 w-12 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <Link href={`/profil/${request.user.id}`} className="block truncate font-semibold text-slate-800 hover:text-isstm-navy">
                                    {request.user.name}
                                </Link>
                                <p className="truncate text-xs text-slate-400">{request.user.role_label}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => respond(request.id, 'accepter')}
                                    className="rounded-full bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-isstm-navy-dark"
                                >
                                    Accepter
                                </button>
                                <button
                                    onClick={() => respond(request.id, 'refuser')}
                                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
                                >
                                    Refuser
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'envoyees' && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {sent.length === 0 && <p className="text-sm text-slate-400">Aucune demande envoyée.</p>}
                    {sent.map((request) => (
                        <UserCard key={request.id} user={{ ...request.user, status: 'envoyee', friend_request_id: request.id }} />
                    ))}
                </div>
            )}

            {tab === 'amis' && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {friends.length === 0 && <p className="text-sm text-slate-400">Vous n'avez pas encore d'amis.</p>}
                    {friends.map((u) => (
                        <UserCard key={u.id} user={u} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
