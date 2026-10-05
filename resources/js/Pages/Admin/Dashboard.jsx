import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    School,
    UserPlus,
    ClipboardCheck,
    BookOpen,
    Presentation,
    Newspaper,
    Images,
    Quote,
    HeartHandshake,
    Zap,
    FileEdit,
    Users,
    CalendarDays,
    FileText,
    ArrowRight,
    Landmark,
    BarChart3,
    History,
    Palette,
    ScrollText,
    ExternalLink,
    Inbox,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import AdminLayout from '../../Components/Layout/AdminLayout';
import StatCard from '../../Components/Admin/StatCard';
import ChartCard from '../../Components/Admin/ChartCard';
import ActivityList from '../../Components/Admin/ActivityList';
import StudentDistribution from '../../Components/Admin/StudentDistribution';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs';
import { useTranslations } from '../../lib/useTranslations';

const tooltipStyle = {
    backgroundColor: 'var(--color-admin-card)',
    borderColor: 'var(--color-admin-border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--color-admin-text)',
};

const axisTick = { fill: 'var(--color-admin-muted)', fontSize: 12 };

function useNow() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    return now;
}

function Greeting() {
    const { t, locale } = useTranslations();
    const user = usePage().props.auth?.user;
    const now = useNow();
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';
    const date = new Intl.DateTimeFormat(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const time = new Intl.DateTimeFormat(dateLocale, { hour: '2-digit', minute: '2-digit' }).format(now);

    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-light tracking-tight text-admin-text">
                    {t('admin.dashboard.hello', 'Bonjour,')} <span className="font-bold">{user?.name}</span>
                </h1>
                <p className="mt-1 text-sm text-admin-text-secondary">{t('admin.dashboard.overview', "Voici un aperçu général de votre administration ISSTM.")}</p>
            </div>
            <div className="text-right">
                <p className="text-sm capitalize text-admin-text-secondary">{date}</p>
                <p className="text-3xl font-bold tabular-nums text-admin-text">{time}</p>
            </div>
        </div>
    );
}

function QuickLink({ href, icon: Icon, label, hint, external = false }) {
    const classes = 'group flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 hover:bg-admin-hover hover:translate-x-0.5';
    const content = (
        <>
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-admin-accent/15 text-admin-accent transition-colors group-hover:bg-admin-accent group-hover:text-admin-accent-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-admin-text">{label}</span>
                <span className="block truncate text-xs text-admin-muted">{hint}</span>
            </span>
            {external ? (
                <ExternalLink className="h-4 w-4 text-admin-muted" aria-hidden="true" />
            ) : (
                <ArrowRight className="h-4 w-4 text-admin-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
            )}
        </>
    );

    return external ? (
        <a href={href} target="isstm-site-preview" rel="noopener noreferrer" className={classes}>
            {content}
        </a>
    ) : (
        <Link href={href} className={classes}>
            {content}
        </Link>
    );
}

