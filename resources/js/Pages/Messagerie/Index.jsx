import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FileText, Paperclip, Search, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

const POLL_INTERVAL_MS = 8000;

function formatTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ others: initialOthers, messages: initialMessages }) {
    const { auth } = usePage().props;
    const { t } = useTranslations();
    const [messages, setMessages] = useState(initialMessages);
    const [others, setOthers] = useState(initialOthers);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const { data, setData, post, processing, reset } = useForm({ body: '', attachments: [] });
    const lastIdRef = useRef(initialMessages.at(-1)?.id ?? 0);
    const bottomRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setMessages(initialMessages);
        lastIdRef.current = initialMessages.at(-1)?.id ?? 0;
    }, [initialMessages]);

    useEffect(() => {
        setOthers(initialOthers);
    }, [initialOthers]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    function poll() {
        fetch(`/messagerie/sondage?since_id=${lastIdRef.current}`, { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((json) => {
                setOthers(json.others);

                setMessages((prev) => {
                    let next = prev;

                    if (json.deleted_ids?.length) {
                        next = next.filter((m) => !json.deleted_ids.includes(m.id));
                    }

                    if (json.own_read) {
                        next = next.map((m) => (json.own_read[m.id] ? { ...m, read_at: json.own_read[m.id] } : m));
                    }

                    if (json.messages?.length) {
                        lastIdRef.current = json.messages.at(-1).id;
                        next = [...next, ...json.messages];
                    }

                    return next;
                });
            })
            .catch(() => {});
    }

    function sendMessage(e) {
        e.preventDefault();
        post('/messagerie', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function deleteMessage(id, scope) {
        router.delete(`/messagerie/${id}`, { data: { scope }, preserveScroll: true });
    }

    function deleteConversation(scope) {
        const warning =
            scope === 'everyone'
                ? t('messagerie.confirmer_suppression_tous', 'Supprimer toute la conversation pour tout le monde ? Cette action est irréversible.')
                : t('messagerie.confirmer_masquage', 'Masquer tout votre historique de cette conversation ?');
        if (confirm(warning)) {
            router.post('/messagerie/supprimer', { scope }, { preserveScroll: true });
        }
    }

    function runSearch(e) {
        e.preventDefault();
        if (!search.trim()) {
            setSearchResults(null);
            return;
        }
        fetch(`/messagerie/recherche?q=${encodeURIComponent(search)}`, { headers: { Accept: 'application/json' } })
            .then((res) => res.json())
            .then((json) => setSearchResults(json.results));
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
            <Head title="Messagerie interne" />
            <SiteHeader />

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-isstm-navy dark:text-white">{t('messagerie.titre', 'Messagerie interne')}</h1>
                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            {t('messagerie.soustitre', 'Conversation unique entre tous les comptes de la messagerie.')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {others.map((o) => (
                            <div key={o.id} className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 shadow-sm" title={o.name}>
                                <span className={`h-2 w-2 rounded-full ${o.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                {o.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <form onSubmit={runSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('messagerie.placeholder_recherche', 'Rechercher dans les messages…')}
                            className="w-64 rounded-full border border-slate-300 px-3.5 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <button className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white">
                            <Search className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('nav.rechercher', 'Rechercher')}
                        </button>
                        {searchResults !== null && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setSearchResults(null);
                                }}
                                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 hover:bg-white"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('galerie.fermer', 'Fermer')}
                            </button>
                        )}
                    </form>
                    <div className="flex gap-2 text-xs">
                        <button onClick={() => deleteConversation('me')} className="text-slate-400 dark:text-slate-500 hover:text-red-600">
                            {t('messagerie.masquer_tout', 'Masquer tout pour moi')}
                        </button>
                        <button onClick={() => deleteConversation('everyone')} className="text-slate-400 dark:text-slate-500 hover:text-red-600">
                            {t('groupes.supprimer_pour_tous', 'Supprimer pour tous')}
                        </button>
                    </div>
                </div>

                {searchResults !== null ? (
                    <Card className="p-4">
                        <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">
                            {t('messagerie.resultats', 'Résultats')} ({searchResults.length})
                        </h2>
                        {searchResults.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('recherche.aucun_resultat_simple', 'Aucun résultat.')}</p>}
                        {searchResults.map((m) => (
                            <div key={m.id} className="border-b border-slate-50 py-2 text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{m.sender_name}</span>{' '}
                                <span className="text-xs text-slate-400 dark:text-slate-500">{formatTime(m.created_at)}</span>
                                <p className="text-slate-600 dark:text-slate-300">{m.body}</p>
                            </div>
                        ))}
                    </Card>
                ) : (
                    <Card className="flex h-[60vh] flex-col overflow-hidden">
                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            {messages.length === 0 && <p className="text-center text-sm text-slate-400 dark:text-slate-500">{t('groupes.aucun_message', 'Aucun message pour le moment.')}</p>}
                            {messages.map((m) => {
                                const isMine = m.sender_id === auth.user.id;
                                return (
                                    <div key={m.id} className="group flex items-start gap-2.5">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-semibold text-slate-800">{m.sender_name}</span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">{formatTime(m.created_at)}</span>
                                                {isMine && (
                                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                        {m.read_at ? t('messagerie.lu', 'Lu') : t('messagerie.envoye', 'Envoyé')}
                                                    </span>
                                                )}
                                            </div>
                                            {m.body && <p className="text-sm text-slate-700 dark:text-slate-200">{m.body}</p>}
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
                                            <div className="mt-0.5 flex gap-3 text-[11px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100">
                                                <button onClick={() => deleteMessage(m.id, 'me')} className="hover:underline">
                                                    {t('groupes.masquer_pour_moi', 'Masquer pour moi')}
                                                </button>
                                                {isMine && (
                                                    <button onClick={() => deleteMessage(m.id, 'everyone')} className="hover:text-red-600 hover:underline">
                                                        {t('groupes.supprimer_pour_tous', 'Supprimer pour tous')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

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
                    </Card>
                )}
            </main>

            <Footer />
        </div>
    );
}
