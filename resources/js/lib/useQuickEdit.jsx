import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

const QuickEditContext = createContext(null);

function getInitial() {
    try {
        return localStorage.getItem('quickEditMode') === '1';
    } catch {
        return false;
    }
}

export function QuickEditProvider({ children }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const canEdit = Boolean(auth?.user) && (auth?.permissions ?? []).includes('quick-edit.access');
    const [enabled, setEnabled] = useState(getInitial);

    useEffect(() => {
        try {
            localStorage.setItem('quickEditMode', enabled ? '1' : '0');
        } catch {
            // localStorage unavailable — the toggle just won't persist across visits.
        }
    }, [enabled]);

    // Turning quick edit on from inside the admin panel jumps to the public
    // site — there's nothing to edit on screen in /console. Turning it back
    // off stays on the current public page instead of jumping to the admin
    // dashboard, so the pencil never navigates the admin away unexpectedly.
    const toggle = useCallback(() => {
        const next = !enabled;
        setEnabled(next);

        if (next && url.startsWith('/console')) {
            router.visit('/');
        }
    }, [enabled, url]);

    // A user who loses the permission (role change, logout) never keeps the pencils,
    // even if a stale "enabled" flag is still sitting in localStorage.
    const active = canEdit && enabled;

    const value = useMemo(() => ({ canEdit, active, enabled, toggle }), [canEdit, active, enabled, toggle]);

    return <QuickEditContext.Provider value={value}>{children}</QuickEditContext.Provider>;
}

export function useQuickEdit() {
    const context = useContext(QuickEditContext);
    if (!context) {
        throw new Error('useQuickEdit must be used within a QuickEditProvider');
    }
    return context;
}
