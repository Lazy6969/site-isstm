export default function Header() {
    const links = [
        { href: '#accueil', label: 'Accueil' },
        { href: '#filieres', label: 'Filières' },
        { href: '#temoignages', label: 'Témoignages' },
        { href: '#contact', label: 'Contact' },
    ];

    return (
        <header className="absolute inset-x-0 top-0 z-30 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <a href="#accueil" className="flex items-center gap-3">
                    <img src="/images/logo-isstm.jpg" alt="ISSTM" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/70" />
                    <span className="text-lg font-semibold tracking-wide">ISSTM</span>
                </a>

                <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className="transition hover:text-isstm-gold">
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 sm:flex">
                    <a
                        href="#contact"
                        className="rounded-full border border-white/60 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-isstm-navy"
                    >
                        Se connecter
                    </a>
                    <a
                        href="#contact"
                        className="rounded-full bg-isstm-gold px-4 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    >
                        Inscrivez-vous
                    </a>
                </div>
            </div>
        </header>
    );
}
