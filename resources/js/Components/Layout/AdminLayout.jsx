import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminHeader from '../Admin/AdminHeader';
import AdminFooter from '../Admin/AdminFooter';
import BackToTop from '../Admin/BackToTop';
import { Sheet, SheetContent } from '../ui/sheet';
import { TooltipProvider } from '../ui/tooltip';
import { useTranslations } from '../../lib/useTranslations';

/**
 * The console opens in its dark look until the user picks a theme with the
 * toggle. Applied during the first render so the toggle reads the right state.
 */
const SIDEBAR_HIDDEN_KEY = 'admin-sidebar-hidden';

function readSidebarHidden() {
    try {
        return localStorage.getItem(SIDEBAR_HIDDEN_KEY) === '1';
    } catch {
        return false;
    }
}

function applyAdminDefaultDark() {
    if (typeof document === 'undefined') return;
    try {
        if (!localStorage.getItem('theme')) document.documentElement.classList.add('dark');
    } catch {
        // storage unavailable — keep the system preference.
    }
}

export default function AdminLayout({ children, title, actions, showTitle = true }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(readSidebarHidden);

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_HIDDEN_KEY, sidebarHidden ? '1' : '0');
        } catch {
            // storage unavailable — the choice just won't persist.
        }
    }, [sidebarHidden]);
    const { t } = useTranslations();

    useState(applyAdminDefaultDark);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="admin-shell flex min-h-screen font-admin-sans text-admin-text">
                <Head title={title ? `${title} · ${t('admin.header.brand_subtitle', 'Administration')}` : t('admin.header.brand_subtitle', 'Administration')} />

                {!sidebarHidden && (
                    <div className="hidden border-r border-admin-border lg:block">
                        <div className="sticky top-0 h-screen">
                            <AdminSidebar onToggle={() => setSidebarHidden(true)} />
                        </div>
                    </div>
                )}

                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetContent side="left" className="w-72 max-w-[80vw] border-admin-border bg-admin-chrome p-0 text-admin-text">
                        <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
                    </SheetContent>
                </Sheet>

                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminHeader onOpenSidebar={() => setMobileNavOpen(true)} sidebarHidden={sidebarHidden} onShowSidebar={() => setSidebarHidden(false)} />

                    <main className="animate-in fade-in-0 slide-in-from-bottom-1 flex-1 px-4 py-6 duration-300 sm:px-6 lg:px-8">
                        {title && showTitle && (
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight text-admin-text">{title}</h1>
                                {actions}
                            </div>
                        )}
                        {children}
                    </main>

                    <AdminFooter />
                </div>
            </div>
            <BackToTop />
        </TooltipProvider>
    );
}
