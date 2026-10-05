import { Link, usePage } from '@inertiajs/react';
import { Archive, BarChart3, FileEdit, FileText, Globe, LayoutDashboard, Mail, MapPin, Palette, Phone } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const SOCIALS = [
    ['contact_facebook', 'Facebook', 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z'],
    ['contact_whatsapp', 'WhatsApp', 'M12.04 2a9.9 9.9 0 0 0-8.48 15l-1.5 5.5 5.63-1.48A9.9 9.9 0 1 0 12.04 2Zm5.8 14.04c-.25.69-1.45 1.32-2 1.37-.5.05-1.14.07-1.84-.15a16.6 16.6 0 0 1-1.66-.61c-2.92-1.26-4.82-4.2-4.97-4.4-.14-.2-1.18-1.57-1.18-3s.75-2.12 1.02-2.41c.26-.3.58-.37.77-.37h.55c.18 0 .42-.07.65.5.25.58.84 2 .91 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.09 1.31 2.39 1.46.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.7-.18 1.4Z'],
    ['contact_instagram', 'Instagram', 'M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z'],
    ['contact_linkedin', 'LinkedIn', 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.84v1.57h.05c.54-1.01 1.85-2.07 3.8-2.07 4.06 0 4.81 2.67 4.81 6.14v5.86h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75Z'],
    ['contact_telegram', 'Telegram', 'M21.9 4.3 18.7 19.6c-.24 1.08-.88 1.35-1.78.84l-4.9-3.62-2.36 2.28c-.26.26-.48.48-.99.48l.35-5L18.1 6.4c.4-.35-.09-.55-.62-.2L6.9 12.9l-4.8-1.5c-1.05-.33-1.07-1.05.22-1.55l18.8-7.25c.87-.32 1.63.2 1.35 1.7Z'],
];

/**
 * Footer shown at the bottom of every admin page: identity, contact details
 * (from the site's own editable content), shortcuts limited to what the
 * account may open, and the copyright line. Uses the admin theme tokens, so it
 * follows light / dark and the chosen accent.
 */
export default function AdminFooter() {
    const { t } = useTranslations();
    const { auth, content } = usePage().props;
    const permissions = auth?.permissions ?? [];
    const user = auth?.user;
    const year = new Date().getFullYear();

    const shortcuts = [
        ['/console/dashboard', LayoutDashboard, t('admin.nav.dashboard', 'Tableau de bord'), 'dashboard.view'],
        ['/console/statistiques', BarChart3, t('admin.nav.statistics', 'Statistiques'), 'statistics.view'],
        ['/console/contenu', FileEdit, t('admin.nav.contenu_site', 'Contenu du site'), 'quick-edit.access'],
        ['/console/documents', FileText, t('admin.nav.documents', 'Documents'), 'documents.view'],
        ['/console/archives', Archive, t('admin.nav.archives', 'Archives des actions'), 'activity-log.view'],
        ['/console/settings/appearance', Palette, t('admin.nav.apparence', 'Apparence'), 'settings.manage'],
    ].filter(([, , , permission]) => permissions.includes(permission));

    const socials = SOCIALS.filter(([key]) => content?.[key]);
    const contacts = [
        [Phone, content?.contact_telephone, content?.contact_telephone ? `tel:${content.contact_telephone.replace(/[^0-9+]/g, '')}` : null],
        [Mail, content?.contact_email, content?.contact_email ? `mailto:${content.contact_email}` : null],
        [MapPin, content?.contact_adresse, null],
    ].filter(([, value]) => value);

    return (
        <footer className="mt-10 border-t border-admin-border bg-admin-card/70 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-3">
                    <img src="/images/logo-isstm.svg" alt="" className="h-11 w-11 rounded-lg bg-white object-contain p-1 shadow-sm" />
                    <div className="text-left">
                        <p className="text-base font-bold leading-tight tracking-wide text-admin-text">ISSTM</p>
                        <p className="text-sm leading-tight text-admin-text-secondary">{t('admin.footer.tagline', "Administration de l'Institut Supérieur des Sciences et Techniques de Mahajanga")}</p>
                    </div>
                </div>

                {socials.length > 0 && (
                    <ul className="flex flex-wrap justify-center gap-2.5">
                        {socials.map(([key, label, path]) => (
                            <li key={key}>
                                <a
                                    href={content[key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    title={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-admin-border bg-admin-bg/40 text-admin-text transition hover:-translate-y-0.5 hover:border-admin-accent/60 hover:bg-admin-accent hover:text-admin-accent-foreground hover:shadow-md hover:shadow-admin-accent/25"
                                >
                                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                                        <path d={path} />
                                    </svg>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}

                {contacts.length > 0 && (
                    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-sm text-admin-text-secondary">
                        {contacts.map(([Icon, value, href]) => (
                            <li key={value} className="flex items-center gap-2">
                                <Icon className="h-4 w-4 flex-shrink-0 text-admin-muted" aria-hidden="true" />
                                {href ? (
                                    <a href={href} className="transition hover:text-admin-accent">
                                        {value}
                                    </a>
                                ) : (
                                    <span>{value}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="h-px w-full bg-gradient-to-r from-transparent via-admin-border to-transparent" aria-hidden="true" />

                <nav aria-label={t('admin.footer.shortcuts', 'Raccourcis')} className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                    {shortcuts.map(([href, Icon, label]) => (
                        <Link key={href} href={href} className="flex items-center gap-1.5 text-admin-text-secondary transition hover:text-admin-accent">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {label}
                        </Link>
                    ))}
                    <a href="/" target="isstm-site-preview" rel="noopener noreferrer" className="flex items-center gap-1.5 text-admin-text-secondary transition hover:text-admin-accent">
                        <Globe className="h-4 w-4" aria-hidden="true" />
                        {t('admin.header.view_site', 'Voir le site')}
                    </a>
                </nav>

                <div className="space-y-0.5 text-sm">
                    <p className="text-admin-text-secondary">
                        © {year} <span className="font-semibold text-admin-text">ISSTM</span>. {t('admin.footer.rights', 'Tous droits réservés.')}
                    </p>
                    {user && (
                        <p className="text-xs text-admin-muted">
                            {t('admin.footer.signed_in_as', 'Connecté en tant que')} <span className="font-medium text-admin-text-secondary">{user.name}</span>
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}