function ShortcutButton({ href, icon: Icon, label, primary = false }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                primary
                    ? 'border-transparent bg-gradient-to-r from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/25 hover:brightness-110'
                    : 'border-admin-border bg-admin-bg/40 text-admin-text hover:border-admin-accent/50 hover:bg-admin-hover'
            }`}
        >
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
        </Link>
    );
}

export default function Dashboard({
    stats,
    contentStats,
    trends,
    preinscriptionsParMois,
    etudiantsParNiveau,
    etudiantsParFiliere,
    activiteRecente,
    dossiersParType = [],
}) {
    const { t } = useTranslations();
    const permissions = usePage().props.auth?.permissions ?? [];
    const can = (permission) => !permission || permissions.includes(permission);
    const [periode, setPeriode] = useState(6);

    const periodOptions = [
        { value: 3, label: t('admin.dashboard.period_3', '3 mois') },
        { value: 6, label: t('admin.dashboard.period_6', '6 mois') },
    ];

    const quickLinks = [
        { href: '/', external: true, icon: Landmark, label: t('admin.dashboard.link_site', 'Voir le site public'), hint: t('admin.dashboard.link_site_hint', "S'ouvre dans un nouvel onglet") },
        { href: '/console/statistiques', icon: BarChart3, label: t('admin.dashboard.link_stats', 'Statistiques'), hint: t('admin.dashboard.link_stats_hint', "Vue d'ensemble chiffrée"), permission: 'statistics.view' },
        { href: '/console/contenu/historique', icon: History, label: t('admin.dashboard.link_history', 'Historique des modifications'), hint: t('admin.dashboard.link_history_hint', 'Restaurer une version du site'), permission: 'quick-edit.access' },
        { href: '/console/activity-log', icon: ScrollText, label: t('admin.dashboard.link_activity', "Journal d'activité"), hint: t('admin.dashboard.link_activity_hint', 'Qui a fait quoi, et quand'), permission: 'activity-log.view' },
        { href: '/console/settings/appearance', icon: Palette, label: t('admin.dashboard.link_appearance', 'Apparence'), hint: t('admin.dashboard.link_appearance_hint', "Couleurs et police de l'interface"), permission: 'settings.manage' },
    ].filter((link) => can(link.permission));

    const evolutionData = useMemo(() => preinscriptionsParMois.slice(-periode), [preinscriptionsParMois, periode]);

    const shortcuts = [
        { href: '/console/scolarite/etudiants', icon: GraduationCap, label: t('admin.dashboard.shortcut_students', 'Gérer les étudiants'), permission: 'etudiants.view', primary: true },
        { href: '/console/enseignants', icon: Presentation, label: t('admin.dashboard.shortcut_teachers', 'Gérer les enseignants'), permission: 'enseignants.view' },
        { href: '/console/documents', icon: FileText, label: t('admin.dashboard.shortcut_documents', 'Gérer les documents'), permission: 'documents.view' },
        { href: '/console/evenements', icon: CalendarDays, label: t('admin.dashboard.shortcut_events', 'Gérer les événements'), permission: 'evenements.view' },
        { href: '/console/contenu', icon: FileEdit, label: t('admin.dashboard.shortcut_content', 'Contenu du site'), permission: 'quick-edit.access' },
        { href: '/console/users', icon: Users, label: t('admin.dashboard.shortcut_users', 'Gérer les utilisateurs'), permission: 'users.view' },
    ].filter((shortcut) => can(shortcut.permission));

    return (
        <AdminLayout title={t('admin.dashboard.title', 'Tableau de bord')} showTitle={false}>
            <Greeting />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label={t('admin.dashboard.students', 'Étudiants')} value={stats.etudiants} icon={GraduationCap} hint={t('admin.dashboard.students_hint', 'Dossiers actifs')} trend={trends.etudiants} />
                <StatCard label={t('admin.dashboard.classes', 'Classes')} value={stats.classes} icon={School} hint={t('admin.dashboard.classes_hint', 'Toutes années confondues')} trend={trends.classes} />
                <StatCard
                    label={t('admin.dashboard.preinscriptions', 'Préinscriptions')}
                    value={stats.preinscriptions_en_attente}
                    icon={UserPlus}
                    hint={t('admin.dashboard.preinscriptions_hint', 'En attente de traitement')}
                    trend={trends.preinscriptions_en_attente}
                />
                <StatCard
                    label={t('admin.dashboard.inscriptions_validated', 'Inscriptions validées')}
                    value={stats.inscriptions_validees}
                    icon={ClipboardCheck}
                    hint={t('admin.dashboard.inscriptions_validated_hint', 'Année en cours')}
                    trend={trends.inscriptions_validees}
                />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-5">
                    <ChartCard
                        title={t('admin.dashboard.evolution_title', 'Évolution des préinscriptions')}
                        description={t('admin.dashboard.evolution_desc', 'Dossiers déposés par mois')}
                        action={
                            <Tabs value={String(periode)} onValueChange={(value) => setPeriode(Number(value))}>
                                <TabsList className="gap-1 rounded-lg bg-admin-hover p-1">
                                    {periodOptions.map((option) => (
                                        <TabsTrigger
                                            key={option.value}
                                            value={String(option.value)}
                                            className="rounded-md px-2.5 py-1 text-xs font-medium text-admin-muted transition-all duration-200 data-[state=active]:bg-admin-accent data-[state=active]:text-admin-accent-foreground data-[state=active]:shadow-sm hover:text-admin-text"
                                        >
                                            {option.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        }
                    >
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={evolutionData} margin={{ left: -20, right: 10, top: 10 }}>
                                <defs>
                                    <linearGradient id="preinscriptionsFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-admin-chart-1)" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="var(--color-admin-chart-1)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                                <XAxis dataKey="mois" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--color-admin-text)' }} />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name={t('admin.dashboard.preinscriptions_series', 'Préinscriptions')}
                                    stroke="var(--color-admin-chart-1)"
                                    strokeWidth={2.5}
                                    fill="url(#preinscriptionsFill)"
                                    dot={{ r: 3, fill: 'var(--color-admin-chart-1)', strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title={t('admin.dashboard.dossiers_par_type_title', 'Dossiers par type')}
                        description={t('admin.dashboard.dossiers_par_type_desc', 'Préinscriptions, réinscriptions et redoublants — état actuel')}
                    >
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={dossiersParType} margin={{ left: -20, right: 10, top: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                                <XAxis dataKey="type" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-admin-hover)' }} />
                                <Bar dataKey="en_cours" name={t('admin.dashboard.dossiers_en_cours', 'En cours')} stackId="dossiers" fill="var(--color-admin-chart-2)" />
                                <Bar dataKey="valide" name={t('admin.dashboard.dossiers_valide', 'Validé')} stackId="dossiers" fill="var(--color-admin-chart-3)" />
                                <Bar dataKey="refuse" name={t('admin.dashboard.dossiers_refuse', 'Refusé')} stackId="dossiers" fill="var(--color-admin-chart-5)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {shortcuts.length > 0 && (
                        <ChartCard
                            title={
                                <span className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                                    {t('admin.dashboard.shortcuts', 'Raccourcis')}
                                </span>
                            }
                        >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {shortcuts.map((shortcut) => (
                                    <ShortcutButton key={shortcut.href} {...shortcut} />
                                ))}
                            </div>
                        </ChartCard>
                    )}

                    <StudentDistribution byProgram={etudiantsParFiliere} byLevel={etudiantsParNiveau} canManage={can('etudiants.view')} />
                </div>

                <div className="space-y-5">
                    <ChartCard
                        title={
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-admin-accent" aria-hidden="true" />
                                {t('admin.dashboard.recent_activity', 'Activité récente')}
                            </span>
                        }
                        action={
                            can('activity-log.view') && (
                                <Link href="/console/activity-log" className="text-xs font-medium text-admin-accent hover:underline">
                                    {t('admin.dashboard.see_all', 'Voir tout')}
                                </Link>
                            )
                        }
                    >
                        <ActivityList items={activiteRecente} />
                    </ChartCard>

                    <ChartCard title={t('admin.dashboard.site_content', 'Contenu du site')}>
                        <ul className="space-y-1">
                            {[
                                [BookOpen, t('admin.dashboard.filieres', 'Filières'), contentStats.filieres],
                                [Presentation, t('admin.dashboard.enseignants', 'Enseignants'), contentStats.enseignants],
                                [Newspaper, t('admin.dashboard.actualites_publiees', 'Actualités publiées'), contentStats.actualites_publiees],
                                [Images, t('admin.dashboard.albums_galerie', 'Albums galerie'), contentStats.albums_galerie],
                                [Quote, t('admin.dashboard.temoignages', 'Témoignages'), contentStats.temoignages],
                                [HeartHandshake, t('admin.dashboard.partenaires', 'Partenaires'), contentStats.partenaires],
                            ].map(([Icon, label, value]) => (
                                <li key={label} className="flex items-center gap-3 rounded-lg px-1 py-2 text-sm">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-accent/15 text-admin-accent">
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <span className="flex-1 text-admin-text">{label}</span>
                                    <span className="font-semibold tabular-nums text-admin-text">{value}</span>
                                </li>
                            ))}
                        </ul>
                    </ChartCard>

                    {can('preinscriptions.manage') && (
                        <Link
                            href="/console/preinscriptions"
                            className="admin-card group flex items-center gap-4 p-5 transition-all duration-200 hover:!border-admin-accent/50"
                        >
                            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                                {stats.preinscriptions_en_attente > 0 ? <UserPlus className="h-6 w-6" aria-hidden="true" /> : <Inbox className="h-6 w-6" aria-hidden="true" />}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-admin-text">
                                    {stats.preinscriptions_en_attente > 0
                                        ? t('admin.dashboard.pending_title', ':count préinscription(s) à traiter').replace(':count', stats.preinscriptions_en_attente)
                                        : t('admin.dashboard.pending_none', 'Aucune préinscription en attente')}
                                </p>
                                <p className="text-xs text-admin-muted">{t('admin.dashboard.pending_hint', 'Ouvrir la liste des dossiers')}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-admin-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                    )}

                    <ChartCard
                        title={
                            <span className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                                {t('admin.dashboard.quick_links', 'Liens rapides')}
                            </span>
                        }
                    >
                        <div className="-mx-2 space-y-0.5">
                            {quickLinks.map((link) => (
                                <QuickLink key={link.href} {...link} />
                            ))}
                        </div>
                    </ChartCard>
                </div>
            </div>
        </AdminLayout>
    );
}
