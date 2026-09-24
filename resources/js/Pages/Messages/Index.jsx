import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Images, Link2, Paperclip, Search, Send, Settings2, Users, Video as VideoIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import MessageBubble from '../../Components/Messages/MessageBubble';
import GroupMessageBubble from '../../Components/Messages/GroupMessageBubble';
import EmojiPickerButton from '../../Components/Messages/EmojiPickerButton';
import VoiceRecorder from '../../Components/Messages/VoiceRecorder';
import MessageThreadSkeleton from '../../Components/Loading/MessageThreadSkeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';
import { extractLinks } from '../../lib/linkify';

const TYPING_PING_THROTTLE_MS = 2000;
const STATUS_POLL_MS = 4000;

function itemName(item) {
    return item.kind === 'groupe' ? item.name : item.user.name;
}

function itemAvatarPath(item) {
    return item.kind === 'groupe' ? null : item.user.avatar_path;
}

function itemOnline(item) {
    return item.kind === 'groupe' ? false : item.user.online;
}

function isActiveItem(item, activeConversation) {
    if (!activeConversation) return false;
    if (item.kind === 'groupe') return activeConversation.kind === 'groupe' && activeConversation.id === item.id;

    return activeConversation.kind !== 'groupe' && activeConversation.user?.id === item.user.id;
}

