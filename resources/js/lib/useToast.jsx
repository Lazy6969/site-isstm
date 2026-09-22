import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 4000;

/**
 * Global toast notification store, modeled on useQuickEdit.jsx's
 * context + provider + hook pattern. Any component can call
 * `toast(message, { type })` via useToast() to push a notification;
 * <Toaster /> (mounted once, globally) renders the stack.
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((item) => item.id !== id));

        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const toast = useCallback(
        (message, { type = 'success' } = {}) => {
            if (!message) {
                return;
            }

            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setToasts((current) => [...current, { id, message, type }]);

            const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
            timers.current.set(id, timer);
        },
        [dismiss],
    );

    const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
