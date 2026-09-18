import { Link, useForm, usePage } from '@inertiajs/react';
import { Code, Mail, Phone, MapPin, Link2, Send } from 'lucide-react';
import { getEtablissementLinks, getVieEtudianteLinks } from '../Layout/headerNavLinks';
import { useTranslations } from '../../lib/useTranslations';

function NewsletterForm({ t }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/newsletter', { preserveScroll: true, onSuccess: () => reset('email') });
    }

    return (
        <div className="mt-6">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-white/50">{t('footer.newsletter', 'Newsletter')}</h5>
            <p className="mt-1.5 text-sm text-white/60">{t('footer.newsletter_texte', "Recevez les actualités de l'ISSTM par e-mail.")}</p>
            <form onSubmit={submit} className="mt-3 flex max-w-sm gap-2">
                <input
                    type="email"
                    required
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:border-isstm-gold focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={processing}
                    aria-label={t('footer.sabonner', "S'abonner")}
                    className="flex flex-shrink-0 items-center justify-center rounded-lg bg-isstm-gold px-3.5 text-isstm-navy-dark transition hover:brightness-110 disabled:opacity-50"
                >
                    <Send className="h-4 w-4" aria-hidden="true" />
                </button>
            </form>
            {errors.email && <p className="mt-1.5 text-xs text-red-300">{errors.email}</p>}
            {flash?.status && <p className="mt-1.5 text-xs text-isstm-gold">{flash.status}</p>}
        </div>
    );
}

export default function Footer() {
    const { props } = usePage();
    const { t } = useTranslations();
    const content = props.content ?? {};

    const quickLinks = [
        { href: '/', label: t('nav.accueil', 'Accueil') },
        ...getEtablissementLinks(t),
        ...getVieEtudianteLinks(t),
        { href: '/actualites', label: t('nav.actualites', 'Actualités') },
        { href: '/galerie', label: t('nav.galerie', 'Galerie') },
        { href: '/inscription', label: t('nav.inscription', 'Inscription') },
        { href: '/bibliotheque', label: t('bibliotheque.titre', 'Bibliothèque numérique') },
        { href: '/contact', label: t('nav.contact', 'Contact') },
    ];

    const locations = [
        { key: 'principale', titleKey: 'localisation_principale' },
        { key: 'annexe', titleKey: 'localisation_annexe_titre' },
    ];

    return (
        <footer className="bg-isstm-navy-dark text-white/70">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white">{t('footer.liens_rapides', 'Liens rapides')}</h4>
                    <nav className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {quickLinks.map((item) => (
                            <Link key={item.href} href={item.href} className="hover:text-white">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/" className="inline-flex items-center">
                            <img src="/images/logo-isstm.svg" alt="ISSTM" className="h-16 w-auto" />
                        </Link>
                        <span className="h-10 w-px bg-white/15" aria-hidden="true" />
                        <a
                            href="https://www.mahajanga-univ.mg/"
                            target="_blank"
                            rel="noopener"
                            title={t('footer.universite_mahajanga', 'Université de Mahajanga')}
                            className="inline-flex items-center rounded-md bg-white p-1.5"
                        >
                            <img src="/images/partenariat/universite-mahajanga.svg?v=2" alt="Université de Mahajanga" className="h-11 w-auto" />
                        </a>
                        <a
                            href="https://mesupres.gov.mg/"
                            target="_blank"
                            rel="noopener"
                            title="MESUPRES"
                            className="inline-flex items-center rounded-md bg-white p-1.5"
                        >
                            <img src="/images/partenariat/mesupres.png?v=2" alt="MESUPRES" className="h-11 w-auto" />
                        </a>
                    </div>
                    {content.devise && <p className="mt-3 text-sm font-medium text-isstm-gold">{content.devise}</p>}
                    {content.footer_description && <p className="mt-3 max-w-sm text-sm leading-relaxed">{content.footer_description}</p>}
                    <NewsletterForm t={t} />
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white">{t('footer.contact', 'Contactez-nous')}</h4>
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

                    <h5 className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/50">{t('footer.localisation', 'Nos localisations')}</h5>
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
                    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
                        <span>
                            &copy; {new Date().getFullYear()} ISSTM — {t('footer.institut_complet', 'Institut Supérieur des Sciences et Technologies de Mahajanga.')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <Link href="/equipe" className="inline-flex items-center gap-1.5 hover:text-white">
                            <Code className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('footer.concue_par', "Conçue par les étudiants de l'ISSTM")}
                        </Link>
                    </p>
                    <nav className="flex gap-4">
                        <Link href="/mentions-legales" className="hover:text-white">{t('footer.mentions_legales', 'Mentions légales')}</Link>
                        <Link href="/confidentialite" className="hover:text-white">{t('footer.confidentialite', 'Confidentialité')}</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
