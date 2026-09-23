import { Link, useForm, usePage } from '@inertiajs/react';
import { Code, Mail, Phone, MapPin, Link2, Send } from 'lucide-react';
import { getEtablissementLinks, getVieEtudianteLinks } from '../Layout/headerNavLinks';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../QuickEdit/EditableText';
import EditableImage from '../QuickEdit/EditableImage';

function NewsletterForm({ t }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/newsletter', { preserveScroll: true, onSuccess: () => reset('email') });
    }

    return (
        <div className="mt-6">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-isstm-footer-text/50">{t('footer.newsletter', 'Newsletter')}</h5>
            <p className="mt-1.5 text-sm text-isstm-footer-text/60">
                {t('footer.newsletter_texte', "Recevez les actualités de l'ISSTM par e-mail.")}
            </p>
            <form onSubmit={submit} className="mt-3 flex max-w-sm gap-2">
                <input
                    type="email"
                    required
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full rounded-lg border border-isstm-footer-text/15 bg-isstm-footer-text/5 px-3.5 py-2 text-sm text-isstm-footer-text placeholder:text-isstm-footer-text/40 focus:border-isstm-gold focus:outline-none"
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
        { href: '/preinscription', label: t('nav.inscription', 'Inscription') },
        { href: '/contact', label: t('nav.contact', 'Contact') },
    ];

    const locations = [
        { key: 'principale', titleKey: 'localisation_principale' },
        { key: 'annexe', titleKey: 'localisation_annexe_titre' },
    ];

    return (
        <footer className="bg-isstm-footer text-isstm-footer-text/70">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-isstm-footer-text">
                        <EditableText as="span" contentKey="footer_liens_rapides_titre">
                            {content.footer_liens_rapides_titre}
                        </EditableText>
                    </h4>
                    <nav className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {quickLinks.map((item) => (
                            <Link key={item.href} href={item.href} className="hover:text-isstm-footer-text">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <Link href="/" className="inline-flex items-center rounded-md bg-white p-1.5">
                                <img
                                    src={`/${content.footer_logo_isstm ?? 'images/logo-isstm.svg'}`}
                                    alt="ISSTM"
                                    className="h-11 w-auto object-contain"
                                />
                            </Link>
                            <EditableImage contentKey="footer_logo_isstm" value={content.footer_logo_isstm ?? 'images/logo-isstm.svg'} />
                        </div>
                        <span className="h-10 w-px bg-isstm-footer-text/15" aria-hidden="true" />
                        <div className="relative">
                            <a
                                href="https://www.mahajanga-univ.mg/"
                                target="_blank"
                                rel="noopener"
                                title={t('footer.universite_mahajanga', 'Université de Mahajanga')}
                                className="inline-flex items-center rounded-md bg-white p-1.5"
                            >
                                <img
                                    src={`/${content.footer_logo_umg ?? 'images/partenariat/universite-mahajanga-footer.svg'}`}
                                    alt="Université de Mahajanga"
                                    className="h-11 w-auto object-contain"
                                />
                            </a>
                            <EditableImage
                                contentKey="footer_logo_umg"
                                value={content.footer_logo_umg ?? 'images/partenariat/universite-mahajanga-footer.svg'}
                            />
                        </div>
                        <div className="relative">
                            <a
                                href="https://mesupres.gov.mg/"
                                target="_blank"
                                rel="noopener"
                                title="MESUPRES"
                                className="inline-flex items-center rounded-md bg-white p-1.5"
                            >
                                <img
                                    src={`/${content.footer_logo_mesupres ?? 'images/partenariat/mesupres.png'}`}
                                    alt="MESUPRES"
                                    className="h-11 w-auto object-contain"
                                />
                            </a>
                            <EditableImage
                                contentKey="footer_logo_mesupres"
                                value={content.footer_logo_mesupres ?? 'images/partenariat/mesupres.png'}
                            />
                        </div>
                    </div>
                    {content.devise && (
                        <EditableText as="p" contentKey="devise" className="mt-3 text-sm font-medium text-isstm-gold">
                            {content.devise}
                        </EditableText>
                    )}
                    {content.footer_description && (
                        <EditableText as="p" contentKey="footer_description" className="mt-3 max-w-sm text-sm leading-relaxed">
                            {content.footer_description}
                        </EditableText>
                    )}
                    <NewsletterForm t={t} />
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-isstm-footer-text">
                        <EditableText as="span" contentKey="footer_contact_titre">
                            {content.footer_contact_titre}
                        </EditableText>
                    </h4>
                    <div className="mt-4 space-y-2.5 text-sm">
                        {content.contact_email && (
                            <a href={`mailto:${content.contact_email}`} className="flex items-center gap-2.5 hover:text-isstm-footer-text">
                                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                {content.contact_email}
                            </a>
                        )}
                        {content.contact_telephone && (
                            <a
                                href={`tel:${content.contact_telephone.replace(/[^0-9+]/g, '')}`}
                                className="flex items-center gap-2.5 hover:text-isstm-footer-text"
                            >
                                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                {content.contact_telephone}
                            </a>
                        )}
                        {content.contact_facebook && (
                            <a
                                href={content.contact_facebook}
                                target="_blank"
                                rel="noopener"
                                className="flex items-center gap-2.5 hover:text-isstm-footer-text"
                            >
                                <Link2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                Facebook
                            </a>
                        )}
                        {content.contact_adresse && (
                            <p className="flex items-start gap-2.5">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                <span>
                                    <EditableText as="span" contentKey="contact_adresse">
                                        {content.contact_adresse}
                                    </EditableText>
                                    <br />
                                    <EditableText as="span" contentKey="contact_adresse_detail" className="text-isstm-footer-text/50">
                                        {content.contact_adresse_detail}
                                    </EditableText>
                                </span>
                            </p>
                        )}
                    </div>

                    <h5 className="mt-6 text-xs font-semibold uppercase tracking-wide text-isstm-footer-text/50">
                        <EditableText as="span" contentKey="footer_localisation_titre">
                            {content.footer_localisation_titre}
                        </EditableText>
                    </h5>
                    <div className="mt-2 space-y-1.5 text-sm">
                        {locations.map((location) => (
                            <EditableText as="p" key={location.key} contentKey={location.titleKey} className="text-isstm-footer-text/60">
                                {content[location.titleKey]}
                            </EditableText>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-isstm-footer-text/10 py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs sm:flex-row">
                    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
                        <span>
                            &copy; {new Date().getFullYear()} ISSTM —{' '}
                            <EditableText as="span" contentKey="footer_copyright_texte">
                                {content.footer_copyright_texte}
                            </EditableText>
                        </span>
                        <span aria-hidden="true">·</span>
                        <Link href="/equipe" className="inline-flex items-center gap-1.5 hover:text-isstm-footer-text">
                            <Code className="h-3.5 w-3.5" aria-hidden="true" />
                            <EditableText as="span" contentKey="footer_concue_par_texte">
                                {content.footer_concue_par_texte}
                            </EditableText>
                        </Link>
                    </p>
                    <nav className="flex gap-4">
                        <Link href="/mentions-legales" className="hover:text-isstm-footer-text">
                            {t('footer.mentions_legales', 'Mentions légales')}
                        </Link>
                        <Link href="/confidentialite" className="hover:text-isstm-footer-text">
                            {t('footer.confidentialite', 'Confidentialité')}
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
