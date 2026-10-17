import '../css/app.css';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, usePage } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { QuickEditProvider } from './lib/useQuickEdit';
import { ToastProvider } from './lib/useToast';
import { ConfirmProvider } from './lib/useConfirm';
import { LogoutConfirmProvider } from './lib/useLogoutConfirm';
import { useIsNavigatingToHome } from './lib/useIsNavigatingToHome';
import { useIsNavigatingToCommunity } from './lib/useIsNavigatingToCommunity';
import QuickEditToggle from './Components/QuickEdit/QuickEditToggle';
import FlashToastBridge from './Components/Layout/FlashToastBridge';
import Toaster from './Components/Layout/Toaster';
import FloatingAccountButton from './Components/Layout/FloatingAccountButton';
import LogoutConfirmDialog from './Components/Layout/LogoutConfirmDialog';
import ScrollProgressRobot from './Components/Layout/ScrollProgressRobot';
import InstallPwaPrompt from './Components/Layout/InstallPwaPrompt';
import CookieConsentBanner from './Components/Layout/CookieConsentBanner';
import QuickEditOverlay from './Components/QuickEdit/QuickEditOverlay';
import SitePrimaryColorPicker from './Components/QuickEdit/SitePrimaryColorPicker';
import HomeLoadingSkeleton from './Components/Home/HomeLoadingSkeleton';
import CommunitySkeleton from './Components/Loading/CommunitySkeleton';

function HomeLoadingSkeletonBridge() {
    const navigatingToHome = useIsNavigatingToHome();

    return navigatingToHome ? <HomeLoadingSkeleton /> : null;
}

function CommunitySkeletonBridge() {
    const navigatingToCommunity = useIsNavigatingToCommunity();

    return navigatingToCommunity ? <CommunitySkeleton /> : null;
}

const COMMUNITY_PATHS = ['/communaute', '/amis', '/messages', '/groupes', '/notifications'];

// /profil (edit + public view) and /parametres already have their own clear
// way back (a header/back link) and the account menu this group opens leads
// right back to those same pages — showing it there is pure redundant clutter
// and it visually crowds forms/content on narrower screens.
const FLOATING_ACCOUNT_HIDDEN_PATHS = ['/profil', '/parametres'];

// CommunityHeader (the espace étudiant's own header) renders its own inline
// FloatingAccountButton at the end of its nav — this global floating copy
// would otherwise show up a second time on top of it.
//
// Collapsed into a single logo button, bottom-left, matching
// ScrollProgressRobot's size/corner on the opposite side — clicking it
// reveals the quick-edit pencil and account avatar instead of showing both
// permanently. Shown on mobile too (bottom-20 clears MobileTabBar/
// CommunityMobileTabBar's fixed bottom nav, same offset ScrollProgressRobot
// already uses on the opposite corner) — mobile's own tab bar has an account
// tab, but no equivalent for the quick-edit pencil.
function FloatingAccountGroup() {
    const { props, url } = usePage();
    const inCommunitySpace = COMMUNITY_PATHS.some((path) => url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`));
    const onProfileOrSettings = FLOATING_ACCOUNT_HIDDEN_PATHS.some((path) => url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`));
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        function onClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    // Both children render nothing for a signed-out visitor, which left this
    // container as an empty pill pinned to the corner of every page. Hidden
    // inside /console too — AdminHeader already has its own profile menu and
    // inline pencil there, same reasoning as QuickEditToggle/SitePrimaryColorPicker.
    if (inCommunitySpace || onProfileOrSettings || url.startsWith('/console') || ! props.auth?.user) {
        return null;
    }

    return (
        <div ref={containerRef} className="fixed bottom-20 left-5 z-[60] flex flex-col items-center gap-3 md:bottom-5">
            <div
                className={`flex flex-col items-center gap-3 rounded-full bg-white/40 p-2 shadow-lg ring-1 ring-white/60 backdrop-blur-md transition-all duration-200 dark:bg-slate-900/40 dark:ring-white/10 ${
                    open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
                }`}
            >
                <QuickEditToggle />
                <FloatingAccountButton />
            </div>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-label={open ? 'Fermer le menu rapide' : 'Ouvrir le menu rapide'}
                title={open ? 'Fermer le menu rapide' : 'Ouvrir le menu rapide'}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-isstm-navy shadow-lg ring-1 ring-black/5 backdrop-blur-md transition hover:scale-105 dark:bg-slate-900/90 dark:text-white dark:ring-white/10"
            >
                <Settings className="h-6 w-6" aria-hidden="true" />
            </button>
        </div>
    );
}

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];

        // resolve() can run more than once for the very same page module
        // (import.meta.glob's eager mode returns one shared module object,
        // and Inertia may call resolve() again for the same page — e.g. on
        // prefetch). Without this guard, a second call would read back the
        // *already-wrapped* layout as `existingLayout` and wrap it a second
        // time, mounting every provider/global widget below twice (seen as
        // two ScrollProgressRobot buttons, two cookie banners, etc.).
        if (page.default.layout?.isGlobalProvidersLayout) {
            return page;
        }

        // usePage()/useForm() only work inside Inertia's own <App> tree, so the
        // quick-edit and toast contexts have to wrap each page from here (a
        // persistent layout), not wrap <App> itself in setup() below — that
        // renders it as an ancestor of <App>, outside the context it needs.
        const existingLayout = page.default.layout;
        const globalProvidersLayout = (children) => (
            <ToastProvider>
                <QuickEditProvider>
                  <ConfirmProvider>
                    <LogoutConfirmProvider>
                        {/*
                            Shown at every width (see FloatingAccountGroup) — now that it's
                            a single collapsed corner button instead of an always-open pill,
                            it no longer sits on top of page content at narrow widths the way
                            an expanded group would.
                        */}
                        <FloatingAccountGroup />
                        <ScrollProgressRobot />
                        <InstallPwaPrompt />
                        <CookieConsentBanner />
                        <SitePrimaryColorPicker />
                        <QuickEditOverlay />
                        <FlashToastBridge />
                        <Toaster />
                        <LogoutConfirmDialog />
                        <HomeLoadingSkeletonBridge />
                        <CommunitySkeletonBridge />
                        {existingLayout ? existingLayout(children) : children}
                    </LogoutConfirmProvider>
                  </ConfirmProvider>
                </QuickEditProvider>
            </ToastProvider>
        );
        globalProvidersLayout.isGlobalProvidersLayout = true;
        page.default.layout = globalProvidersLayout;

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#d4a017',
        showSpinner: false,
    },
});

// Production only: in dev, Vite serves unhashed, constantly-changing files —
// a service worker caching those would fight HMR instead of helping anyone.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
