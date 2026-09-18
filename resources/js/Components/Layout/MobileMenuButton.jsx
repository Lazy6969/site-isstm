import { Link, router, usePage } from '@inertiajs/react';
import { Menu, LogOut, Image, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { getEtablissementLinks, getVieEtudianteLinks, getCommunauteLinks } from './headerNavLinks';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';
import { useTranslations } from '../../lib/useTranslations';

export default function MobileMenuButton() {
    const { auth } = usePage().props;
    const { t } = useTranslations();
    const user = auth?.user;
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);
    const [open, setOpen] = useState(false);

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    const links = [
        ...getEtablissementLinks(t),
        ...getVieEtudianteLinks(t),
        { href: '/actualites', label: t('nav.actualites', 'Actualités') },
        { href: '/galerie', label: t('nav.galerie', 'Galerie'), icon: Image },
        { href: '/inscription', label: t('nav.inscription', 'Inscription') },
        { href: '/contact', label: t('nav.contact', 'Contact') },
        { href: '/bibliotheque', label: t('bibliotheque.titre', 'Bibliothèque numérique') },
        ...(isCommunityMember ? getCommunauteLinks(t) : []),
    ];

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t('nav.menu', 'Menu')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:border-isstm-gold hover:bg-white/10 hover:text-isstm-gold active:scale-95"
            >
                <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="max-h-[85vh]">
                    <SheetTitle>{t('nav.menu', 'Menu')}</SheetTitle>
                    <nav className="mt-4 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
                        {links.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 py-3 text-sm text-slate-700 dark:text-slate-200"
                            >
                                {item.icon && <item.icon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                                {item.label}
                            </Link>
                        ))}
                        {user && (
                            <button onClick={logout} className="flex items-center gap-2.5 py-3 text-left text-sm text-slate-700 dark:text-slate-200">
                                <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                {t('nav.deconnexion', 'Déconnexion')}
                            </button>
                        )}
                    </nav>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('footer.langue', 'Langue')}
                        </span>
                        <div className="flex items-center gap-2">
                            <DarkModeToggle className="!text-isstm-navy hover:!bg-isstm-navy/5 dark:!text-slate-100" />
                            <LanguageSwitcher className="!border-slate-200 !text-isstm-navy hover:!text-isstm-gold" />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
