import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import MessageThreadSkeleton from '../../Components/Loading/MessageThreadSkeleton';

function formatTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ conversations, friends, activeConversation, messages, media }) {
    const [filter, setFilter] = useState('');
    const [showMedia, setShowMedia] = useState(false);
    const [opening, setOpening] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ body: '', attachments: [] });

    const items = useMemo(() => {
        const conversationUserIds = new Set(conversations.map((c) => c.user.id));
        const withoutConversation = friends
            .filter((f) => !conversationUserIds.has(f.id))
            .map((f) => ({ id: null, user: f, last_message: null, last_message_at: null, unread_count: 0 }));

        return [...conversations, ...withoutConversation].filter((item) => item.user.name.toLowerCase().includes(filter.toLowerCase()));
    }, [conversations, friends, filter]);

    function openConversation(item) {
        const options = { preserveScroll: true, onStart: () => setOpening(true), onFinish: () => setOpening(false) };

        if (item.id) {
            router.get(`/messages/${item.id}`, {}, options);
        } else {
            router.post(`/messages/nouveau/${item.user.id}`, {}, options);
        }
    }

    function sendMessage(e) {
        e.preventDefault();
        post(`/messages/${activeConversation.id}/envoyer`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function hideMessage(id) {
        router.delete(`/messages/message/${id}`, { preserveScroll: true });
    }

    return (
        <AppLayout title="Messages">
            <Head title="Messages" />

            <div className="flex h-[70vh] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <aside className="w-72 flex-shrink-0 border-r border-slate-100">
                    <div className="border-b border-slate-100 p-3">
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Rechercher…"
                            className="w-full rounded-full border border-slate-300 px-3.5 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                    </div>
                    <div className="h-[calc(70vh-57px)] overflow-y-auto">
                        {items.length === 0 && <p className="p-4 text-center text-sm text-slate-400">Aucune conversation.</p>}
                        {items.map((item) => (
                            <button
                                key={item.user.id}
                                onClick={() => openConversation(item)}
                                className={`flex w-full items-center gap-2.5 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 ${
                                    activeConversation?.user.id === item.user.id ? 'bg-isstm-navy/5' : ''
                                }`}
                            >
                                <img
                                    src={item.user.avatar_path ? `/storage/${item.user.avatar_path}` : '/images/logo-isstm.jpg'}
                                    alt=""
                                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800">{item.user.name}</p>
                                    <p className="truncate text-xs text-slate-400">{item.last_message ?? 'Démarrer la conversation'}</p>
                                </div>
                                {item.unread_count > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-isstm-gold px-1 text-[10px] font-bold text-white">
                                        {item.unread_count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="flex flex-1 flex-col">
                    {!activeConversation && (
                        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Sélectionnez une conversation à gauche.</div>
                    )}

                    {activeConversation && (
                        <>
                            <div className="flex items-center justify-between border-b border-slate-100 p-3">
                                <Link href={`/profil/${activeConversation.user.id}`} className="flex items-center gap-2.5">
                                    <img
                                        src={activeConversation.user.avatar_path ? `/storage/${activeConversation.user.avatar_path}` : '/images/logo-isstm.jpg'}
                                        alt=""
                                        className="h-9 w-9 rounded-full object-cover"
                                    />
                                    <span className="font-semibold text-slate-800">{activeConversation.user.name}</span>
                                </Link>
                                <button onClick={() => setShowMedia((v) => !v)} className="text-xs font-medium text-isstm-navy hover:underline">
                                    {showMedia ? 'Masquer les médias' : 'Médias échangés'}
                                </button>
                            </div>

                            {showMedia && (
                                <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50 p-3">
                                    {media.length === 0 && <p className="text-xs text-slate-400">Aucun média échangé.</p>}
                                    {media.map((m) => (
                                        <a key={m.id} href={`/storage/${m.path}`} target="_blank" rel="noopener">
                                            <img src={`/storage/${m.path}`} alt="" className="h-16 w-16 rounded-lg object-cover" />
                                        </a>
                                    ))}
                                </div>
                            )}

                            {opening && <MessageThreadSkeleton />}

                            {!opening && (
                                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                    {messages.map((m) => (
                                        <div key={m.id} className={`group flex ${m.sender_id === activeConversation.user.id ? 'justify-start' : 'justify-end'}`}>
                                            <div className="max-w-xs">
                                                {m.body && (
                                                    <p
                                                        className={`rounded-2xl px-3.5 py-2 text-sm ${
                                                            m.sender_id === activeConversation.user.id ? 'bg-slate-100 text-slate-700' : 'bg-isstm-navy text-white'
                                                        }`}
                                                    >
                                                        {m.body}
                                                    </p>
                                                )}
                                                {m.attachments.map((a) => (
                                                    <a key={a.id} href={`/storage/${a.path}`} target="_blank" rel="noopener" className="mt-1 block">
                                                        {a.file_type === 'image' ? (
                                                            <img src={`/storage/${a.path}`} alt="" className="max-h-48 rounded-lg" />
                                                        ) : (
                                                            <span className="text-xs font-medium text-isstm-navy underline">{a.original_name}</span>
                                                        )}
                                                    </a>
                                                ))}
                                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                                                    <span>{formatTime(m.created_at)}</span>
                                                    <button onClick={() => hideMessage(m.id)} className="opacity-0 hover:underline group-hover:opacity-100">
                                                        Masquer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 p-3">
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setData('attachments', Array.from(e.target.files))}
                                    className="w-32 text-xs text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    placeholder="Écrire un message…"
                                    className="flex-1 rounded-full border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                                <button disabled={processing} className="rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    Envoyer
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
