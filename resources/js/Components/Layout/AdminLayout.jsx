import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminHeader from '../Admin/AdminHeader';
import { Sheet, SheetContent } from '../ui/sheet';

export default function AdminLayout({ children, title }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-admin-bg text-admin-text">
            <Head title={title ? `${title} · Administration` : 'Administration'} />

            <div className="hidden border-r border-admin-border lg:block">
                <div className="sticky top-0 h-screen">
                    <AdminSidebar />
                </div>
            </div>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent side="left" className="w-72 max-w-[80vw] border-admin-border bg-admin-surface p-0 text-admin-text">
                    <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 flex-col">
                <AdminHeader onOpenSidebar={() => setMobileNavOpen(true)} />

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {title && <h1 className="mb-6 text-2xl font-semibold text-admin-text">{title}</h1>}
                    {children}
                </main>
            </div>
        </div>
    );
}
