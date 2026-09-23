import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

const LogoutConfirmContext = createContext(null);

/**
 * Global "confirm before logging out" store, modeled on useQuickEdit.jsx's
 * context + provider + hook pattern. Any component can call requestLogout()
 * via useLogoutConfirm() to open the confirmation dialog instead of posting
 * to /logout directly — <LogoutConfirmDialog /> (mounted once, globally)
 * renders the actual prompt and performs the real logout on confirm.
 */
export function LogoutConfirmProvider({ children }) {
    const [open, setOpen] = useState(false);

    const requestLogout = useCallback(() => setOpen(true), []);

    const confirm = useCallback(() => {
        setOpen(false);
        router.post('/logout');
    }, []);

    const cancel = useCallback(() => setOpen(false), []);

    const value = useMemo(() => ({ open, requestLogout, confirm, cancel }), [open, requestLogout, confirm, cancel]);

    return <LogoutConfirmContext.Provider value={value}>{children}</LogoutConfirmContext.Provider>;
}

export function useLogoutConfirm() {
    const context = useContext(LogoutConfirmContext);
    if (!context) {
        throw new Error('useLogoutConfirm must be used within a LogoutConfirmProvider');
    }
    return context;
}
