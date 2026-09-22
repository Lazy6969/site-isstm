import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { QuickEditProvider } from './lib/useQuickEdit';
import { ToastProvider } from './lib/useToast';
import { LogoutConfirmProvider } from './lib/useLogoutConfirm';
import QuickEditToggle from './Components/QuickEdit/QuickEditToggle';
import FlashToastBridge from './Components/Layout/FlashToastBridge';
import Toaster from './Components/Layout/Toaster';
import FloatingAccountButton from './Components/Layout/FloatingAccountButton';
import LogoutConfirmDialog from './Components/Layout/LogoutConfirmDialog';

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
                        <div className="fixed top-1/2 left-5 z-[60] flex -translate-y-1/2 flex-col items-center gap-3">
                            <QuickEditToggle />
                            <FloatingAccountButton />
                        </div>
                        <FlashToastBridge />
                        <Toaster />
                        <LogoutConfirmDialog />
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
