const KEY = 'admin-embed-community';

/**
 * Staff who open a community page from the admin sidebar's "Communauté" group
 * keep the admin chrome around it (see AppLayout) instead of being sent to the
 * student-facing layout. The choice lives only in this tab's sessionStorage, so
 * students — who never click that sidebar — are never affected.
 */
export function isAdminEmbedded() {
    try {
        return sessionStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

export function setAdminEmbedded(value) {
    try {
        if (value) sessionStorage.setItem(KEY, '1');
        else sessionStorage.removeItem(KEY);
    } catch {
        // storage unavailable — pages simply open in their own layout.
    }
}
