import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, usePage } from '@inertiajs/react';
import { QuickEditProvider } from './lib/useQuickEdit';
import { ToastProvider } from './lib/useToast';
import { LogoutConfirmProvider } from './lib/useLogoutConfirm';
import { useIsNavigatingToHome } from './lib/useIsNavigatingToHome';
import { useIsNavigatingToCommunity } from './lib/useIsNavigatingToCommunity';
import QuickEditToggle from './Components/QuickEdit/QuickEditToggle';
import FlashToastBridge from './Components/Layout/FlashToastBridge';
import Toaster from './Components/Layout/Toaster';
import FloatingAccountButton from './Components/Layout/FloatingAccountButton';
import LogoutConfirmDialog from './Components/Layout/LogoutConfirmDialog';
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

// CommunityHeader (the espace étudiant's own header) renders its own inline
// FloatingAccountButton at the end of its nav — this global floating copy
// would otherwise show up a second time on top of it.
function FloatingAccountGroup() {
    const { url } = usePage();
    const inCommunitySpace = COMMUNITY_PATHS.some((path) => url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`));

    if (inCommunitySpace) {
        return null;
    }

    return (
        <div className="fixed top-1/2 left-5 z-[60] hidden -translate-y-1/2 flex-col items-center gap-3 rounded-full bg-white/40 p-2 shadow-lg ring-1 ring-white/60 backdrop-blur-md md:flex dark:bg-slate-900/40 dark:ring-white/10">
            <QuickEditToggle />
            <FloatingAccountButton />
        </div>
    );
}

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];

        // usePage()/useForm() only work inside Inertia's own <App> tree, so the
        // quick-edit and toast contexts have to wrap each page from here (a
        // persistent layout), not wrap <App> itself in setup() below — that
        // renders it as an ancestor of <App>, outside the context it needs.
        const existingLayout = page.default.layout;
        page.default.layout = (children) => (
            <ToastProvider>
                <QuickEditProvider>
                    <LogoutConfirmProvider>
                        {/*
                            Mobile-hidden: at md-/narrow widths the page content spans
                            almost the full viewport width (only px-6 side padding), so
                            this fixed-left-5 group would sit directly on top of section
                            text (e.g. Mission/Vision's paragraph) instead of in a free
                            margin. md+ layouts keep a wide unused gutter outside the
                            centered max-w-* containers, where it never overlaps content.
                            Mobile already has equivalent access via MobileTabBar's
                            account tab and (for admins) AdminHeader's inline pencil.
                        */}
                        <FloatingAccountGroup />
                        <FlashToastBridge />
                        <Toaster />
                        <LogoutConfirmDialog />
                        <HomeLoadingSkeletonBridge />
                        <CommunitySkeletonBridge />
                        {existingLayout ? existingLayout(children) : children}
                    </LogoutConfirmProvider>
                </QuickEditProvider>
            </ToastProvider>
        );

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