export default function Index({ conversations, friends, activeConversation, messages, groupMessages, media }) {
    const { t } = useTranslations();
    const { auth } = usePage().props;
    const [filter, setFilter] = useState('');
    const [showMedia, setShowMedia] = useState(false);
    const [mediaTab, setMediaTab] = useState('images');
    const [showSearch, setShowSearch] = useState(false);
    const [messageSearch, setMessageSearch] = useState('');
    const [opening, setOpening] = useState(false);
    const [liveStatus, setLiveStatus] = useState({ online: false, typing: false });
    const [replyingTo, setReplyingTo] = useState(null);
    const { data, setData, post, processing, reset } = useForm({ body: '', attachments: [], reply_to_id: null });
    const lastTypingPingAt = useRef(0);
    const isGroup = activeConversation?.kind === 'groupe';

    useEffect(() => {
        if (!activeConversation || isGroup) return undefined;

        setLiveStatus({ online: activeConversation.user.online, typing: false });
        setReplyingTo(null);

        function poll() {
            fetch(`/messages/${activeConversation.id}/statut`, { headers: { Accept: 'application/json' } })
                .then((res) => res.json())
                .then(setLiveStatus)
                .catch(() => {});
        }

        const interval = setInterval(poll, STATUS_POLL_MS);

        return () => clearInterval(interval);
    }, [activeConversation?.id, isGroup]);

    function xsrfToken() {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    function pingTyping() {
        if (!activeConversation || isGroup) return;
        const now = Date.now();
        if (now - lastTypingPingAt.current < TYPING_PING_THROTTLE_MS) return;
        lastTypingPingAt.current = now;
        fetch(`/messages/${activeConversation.id}/frappe`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
        }).catch(() => {});
    }

    const items = useMemo(() => {
        const conversationUserIds = new Set(conversations.filter((c) => c.kind !== 'groupe').map((c) => c.user.id));
        const withoutConversation = friends
            .filter((f) => !conversationUserIds.has(f.id))
            .map((f) => ({ id: null, kind: 'dm', user: f, last_message: null, last_message_at: null, unread_count: 0 }));

        return [...conversations, ...withoutConversation].filter((item) => itemName(item).toLowerCase().includes(filter.toLowerCase()));
    }, [conversations, friends, filter]);

    const lastOwnMessageId = useMemo(() => {
        if (!activeConversation || isGroup) return null;
        const ownMessages = messages.filter((m) => m.sender_id !== activeConversation.user.id);

        return ownMessages.length > 0 ? ownMessages[ownMessages.length - 1].id : null;
    }, [messages, activeConversation, isGroup]);

    const mediaByTab = useMemo(() => {
        const links = (isGroup ? [] : messages)
            .filter((m) => !m.deleted_at && m.body)
            .flatMap((m) => extractLinks(m.body).map((url) => ({ id: `${m.id}-${url}`, url, created_at: m.created_at })));

        return {
            images: (media ?? []).filter((m) => m.file_type === 'image'),
            videos: (media ?? []).filter((m) => m.file_type === 'video'),
            documents: (media ?? []).filter((m) => m.file_type !== 'image' && m.file_type !== 'video'),
            liens: links,
        };
    }, [media, messages, isGroup]);

    const visibleMessages = useMemo(() => {
        const list = isGroup ? groupMessages : messages;
        if (!messageSearch.trim()) return list;
        const needle = messageSearch.trim().toLowerCase();

        return list.filter((m) => m.body?.toLowerCase().includes(needle));
    }, [isGroup, groupMessages, messages, messageSearch]);

    function openConversation(item) {
        const options = { preserveScroll: true, onStart: () => setOpening(true), onFinish: () => setOpening(false) };

        if (item.kind === 'groupe') {
            router.get(`/messages/groupe/${item.id}`, {}, options);
        } else if (item.id) {
            router.get(`/messages/${item.id}`, {}, options);
        } else {
            router.post(`/messages/nouveau/${item.user.id}`, {}, options);
        }
    }

    function sendMessage(e) {
        e.preventDefault();

        const url = isGroup ? `/groupes/${activeConversation.id}/messages` : `/messages/${activeConversation.id}/envoyer`;

        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setReplyingTo(null);
            },
        });
    }

    function startReply(message) {
        setReplyingTo(message);
        setData('reply_to_id', message.id);
    }

    function cancelReply() {
        setReplyingTo(null);
        setData('reply_to_id', null);
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
                                key={item.kind === 'groupe' ? `groupe-${item.id}` : `dm-${item.user.id}`}
                                onClick={() => openConversation(item)}
                                className={`flex w-full items-center gap-2.5 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 ${
                                    isActiveItem(item, activeConversation) ? 'bg-isstm-navy/5' : ''
                                }`}
                            >
                                <span className="relative flex-shrink-0">
                                    {item.kind === 'groupe' ? (
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-community-accent/15 text-community-accent">
                                            <Users className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    ) : (
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={itemAvatarPath(item) ? `/storage/${itemAvatarPath(item)}` : undefined} alt="" />
                                            <AvatarFallback>{itemName(item)?.[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    {itemOnline(item) && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                                    )}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{itemName(item)}</p>
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
                                    {isGroup ? (
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-community-accent/15 text-community-accent">
                                                <Users className="h-4.5 w-4.5" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">{activeConversation.name}</span>
                                                <span className="block text-xs text-slate-400 dark:text-slate-500">
                                                    {t('messages.n_membres', '{count} membres').replace('{count}', activeConversation.member_count)}
                                                </span>
                                            </span>
                                        </div>
                                    ) : (
                                        <Link href={`/profil/${activeConversation.user.id}`} className="flex min-w-0 items-center gap-2.5">
                                            <span className="relative flex-shrink-0">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={activeConversation.user.avatar_path ? `/storage/${activeConversation.user.avatar_path}` : undefined} alt="" />
                                                    <AvatarFallback>{activeConversation.user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                {liveStatus.online && (
                                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                                                )}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">{activeConversation.user.name}</span>
                                                <span className="block text-xs text-slate-400 dark:text-slate-500">
                                                    {liveStatus.typing
                                                        ? t('messages.en_train_decrire', "en train d'écrire…")
                                                        : liveStatus.online
                                                          ? t('messages.en_ligne', 'En ligne')
                                                          : ''}
                                                </span>
                                            </span>
                                        </Link>
                                    )}
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-3">
                                    <button
                                        onClick={() => setShowSearch((v) => !v)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:underline"
                                        aria-label={t('messages.rechercher_conversation', 'Rechercher dans la conversation')}
                                    >
                                        <Search className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                    {isGroup ? (
                                        <Link
                                            href={`/groupes/${activeConversation.id}`}
                                            className="flex items-center gap-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:underline"
                                        >
                                            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            <span className="hidden sm:inline">{t('messages.plus', 'Plus')}</span>
                                        </Link>
                                    ) : (
                                        <button onClick={() => setShowMedia((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:underline">
                                            <Images className="h-3.5 w-3.5" aria-hidden="true" />
                                            <span className="hidden sm:inline">
                                                {showMedia ? t('messages.masquer_medias', 'Masquer les médias') : t('messages.medias_echanges', 'Médias échangés')}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showSearch && (
                                <div className="border-b border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                    <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 dark:border-slate-600 dark:bg-slate-800">
                                        <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                                        <input
                                            type="text"
                                            value={messageSearch}
                                            onChange={(e) => setMessageSearch(e.target.value)}
                                            placeholder={t('messages.rechercher_dans_conversation', 'Rechercher dans cette conversation…')}
                                            className="w-full bg-transparent text-sm focus:outline-none dark:text-white"
                                            autoFocus
                                        />
                                    </label>
                                    {messageSearch && (
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            {t('messages.n_resultats', '{count} résultat(s)').replace('{count}', visibleMessages.length)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {!isGroup && showMedia && (
                                <div className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                    <div className="flex gap-1 px-3 pt-2">
                                        {[
                                            { key: 'images', label: t('messages.medias_images', 'Images'), icon: Images },
                                            { key: 'videos', label: t('messages.medias_videos', 'Vidéos'), icon: VideoIcon },
                                            { key: 'documents', label: t('messages.medias_documents', 'Documents'), icon: FileText },
                                            { key: 'liens', label: t('messages.medias_liens', 'Liens'), icon: Link2 },
                                        ].map((tabItem) => (
                                            <button
                                                key={tabItem.key}
                                                onClick={() => setMediaTab(tabItem.key)}
                                                className={`flex items-center gap-1 rounded-t-lg px-2.5 py-1.5 text-xs font-medium ${
                                                    mediaTab === tabItem.key ? 'bg-white text-isstm-navy dark:bg-slate-800 dark:text-white' : 'text-slate-400'
                                                }`}
                                            >
                                                <tabItem.icon className="h-3 w-3" aria-hidden="true" />
                                                {tabItem.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto p-3">
                                        {mediaByTab[mediaTab].length === 0 && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{t('messages.aucun_media', 'Aucun média échangé.')}</p>
                                        )}
                                        {mediaTab === 'liens'
                                            ? mediaByTab.liens.map((l) => (
                                                  <a key={l.id} href={l.url} target="_blank" rel="noopener" className="flex max-w-[10rem] flex-shrink-0 items-center gap-1 truncate rounded-lg bg-white px-2.5 py-1.5 text-xs text-isstm-navy underline dark:bg-slate-800 dark:text-white">
                                                      <Link2 className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                                      {l.url}
                                                  </a>
                                              ))
                                            : mediaByTab[mediaTab].map((m) =>
                                                  mediaTab === 'images' ? (
                                                      <a key={m.id} href={`/storage/${m.path}`} target="_blank" rel="noopener">
                                                          <img src={`/storage/${m.path}`} alt="" className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                                                      </a>
                                                  ) : (
                                                      <a
                                                          key={m.id}
                                                          href={`/storage/${m.path}`}
                                                          target="_blank"
                                                          rel="noopener"
                                                          className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-white text-center dark:bg-slate-800"
                                                      >
                                                          {mediaTab === 'videos' ? <VideoIcon className="h-5 w-5 text-slate-400" aria-hidden="true" /> : <FileText className="h-5 w-5 text-slate-400" aria-hidden="true" />}
                                                          <span className="w-full truncate px-1 text-[9px] text-slate-400">{m.original_name}</span>
                                                      </a>
                                                  ),
                                              )}
                                    </div>
                                </div>
                            )}

                            {opening && <MessageThreadSkeleton />}

                            {!opening && (
                                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                    {isGroup
                                        ? visibleMessages.map((m) => (
                                              <GroupMessageBubble key={m.id} message={m} isOwn={m.sender_id === auth.user.id} />
                                          ))
                                        : visibleMessages.map((m) => (
                                              <MessageBubble
                                                  key={m.id}
                                                  message={m}
                                                  isOwn={m.sender_id !== activeConversation.user.id}
                                                  isLastOwnMessage={m.sender_id !== activeConversation.user.id && m.id === lastOwnMessageId}
                                                  conversations={conversations.filter((c) => c.kind !== 'groupe')}
                                                  onReply={() => startReply(m)}
                                              />
                                          ))}
                                </div>
                            )}

                            {!isGroup && replyingTo && (
                                <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                    <span className="truncate">
                                        {t('messages.reponse_a', 'Réponse à')} <span className="font-medium">{replyingTo.sender_id === activeConversation.user.id ? activeConversation.user.name : t('messages.vous', 'vous')}</span>
                                        {replyingTo.body ? ` · ${replyingTo.body}` : ''}
                                    </span>
                                    <button type="button" onClick={cancelReply} className="flex-shrink-0" aria-label={t('nav.annuler', 'Annuler')}>
                                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            )}

                            {data.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 pt-2 dark:border-slate-700">
                                    {data.attachments.map((file, i) => (
                                        <span key={i} className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {file.name}
                                            <button
                                                type="button"
                                                onClick={() => setData('attachments', data.attachments.filter((_, fi) => fi !== i))}
                                                aria-label={t('nav.annuler', 'Annuler')}
                                            >
                                                <X className="h-3 w-3" aria-hidden="true" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 p-3">
                                <label className="flex-shrink-0 text-slate-400 dark:text-slate-500" title={t('groupes.piece_jointe', 'Pièce jointe')}>
                                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setData('attachments', [...data.attachments, ...Array.from(e.target.files)])}
                                        className="hidden"
                                    />
                                </label>
                                <EmojiPickerButton onSelect={(emoji) => setData('body', data.body + emoji)} />
                                <VoiceRecorder onRecorded={(file) => setData('attachments', [...data.attachments, file])} />
                                <input
                                    type="text"
                                    value={data.body}
                                    onChange={(e) => {
                                        setData('body', e.target.value);
                                        pingTyping();
                                    }}
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
