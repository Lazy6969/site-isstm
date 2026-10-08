import { Link, usePage } from '@inertiajs/react';
import { Archive, ArrowUpRight, BarChart3, FileEdit, FileText, Globe, LayoutDashboard, Mail, MapPin, Palette, Phone } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const SOCIALS = [
    ['contact_facebook', 'Facebook', 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z'],
    ['contact_whatsapp', 'WhatsApp', 'M12.04 2a9.9 9.9 0 0 0-8.48 15l-1.5 5.5 5.63-1.48A9.9 9.9 0 1 0 12.04 2Zm5.8 14.04c-.25.69-1.45 1.32-2 1.37-.5.05-1.14.07-1.84-.15a16.6 16.6 0 0 1-1.66-.61c-2.92-1.26-4.82-4.2-4.97-4.4-.14-.2-1.18-1.57-1.18-3s.75-2.12 1.02-2.41c.26-.3.58-.37.77-.37h.55c.18 0 .42-.07.65.5.25.58.84 2 .91 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.09 1.31 2.39 1.46.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.7-.18 1.4Z'],
    ['contact_instagram', 'Instagram', 'M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z'],
    ['contact_linkedin', 'LinkedIn', 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.84v1.57h.05c.54-1.01 1.85-2.07 3.8-2.07 4.06 0 4.81 2.67 4.81 6.14v5.86h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75Z'],
    ['contact_telegram', 'Telegram', 'M21.9 4.3 18.7 19.6c-.24 1.08-.88 1.35-1.78.84l-4.9-3.62-2.36 2.28c-.26.26-.48.48-.99.48l.35-5L18.1 6.4c.4-.35-.09-.55-.62-.2L6.9 12.9l-4.8-1.5c-1.05-.33-1.07-1.05.22-1.55l18.8-7.25c.87-.32 1.63.2 1.35 1.7Z'],
];

/**
 * Footer shown at the bottom of every admin page: identity and social links,
 * shortcuts limited to what the account may open, contact details (from the
 * site's own editable content) and a bottom bar with the copyright and the
 * signed-in account. Uses the admin theme tokens, so it follows light / dark
 * and the chosen accent.
 */
export default function AdminFooter() {
    const { t } = useTranslations();
    const { auth, content } = usePage().props;
    const permissions = auth?.permissions ?? [];
    const user = auth?.user;
    const year = new Date().getFullYear();
    const initial = (user?.name ?? '?').trim().charAt(0).toUpperCase();

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
        [Phone, t('admin.footer.phone', 'Téléphone'), content?.contact_telephone, content?.contact_telephone ? `tel:${content.contact_telephone.replace(/[^0-9+]/g, '')}` : null],
        [Mail, t('admin.footer.email', 'E-mail'), content?.contact_email, content?.contact_email ? `mailto:${content.contact_email}` : null],
        [MapPin, t('admin.footer.address', 'Adresse'), content?.contact_adresse, null],
    ].filter(([, , value]) => value);

    const linkClass = 'group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text';
    const iconTile = 'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-admin-accent/10 text-admin-accent transition group-hover:bg-admin-accent group-hover:text-admin-accent-foreground';

    return (
        <footer className="px-4 pb-6 pt-2 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card/80 shadow-sm backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-admin-accent to-transparent" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-admin-accent/10 blur-3xl" aria-hidden="true" />

                <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1.25fr_1fr_1.15fr]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo-isstm.svg" alt="" className="h-12 w-12 rounded-xl bg-white object-contain p-1.5 shadow-sm ring-1 ring-black/5" />
                            <div>
                                <p className="text-lg font-bold leading-tight tracking-wide text-admin-text">ISSTM</p>
                                <p className="text-xs font-medium uppercase tracking-wider text-admin-accent">{t('admin.footer.console', 'Console d’administration')}</p>
                            </div>
                        </div>
                        <p className="max-w-sm text-sm leading-relaxed text-admin-text-secondary">
                            {t('admin.footer.tagline', "Administration de l'Institut Supérieur des Sciences et Techniques de Mahajanga")}
                        </p>
                        {socials.length > 0 && (
                            <ul className="flex flex-wrap gap-2">
                                {socials.map(([key, label, path]) => (
                                    <li key={key}>
                                        <a
                                            href={content[key]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={label}
                                            title={label}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-admin-border bg-admin-bg/40 text-admin-text-secondary transition hover:-translate-y-0.5 hover:border-admin-accent/60 hover:bg-admin-accent hover:text-admin-accent-foreground hover:shadow-md hover:shadow-admin-accent/25"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] fill-current" aria-hidden="true">
                                                <path d={path} />
                                            </svg>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <nav aria-label={t('admin.footer.shortcuts', 'Raccourcis')}>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-admin-muted">{t('admin.footer.shortcuts', 'Raccourcis')}</h2>
                        <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                            {shortcuts.map(([href, Icon, label]) => (
                                <li key={href}>
                                    <Link href={href} className={linkClass}>
                                        <span className={iconTile}>
                                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                        <span className="truncate">{label}</span>
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <a href="/" target="isstm-site-preview" rel="noopener noreferrer" className={linkClass}>
                                    <span className={iconTile}>
                                        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                    <span className="truncate">{t('admin.header.view_site', 'Voir le site')}</span>
                                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 flex-shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {contacts.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-admin-muted">{t('admin.footer.contact', 'Contact')}</h2>
                            <ul className="space-y-2">
                                {contacts.map(([Icon, label, value, href]) => {
                                    const body = (
                                        <>
                                            <span className={iconTile}>
                                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-admin-muted">{label}</span>
                                                <span className="block break-words text-sm text-admin-text">{value}</span>
                                            </span>
                                        </>
                                    );

                                    return (
                                        <li key={label}>
                                            {href ? (
                                                <a href={href} className="group flex items-center gap-3 rounded-xl border border-admin-border/70 bg-admin-bg/30 px-3 py-2 transition hover:border-admin-accent/50 hover:bg-admin-hover">
                                                    {body}
                                                </a>
                                            ) : (
                                                <div className="group flex items-center gap-3 rounded-xl border border-admin-border/70 bg-admin-bg/30 px-3 py-2">{body}</div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-admin-border/70 bg-admin-bg/30 px-6 py-3.5 text-xs sm:px-8">
                    <p className="text-admin-text-secondary">
                        © {year} <span className="font-semibold text-admin-text">ISSTM</span>. {t('admin.footer.rights', 'Tous droits réservés.')}
                    </p>
                    {user && (
                        <p className="flex items-center gap-2 rounded-full border border-admin-border bg-admin-card py-1 pl-1 pr-3 text-admin-muted">
                            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-admin-accent text-[0.7rem] font-bold text-admin-accent-foreground">
                                {initial}
                                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-admin-card bg-emerald-500" aria-hidden="true" />
                            </span>
                            <span>
                                {t('admin.footer.signed_in_as', 'Connecté en tant que')} <span className="font-medium text-admin-text">{user.name}</span>
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}
