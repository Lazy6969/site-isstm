import { Bot, SendHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { xsrfToken } from '../../lib/csrf';
import { useTranslations } from '../../lib/useTranslations';

/**
 * "Assistant ISSTM" — a small FAQ chatbot, ported from the ai_help.php
 * assistant on github.com/Lazy6969/ISSTM (keyword/FAQ matching, no paid AI
 * key). Unlike that reference's always-visible floating bubble, it stays
 * tucked behind this header icon — a dropdown panel, same positioning
 * pattern as NotificationBell — so it doesn't sit on top of page content
 * until a visitor actually opens it.
 */
export default function AssistantIsstm() {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([]);
    const [panelPos, setPanelPos] = useState(null);
    const ref = useRef(null);
    const panelRef = useRef(null);
    const messagesRef = useRef(null);

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

    // Portaled straight to <body> so it always stacks above the floating
    // account/scroll widgets — those are fixed at the document root with
    // their own z-index, and a dropdown nested inside this sticky header
    // would otherwise be capped by the header's own (lower) stacking
    // context no matter its own z-index. That means it's no longer
    // positioned by CSS relative to this button, so coordinates are
    // computed here instead.
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

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages, sending]);

    function toggle() {
        setOpen((current) => {
            const next = !current;
            if (!next) {
                // Ne garde pas l'historique d'une conversation fermée — repart
                // sur le message d'accueil à la prochaine ouverture.
                setMessages([]);
                setInput('');
            }
            return next;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const question = input.trim();
        if (!question || sending) {
            return;
        }

        setMessages((current) => [...current, { sender: 'user', text: question }]);
        setInput('');
        setSending(true);

        try {
            const res = await fetch('/assistant/demander', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({ message: question }),
            });
            const data = await res.json();
            setMessages((current) => [...current, { sender: 'bot', text: data.reply, link: data.link, linkLabel: data.link_label }]);
        } catch {
            setMessages((current) => [...current, { sender: 'bot', text: t('assistant.erreur_connexion', 'Erreur de connexion. Réessayez plus tard.') }]);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="relative" ref={ref} data-qe-skip>
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                title={t('assistant.titre', 'Assistant ISSTM')}
                aria-label={t('assistant.titre', 'Assistant ISSTM')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-isstm-gold hover:bg-white/10 hover:text-isstm-gold active:scale-95"
            >
                <Bot className="h-[18px] w-4" aria-hidden="true" />
            </button>

            {open && panelPos && createPortal(
                <div
                    ref={panelRef}
                    className="fixed z-[70] flex h-[28rem] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                    style={{ top: panelPos.top, right: panelPos.right }}
                >
                    <div className="flex items-center justify-between bg-isstm-navy px-4 py-3 text-white">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <Bot className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                            {t('assistant.titre', 'Assistant ISSTM')}
                        </span>
                        <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="opacity-80 transition hover:opacity-100">
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div ref={messagesRef} className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
                        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-isstm-navy/10 px-3.5 py-2.5 text-sm leading-relaxed dark:bg-isstm-gold/10">
                            {t('assistant.message_bienvenue', "Bonjour ! Posez-moi une question sur l'ISSTM (inscription, bourse, filières, contact...).")}
                        </div>

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                    msg.sender === 'user'
                                        ? 'ml-auto rounded-br-sm bg-isstm-navy text-white'
                                        : 'rounded-bl-sm bg-isstm-navy/10 dark:bg-isstm-gold/10'
                                }`}
                            >
                                {msg.text}
                                {msg.link && msg.linkLabel && (
                                    <a href={msg.link} className="mt-1.5 flex items-center gap-1 font-semibold text-isstm-gold hover:underline">
                                        {msg.linkLabel} &rarr;
                                    </a>
                                )}
                            </div>
                        ))}

                        {sending && (
                            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-isstm-navy/10 px-3.5 py-2.5 text-sm dark:bg-isstm-gold/10">
                                <span className="inline-flex gap-1">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                                </span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 p-3 dark:border-slate-700">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('assistant.placeholder', 'Tapez votre question...')}
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-isstm-gold focus:outline-none dark:border-slate-600 dark:bg-slate-900"
                        />
                        <button
                            type="submit"
                            disabled={sending || !input.trim()}
                            aria-label="Envoyer"
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-isstm-gold text-isstm-navy-dark transition hover:brightness-110 disabled:opacity-50"
                        >
                            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </form>
                </div>,
                document.body,
            )}
        </div>
    );
}
