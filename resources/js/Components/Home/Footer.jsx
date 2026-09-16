import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-isstm-navy-dark py-8 text-center text-sm text-white/60">
            <p>&copy; {new Date().getFullYear()} ISSTM — Institut Supérieur des Sciences, Techniques et Management, Mahajanga.</p>
            <nav className="mt-3 flex justify-center gap-4 text-xs">
                <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
                <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
            </nav>
        </footer>
    );
}
