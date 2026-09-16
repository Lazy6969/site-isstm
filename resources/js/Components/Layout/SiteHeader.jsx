import { Link, router, usePage } from '@inertiajs/react';

export default function SiteHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <header className="bg-isstm-navy text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/logo-isstm.jpg" alt="ISSTM" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70" />
                        <span className="text-base font-semibold tracking-wide">ISSTM</span>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
                        <Link href="/filieres" className="hover:text-isstm-gold">Filières</Link>
                        <Link href="/enseignants" className="hover:text-isstm-gold">Enseignants</Link>
                        <Link href="/parcours" className="hover:text-isstm-gold">Organigramme</Link>
                        <Link href="/vie-etudiante" className="hover:text-isstm-gold">Vie étudiante</Link>
                        <Link href="/bourse" className="hover:text-isstm-gold">Bourse</Link>
                        <Link href="/inscription" className="hover:text-isstm-gold">Inscription</Link>
                        <Link href="/actualites" className="hover:text-isstm-gold">Actualités</Link>
                        <Link href="/evenements" className="hover:text-isstm-gold">Événements</Link>
                        <Link href="/galerie" className="hover:text-isstm-gold">Galerie</Link>
                        <Link href="/recherche" className="hover:text-isstm-gold" aria-label="Recherche">🔍</Link>
                        <Link href="/documents" className="hover:text-isstm-gold">Documents</Link>
                    </nav>
                </div>

                {user ? (
                    <div className="flex items-center gap-4 text-sm">
                        <Link href={`/profil/${user.id}`} className="flex items-center gap-2 hover:text-isstm-gold">
                            <img
                                src={user.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover"
                            />
                            {user.name}
                        </Link>
                        <Link href="/profil" className="hover:text-isstm-gold">
                            Mon profil
                        </Link>
                        {user.role === 'admin' && (
                            <Link href="/admin/preinscriptions" className="hover:text-isstm-gold">
                                Préinscriptions
                            </Link>
                        )}
                        <button onClick={logout} className="rounded-full border border-white/50 px-3 py-1.5 transition hover:bg-white hover:text-isstm-navy">
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="rounded-full border border-white/60 px-4 py-1.5 text-sm font-medium transition hover:bg-white hover:text-isstm-navy"
                    >
                        Se connecter
                    </Link>
                )}
            </div>
        </header>
    );
}
