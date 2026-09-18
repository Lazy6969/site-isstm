import { Link, router, usePage } from '@inertiajs/react';
import { Home, GraduationCap, Newspaper, User, MoreHorizontal, Search, Image, MessageCircle, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { etablissementLinks, vieEtudianteLinks, communauteLinks } from './headerNavLinks';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileTabBar({ showLogin = true }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);
    const [moreOpen, setMoreOpen] = useState(false);
    const [etablissementOpen, setEtablissementOpen] = useState(false);

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    const accountTab = user
        ? { href: '/profil', label: 'Compte', icon: User }
        : showLogin
          ? { href: '/login', label: 'Se connecter', icon: LogIn }
          : { href: '/inscription', label: "S'inscrire", icon: LogIn };

    const moreLinks = [
        ...vieEtudianteLinks,
        { href: '/galerie', label: 'Galerie', icon: Image },
        { href: '/contact', label: 'Contact' },
        { href: '/recherche', label: 'Recherche', icon: Search },
        { href: '/bibliotheque', label: 'Bibliothèque numérique' },
        ...(isCommunityMember ? communauteLinks : []),
    ];

    return (
        <>
            <nav
                className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom,0px)] text-isstm-navy shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
                aria-label="Navigation mobile"
            >
                <Link href="/" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium">
                    <Home className="h-5 w-5" aria-hidden="true" />
                    Accueil
                </Link>
                <button
                    type="button"
                    onClick={() => setEtablissementOpen(true)}
                    className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
                >
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    Établissement
                </button>
                <Link href="/actualites" className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium">
                    <Newspaper className="h-5 w-5" aria-hidden="true" />
                    Actualités
                </Link>
                <Link href={accountTab.href} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium">
                    <accountTab.icon className="h-5 w-5" aria-hidden="true" />
                    {accountTab.label}
                </Link>
                <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
                >
                    <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                    Plus
                </button>
            </nav>

            <Sheet open={etablissementOpen} onOpenChange={setEtablissementOpen}>
                <SheetContent side="bottom" className="md:hidden">
                    <SheetTitle>Établissement</SheetTitle>
                    <nav className="mt-4 flex flex-col divide-y divide-slate-100">
                        {etablissementLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setEtablissementOpen(false)}
                                className="py-3 text-sm text-slate-700"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetContent side="bottom" className="md:hidden">
                    <SheetTitle>Plus</SheetTitle>
                    <nav className="mt-4 flex flex-col divide-y divide-slate-100">
                        {moreLinks.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className="flex items-center gap-2.5 py-3 text-sm text-slate-700">
                                {item.icon && <item.icon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                                {item.label}
                            </Link>
                        ))}
                        {user && (
                            <button onClick={logout} className="flex items-center gap-2.5 py-3 text-left text-sm text-slate-700">
                                <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                Déconnexion
                            </button>
                        )}
                    </nav>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            Langue
                        </span>
                        <LanguageSwitcher className="!border-slate-200 !text-isstm-navy hover:!text-isstm-gold" />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
