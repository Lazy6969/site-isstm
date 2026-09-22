import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { QuickEditProvider } from './lib/useQuickEdit';
import { ToastProvider } from './lib/useToast';
import QuickEditToggle from './Components/QuickEdit/QuickEditToggle';
import FlashToastBridge from './Components/Layout/FlashToastBridge';
import Toaster from './Components/Layout/Toaster';

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
                    <QuickEditToggle />
                    <FlashToastBridge />
                    <Toaster />
                    {existingLayout ? existingLayout(children) : children}
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
