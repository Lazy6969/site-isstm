import { useEffect, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast } from '../../lib/useToast';

const ICONS = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
};

const STYLES = {
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    error: 'border-red-500/20 bg-red-500/10 text-red-500',
    info: 'border-sky-500/20 bg-sky-500/10 text-sky-500',
};

function ToastItem({ toast, onDismiss }) {
    const [visible, setVisible] = useState(false);
    const Icon = ICONS[toast.type] ?? CheckCircle2;

    useEffect(() => {
        // Mount hidden, then flip to visible on the next tick so the
        // transition (opacity/translate) actually animates in.
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    function handleDismiss() {
        setVisible(false);
        // Let the exit transition play before removing from the store.
        setTimeout(() => onDismiss(toast.id), 300);
    }

    return (
        <div
            role="status"
            className={`pointer-events-auto flex w-80 max-w-[calc(100vw-2.5rem)] items-start gap-2.5 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg backdrop-blur transition-all duration-300 dark:bg-slate-800 ${STYLES[toast.type] ?? STYLES.success} ${
                visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
        >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p className="flex-1 text-slate-700 dark:text-slate-200">{toast.message}</p>
            <button
                type="button"
                onClick={handleDismiss}
                className="flex-shrink-0 rounded p-0.5 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label="Fermer la notification"
            >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
        </div>
    );
}

/**
 * Global toast stack — mounted once alongside <ToastProvider> in app.jsx.
 * Stacks upward from the bottom-right so it never collides with the
 * quick-edit pencil, which lives at fixed left-5 top-1/2.
 */
export default function Toaster() {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-5 bottom-5 z-[70] flex flex-col-reverse gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
        </div>
    );
}
