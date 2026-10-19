// Captures the browser's `beforeinstallprompt` event at module-load time —
// well before InstallPwaPrompt.jsx mounts — so the event isn't missed if it
// fires early. `e.preventDefault()` stops the browser's own mini-infobar so
// our own banner (and its delay/dismissal rules) is the only one shown.
let deferredPrompt = null;
let listeners = [];

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        listeners.forEach((listener) => listener(e));
    });
}

export function getDeferredInstallPrompt() {
    return deferredPrompt;
}

export function onInstallPromptAvailable(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
