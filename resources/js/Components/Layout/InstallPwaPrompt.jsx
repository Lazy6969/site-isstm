import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDeferredInstallPrompt, onInstallPromptAvailable } from '../../lib/pwaInstall';
import { useTranslations } from '../../lib/useTranslations';

const DISMISS_KEY = 'pwaInstallDismissedAt';
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 2500;

// Pages built on AppLayout (communauté, amis, messages, groupes,
// notifications, profil, paramètres, écolage, tableau de bord) already have
// their own fixed bottom tab bar (CommunityMobileTabBar) on mobile — a
// second fixed bar at the bottom would stack on top of it. The prompt is
// most useful for a first-time/anonymous visitor on the public site anyway,
// not someone already deep in their own space.
const HIDDEN_PREFIXES = [
    '/console',
    '/materiel',
    '/login',
    '/communaute',
    '/amis',
    '/messages',
    '/groupes',
    '/notifications',
    '/profil',
    '/parametres',
    '/ecolage',
    '/tableau-de-bord',
];

function isHidden(url) {
    return HIDDEN_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`));
}

function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

function recentlyDismissed() {
    try {
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        return dismissedAt !== null && Date.now() - Number(dismissedAt) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

function persistDismiss() {
    try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
        // localStorage unavailable (private mode, blocked storage) — the
        // prompt will just reappear next visit, which is an acceptable
        // degradation rather than a broken banner.
    }
}

/**
 * Mobile-only "Install the app?" banner. Android/Chrome gets the real
 * `beforeinstallprompt` flow (tapping "Installer" triggers the native
 * install dialog); iOS Safari has no such API, so it gets a short
 * instruction instead ("Partager" → "Sur l'écran d'accueil"). Shown once per
 * visit at most, a couple of seconds after load, and stays dismissed for two
 * weeks once closed or once the app is actually installed.
 */
export default function InstallPwaPrompt() {
    const { url } = usePage();
    const { t } = useTranslations();
    const [promptEvent, setPromptEvent] = useState(null);
    const [phase, setPhase] = useState('hidden'); // 'hidden' | 'android' | 'ios'
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || isStandalone() || recentlyDismissed()) {
            return undefined;
        }

        let timer;

        function scheduleAndroid(e) {
            setPromptEvent(e);
            clearTimeout(timer);
            timer = setTimeout(() => setPhase('android'), SHOW_DELAY_MS);
        }

        const existing = getDeferredInstallPrompt();
        if (existing) {
            scheduleAndroid(existing);
        } else if (isIos()) {
            timer = setTimeout(() => setPhase('ios'), SHOW_DELAY_MS);
        }

        const unsubscribe = onInstallPromptAvailable(scheduleAndroid);

        function onInstalled() {
            setPhase('hidden');
            persistDismiss();
        }
        window.addEventListener('appinstalled', onInstalled);

        return () => {
            unsubscribe();
            clearTimeout(timer);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    function dismiss() {
        setPhase('hidden');
        persistDismiss();
    }

    async function install() {
        if (!promptEvent) return;
        setInstalling(true);
        promptEvent.prompt();
        try {
            await promptEvent.userChoice;
        } finally {
            setInstalling(false);
            setPhase('hidden');
            persistDismiss();
        }
    }

    if (phase === 'hidden' || isHidden(url)) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-2 md:hidden">
            <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/10 dark:bg-slate-800 dark:ring-white/10">
                <img src="/images/pwa-icon-192.png" alt="" className="h-11 w-11 flex-shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {t('pwa.installer_titre', "Installer l'application ?")}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {phase === 'ios'
                            ? t('pwa.installer_ios', 'Appuyez sur Partager puis "Sur l\'écran d\'accueil"')
                            : t('pwa.installer_description', "Accès rapide depuis l'écran d'accueil, même hors ligne.")}
                    </p>
                </div>
                {phase === 'android' && (
                    <button
                        type="button"
                        onClick={install}
                        disabled={installing}
                        className="flex-shrink-0 rounded-full bg-isstm-navy px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                        {t('pwa.installer_bouton', 'Installer')}
                    </button>
                )}
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label={t('nav.fermer', 'Fermer')}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
