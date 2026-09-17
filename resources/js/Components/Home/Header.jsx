import { Link, router, usePage } from '@inertiajs/react';
import HeaderDropdown from '../Layout/HeaderDropdown';
import HeaderSearchButton from '../Layout/HeaderSearchButton';
import { etablissementLinks, vieEtudianteLinks, actualitesLinks } from '../Layout/headerNavLinks';

export default function Header() {
    const { auth } = usePage().props;
    const user = auth?.user;

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <header className="absolute inset-x-0 top-0 z-30 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <a href="#accueil" className="flex items-center gap-3">
                    <img src="/images/logo-isstm.jpg" alt="ISSTM" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/70" />
                    <span className="text-lg font-semibold tracking-wide">ISSTM</span>
                </a>

                <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
                    <HeaderDropdown label="Établissement" items={etablissementLinks} />
                    <HeaderDropdown label="Vie étudiante" items={vieEtudianteLinks} />
                    <HeaderDropdown label="Actualités" items={actualitesLinks} />
                    <Link href="/inscription" className="transition hover:text-isstm-gold">
                        Inscription
                    </Link>
                    <HeaderSearchButton variant="labelled" />
                </nav>

                <div className="hidden items-center gap-3 sm:flex">
                    {user ? (
                        <>
                            <Link href="/profil" className="text-sm font-medium transition hover:text-isstm-gold">
                                {user.name}
                            </Link>
                            <button
                                onClick={logout}
                                className="rounded-full border border-white/60 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-isstm-navy"
                            >
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/inscription"
                            className="rounded-full bg-isstm-gold px-4 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                        >
                            Inscrivez-vous
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
