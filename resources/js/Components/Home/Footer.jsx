import { Link, usePage } from '@inertiajs/react';
import { Mail, Phone, MapPin, Link2 } from 'lucide-react';
import { etablissementLinks, vieEtudianteLinks } from '../Layout/headerNavLinks';

const quickLinks = [
    { href: '/', label: 'Accueil' },
    ...etablissementLinks,
    ...vieEtudianteLinks,
    { href: '/actualites', label: 'Actualités' },
    { href: '/galerie', label: 'Galerie' },
    { href: '/inscription', label: 'Inscription' },
    { href: '/bibliotheque', label: 'Bibliothèque numérique' },
    { href: '/contact', label: 'Contact' },
];

const locations = [
    { key: 'principale', titleKey: 'localisation_principale' },
    { key: 'annexe', titleKey: 'localisation_annexe_titre' },
];

export default function Footer() {
    const { props } = usePage();
    const content = props.content ?? {};

    return (
        <footer className="bg-isstm-navy-dark text-white/70">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Liens rapides</h4>
                    <nav className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {quickLinks.map((item) => (
                            <Link key={item.href} href={item.href} className="hover:text-white">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/logo-isstm.png" alt="ISSTM" className="h-11 w-11 rounded-full object-cover" />
                        <span className="text-base font-semibold text-white">ISSTM</span>
                    </Link>
                    {content.devise && <p className="mt-3 text-sm font-medium text-isstm-gold">{content.devise}</p>}
                    {content.footer_description && <p className="mt-3 max-w-sm text-sm leading-relaxed">{content.footer_description}</p>}
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Contactez-nous</h4>
                    <div className="mt-4 space-y-2.5 text-sm">
                        {content.contact_email && (
                            <a href={`mailto:${content.contact_email}`} className="flex items-center gap-2.5 hover:text-white">
                                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                {content.contact_email}
                            </a>
                        )}
                        {content.contact_telephone && (
                            <a href={`tel:${content.contact_telephone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2.5 hover:text-white">
                                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                {content.contact_telephone}
                            </a>
                        )}
                        {content.contact_facebook && (
                            <a href={content.contact_facebook} target="_blank" rel="noopener" className="flex items-center gap-2.5 hover:text-white">
                                <Link2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                Facebook
                            </a>
                        )}
                        {content.contact_adresse && (
                            <p className="flex items-start gap-2.5">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                <span>
                                    {content.contact_adresse}
                                    <br />
                                    <span className="text-white/50">{content.contact_adresse_detail}</span>
                                </span>
                            </p>
                        )}
                    </div>

                    <h5 className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/50">Nos localisations</h5>
                    <div className="mt-2 space-y-1.5 text-sm">
                        {locations.map((location) => (
                            <p key={location.key} className="text-white/60">
                                {content[location.titleKey]}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs sm:flex-row">
                    <p>&copy; {new Date().getFullYear()} ISSTM — Institut Supérieur des Sciences et Technologies de Mahajanga.</p>
                    <nav className="flex gap-4">
                        <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
                        <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
