import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminHeader from '../Admin/AdminHeader';
import { Sheet, SheetContent } from '../ui/sheet';

export default function AdminLayout({ children, title, actions }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-admin-bg font-admin-sans text-admin-text">
            <Head title={title ? `${title} · Administration` : 'Administration'} />

            <div className="hidden border-r border-admin-border lg:block">
                <div className="sticky top-0 h-screen">
                    <AdminSidebar />
                </div>
            </div>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent side="left" className="w-72 max-w-[80vw] border-admin-border bg-admin-chrome p-0 text-admin-text">
                    <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 flex-col">
                <AdminHeader onOpenSidebar={() => setMobileNavOpen(true)} />

                <main className="animate-in fade-in-0 slide-in-from-bottom-1 flex-1 px-4 py-6 duration-300 sm:px-6 lg:px-8">
                    {title && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-admin-text">{title}</h1>
                            {actions}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
