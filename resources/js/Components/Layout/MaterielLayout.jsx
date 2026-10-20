import { useState } from 'react';
import { Head } from '@inertiajs/react';
import MaterielHeader from '../Admin/MaterielHeader';
import BackToTop from '../Admin/BackToTop';
import { TooltipProvider } from '../ui/tooltip';
import { useTranslations } from '../../lib/useTranslations';

function applyAdminDefaultDark() {
    if (typeof document === 'undefined') return;
    try {
        if (!localStorage.getItem('theme')) document.documentElement.classList.add('dark');
    } catch {
        // storage unavailable — keep the system preference.
    }
}

/**
 * The dedicated shell for /materiel — same admin-chrome colors and account
 * controls as the console (MaterielHeader), but no sidebar: a
 * responsable-materiel account has exactly one page to be on, so there is
 * nothing to navigate between.
 */
export default function MaterielLayout({ children, title, actions, search, onSearchChange, searchPlaceholder }) {
    const { t } = useTranslations();
    useState(applyAdminDefaultDark);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="admin-shell flex min-h-screen flex-col font-admin-sans text-admin-text">
                <Head title={title ? `${title} · ${t('admin.header.brand_subtitle', 'Administration')}` : t('admin.header.brand_subtitle', 'Administration')} />

                <MaterielHeader search={search} onSearchChange={onSearchChange} searchPlaceholder={searchPlaceholder} />

                <main className="animate-in fade-in-0 slide-in-from-bottom-1 mx-auto w-full max-w-[1800px] flex-1 px-4 py-6 duration-300 sm:px-6 lg:px-8">
                    {title && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-admin-text">{title}</h1>
                            {actions}
                        </div>
                    )}
                    {children}
                </main>
            </div>
            <BackToTop />
        </TooltipProvider>
    );
}
