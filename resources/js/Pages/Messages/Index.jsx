import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Images, Paperclip, Search, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import MessageThreadSkeleton from '../../Components/Loading/MessageThreadSkeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

function formatTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ conversations, friends, activeConversation, messages, media }) {
    const { t } = useTranslations();
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
        <AppLayout title={t('nav.messages', 'Messages')}>
            <Head title="Messages" />

            <div className="flex h-[70vh] overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                <aside
                    className={`w-full flex-shrink-0 border-r border-slate-100 dark:border-slate-700 sm:block sm:w-72 ${
                        activeConversation ? 'hidden' : 'block'
                    }`}
                >
                    <div className="border-b border-slate-100 dark:border-slate-700 p-3">
                        <label className="flex items-center gap-2 rounded-full border border-slate-300 px-3.5 py-1.5">
                            <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder={t('messages.rechercher', 'Rechercher…')}
                                className="w-full text-sm focus:outline-none"
                            />
                        </label>
                    </div>
                    <div className="h-[calc(70vh-57px)] overflow-y-auto">
                        {items.length === 0 && <p className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">{t('messages.aucune_conversation', 'Aucune conversation.')}</p>}
                        {items.map((item) => (
                            <button
                                key={item.user.id}
                                onClick={() => openConversation(item)}
                                className={`flex w-full items-center gap-2.5 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 ${
                                    activeConversation?.user.id === item.user.id ? 'bg-isstm-navy/5' : ''
                                }`}
                            >
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={item.user.avatar_path ? `/storage/${item.user.avatar_path}` : undefined} alt="" />
                                    <AvatarFallback>{item.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800">{item.user.name}</p>
                                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">{item.last_message ?? t('messages.demarrer_conversation', 'Démarrer la conversation')}</p>
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

                <section className={`flex-1 flex-col sm:flex ${activeConversation ? 'flex' : 'hidden'}`}>
                    {!activeConversation && (
                        <div className="hidden flex-1 items-center justify-center text-sm text-slate-400 dark:text-slate-500 sm:flex">
                            {t('messages.selectionner_conversation', 'Sélectionnez une conversation à gauche.')}
                        </div>
                    )}

                    {activeConversation && (
                        <>
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 p-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Link href="/messages" className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 sm:hidden">
                                        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                                    </Link>
                                    <Link href={`/profil/${activeConversation.user.id}`} className="flex min-w-0 items-center gap-2.5">
                                        <Avatar className="h-9 w-9 flex-shrink-0">
                                            <AvatarImage src={activeConversation.user.avatar_path ? `/storage/${activeConversation.user.avatar_path}` : undefined} alt="" />
                                            <AvatarFallback>{activeConversation.user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate font-semibold text-slate-800">{activeConversation.user.name}</span>
                                    </Link>
                                </div>
                                <button onClick={() => setShowMedia((v) => !v)} className="flex flex-shrink-0 items-center gap-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:underline">
                                    <Images className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline">
                                        {showMedia ? t('messages.masquer_medias', 'Masquer les médias') : t('messages.medias_echanges', 'Médias échangés')}
                                    </span>
                                </button>
                            </div>

                            {showMedia && (
                                <div className="flex gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
                                    {media.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500">{t('messages.aucun_media', 'Aucun média échangé.')}</p>}
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
                                                            <span className="flex items-center gap-1 text-xs font-medium text-isstm-navy dark:text-white underline">
                                                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                                                {a.original_name}
                                                            </span>
                                                        )}
                                                    </a>
                                                ))}
                                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                                                    <span>{formatTime(m.created_at)}</span>
                                                    <button onClick={() => hideMessage(m.id)} className="opacity-0 hover:underline group-hover:opacity-100">
                                                        {t('messages.masquer', 'Masquer')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 p-3">
                                <label className="flex-shrink-0 text-slate-400 dark:text-slate-500" title={t('groupes.piece_jointe', 'Pièce jointe')}>
                                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                                    <input type="file" multiple onChange={(e) => setData('attachments', Array.from(e.target.files))} className="hidden" />
                                </label>
                                <input
                                    type="text"
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    placeholder={t('groupes.ecrire_message', 'Écrire un message…')}
                                    className="flex-1 rounded-full border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                                />
                                <button disabled={processing} className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                    {t('communaute.envoyer', 'Envoyer')}
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
