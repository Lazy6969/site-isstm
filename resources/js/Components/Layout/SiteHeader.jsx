import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';
import HeaderDropdown from './HeaderDropdown';

const etablissementLinks = [
    { href: '/filieres', label: 'Filières' },
    { href: '/enseignants', label: 'Enseignants' },
    { href: '/parcours', label: 'Organigramme' },
    { href: '/campus', label: 'Campus & blocs régionaux' },
    { href: '/associations', label: 'Associations (AEI)' },
];

const vieEtudianteLinks = [
    { href: '/vie-etudiante', label: 'Vie étudiante' },
    { href: '/bourse', label: 'Bourse' },
    { href: '/documents', label: 'Documents administratifs' },
];

const actualitesLinks = [
    { href: '/actualites', label: 'Actualités' },
    { href: '/evenements', label: 'Événements' },
    { href: '/galerie', label: 'Galerie photo' },
];

const communauteLinks = [
    { href: '/communaute', label: 'Fil communautaire' },
    { href: '/amis', label: 'Amis' },
    { href: '/messages', label: 'Messages privés' },
    { href: '/groupes', label: 'Groupes de classe' },
];

export default function SiteHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const isCommunityMember = ['admin', 'enseignant', 'etudiant'].includes(user?.role);

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    const userMenuItems = [
        { href: `/profil/${user?.id}`, label: 'Voir mon profil public' },
        { href: '/profil', label: 'Modifier mon profil' },
        { href: '/bibliotheque', label: 'Bibliothèque numérique' },
        ...(user?.role === 'admin' ? [{ href: '/admin/preinscriptions', label: 'Préinscriptions' }] : []),
        ...(['admin', 'bibliotheque'].includes(user?.role) ? [{ href: '/bibliotheque/admin', label: 'Gérer la bibliothèque' }] : []),
        { divider: true, key: 'divider' },
        { label: 'Déconnexion', onClick: logout },
    ];

    return (
        <header className="bg-isstm-navy text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/logo-isstm.jpg" alt="ISSTM" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70" />
                        <span className="text-base font-semibold tracking-wide">ISSTM</span>
                    </Link>
                    <nav className="hidden items-center gap-6 lg:flex">
                        <HeaderDropdown label="Établissement" items={etablissementLinks} />
                        <HeaderDropdown label="Vie étudiante" items={vieEtudianteLinks} />
                        <HeaderDropdown label="Actualités" items={actualitesLinks} />
                        <Link href="/inscription" className="text-sm font-medium hover:text-isstm-gold">
                            Inscription
                        </Link>
                        <Link href="/recherche" className="hover:text-isstm-gold" aria-label="Recherche">
                            🔍
                        </Link>
                        {isCommunityMember && <HeaderDropdown label="Communauté" items={communauteLinks} />}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="hidden items-center gap-4 text-sm lg:flex">
                            {user.is_messagerie && (
                                <Link href="/messagerie" className="hover:text-isstm-gold" title="Messagerie interne">
                                    ✉️
                                </Link>
                            )}
                            {isCommunityMember && <NotificationBell />}
                            <HeaderDropdown
                                align="right"
                                items={userMenuItems}
                                trigger={
                                    <span className="flex items-center gap-2">
                                        <img
                                            src={user.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                                            alt=""
                                            className="h-7 w-7 rounded-full object-cover"
                                        />
                                        {user.name}
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                }
                            />
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden rounded-full border border-white/60 px-4 py-1.5 text-sm font-medium transition hover:bg-white hover:text-isstm-navy lg:inline-block"
                        >
                            Se connecter
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl lg:hidden"
                        aria-label="Menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-white/10 px-6 py-4 lg:hidden">
                    <nav className="flex flex-col gap-1 text-sm">
                        {[...etablissementLinks, ...vieEtudianteLinks, ...actualitesLinks, { href: '/inscription', label: 'Inscription' }, { href: '/recherche', label: 'Recherche' }].map(
                            (item) => (
                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                    {item.label}
                                </Link>
                            ),
                        )}

                        {isCommunityMember && (
                            <>
                                <div className="mt-2 border-t border-white/10 pt-2 text-xs uppercase tracking-wide text-white/50">Communauté</div>
                                {communauteLinks.map((item) => (
                                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                        {item.label}
                                    </Link>
                                ))}
                                <Link href="/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                    Notifications
                                </Link>
                            </>
                        )}

                        {user?.is_messagerie && (
                            <Link href="/messagerie" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                Messagerie interne
                            </Link>
                        )}

                        <div className="mt-2 border-t border-white/10 pt-2 text-xs uppercase tracking-wide text-white/50">Mon compte</div>
                        {user ? (
                            <>
                                <Link href="/profil" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                    Mon profil
                                </Link>
                                <Link href="/bibliotheque" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                    Bibliothèque numérique
                                </Link>
                                {user.role === 'admin' && (
                                    <Link href="/admin/preinscriptions" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                        Préinscriptions
                                    </Link>
                                )}
                                {['admin', 'bibliotheque'].includes(user.role) && (
                                    <Link href="/bibliotheque/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                        Gérer la bibliothèque
                                    </Link>
                                )}
                                <button onClick={logout} className="rounded-lg px-2 py-2 text-left hover:bg-white/10">
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 hover:bg-white/10">
                                Se connecter
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
