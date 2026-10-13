import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Components/ui/dialog';
import { cn } from './utils';

const ConfirmContext = createContext(null);

const TONES = {
    danger: {
        icon: Trash2,
        header: 'from-rose-500/15',
        ping: 'bg-rose-500/25',
        badge: 'from-rose-500 to-orange-500 shadow-rose-500/40',
        button: 'from-rose-500 to-orange-500 shadow-rose-500/30',
        defaultTitle: 'Attention : action irréversible ?',
        defaultConfirm: 'Supprimer',
    },
    warning: {
        icon: AlertTriangle,
        header: 'from-amber-500/15',
        ping: 'bg-amber-500/25',
        badge: 'from-amber-500 to-orange-400 shadow-amber-500/40',
        button: 'from-amber-500 to-orange-500 shadow-amber-500/30',
        defaultTitle: 'Attention',
        defaultConfirm: 'Continuer',
    },
    info: {
        icon: CheckCircle2,
        header: 'from-sky-500/15',
        ping: 'bg-sky-500/25',
        badge: 'from-sky-500 to-indigo-500 shadow-sky-500/40',
        button: 'from-sky-500 to-indigo-500 shadow-sky-500/30',
        defaultTitle: 'Confirmer cette action ?',
        defaultConfirm: 'Confirmer',
    },
};

/**
 * One styled confirmation for the whole app, replacing the browser's native
 * confirm() box. `const confirm = useConfirm()` returns a function that opens
 * the dialog and resolves to true (confirmed) or false (cancelled):
 *
 *   if (!(await confirm({ message: 'Supprimer ce message ?' }))) return;
 *
 * Options: message (required), title, details (a short line shown in a card
 * under the message — e.g. the item's name), confirmLabel, cancelLabel,
 * tone ('danger' default, 'warning' or 'info').
 */
export function ConfirmProvider({ children }) {
    const [request, setRequest] = useState(null);
    const resolver = useRef(null);

    const confirm = useCallback(
        (options) =>
            new Promise((resolve) => {
                // A second request while one is open cancels the first.
                resolver.current?.(false);
                resolver.current = resolve;
                setRequest(typeof options === 'string' ? { message: options } : options);
            }),
        [],
    );

    const settle = useCallback((answer) => {
        resolver.current?.(answer);
        resolver.current = null;
        setRequest(null);
    }, []);

    const value = useMemo(() => confirm, [confirm]);
    const tone = TONES[request?.tone ?? 'danger'] ?? TONES.danger;
    const Icon = request?.icon ?? tone.icon;

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <Dialog open={request !== null} onOpenChange={(open) => !open && settle(false)}>
                {request && (
                    <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">
                        <div className={cn('flex flex-col items-center bg-gradient-to-b to-transparent px-6 pb-2 pt-8 text-center', tone.header)}>
                            <span className="relative flex h-16 w-16 items-center justify-center">
                                <span className={cn('absolute inset-0 animate-ping rounded-full', tone.ping)} aria-hidden="true" />
                                <span className={cn('relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg', tone.badge)}>
                                    <Icon className="h-8 w-8" aria-hidden="true" />
                                </span>
                            </span>
                            <DialogHeader className="mt-4">
                                <DialogTitle className="text-center text-lg font-bold text-admin-text">{request.title ?? tone.defaultTitle}</DialogTitle>
                                <DialogDescription className="text-center text-sm text-admin-text-secondary">{request.message}</DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-6 pb-6">
                            {request.details && (
                                <p className="mt-3 flex items-center gap-2 rounded-2xl border border-admin-border bg-admin-hover/50 px-3 py-2.5 text-left text-sm font-semibold text-admin-text">
                                    <Info className="h-4 w-4 flex-shrink-0 text-admin-muted" aria-hidden="true" />
                                    <span className="min-w-0 truncate">{request.details}</span>
                                </p>
                            )}
                            <div className="mt-5 flex gap-2">
                                <button type="button" onClick={() => settle(false)} className="flex-1 rounded-full border border-admin-border px-4 py-2.5 text-sm font-semibold text-admin-text-secondary transition hover:bg-admin-hover">
                                    {request.cancelLabel ?? 'Annuler'}
                                </button>
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => settle(true)}
                                    className={cn('flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110', tone.button)}
                                >
                                    {request.confirmLabel ?? tone.defaultConfirm}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }

    return context;
}
