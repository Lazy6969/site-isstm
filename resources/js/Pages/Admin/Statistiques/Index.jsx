import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { ClipboardCheck, FileText, GraduationCap, Inbox } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ChartCard from '../../../Components/Admin/ChartCard';
import { useTranslations } from '../../../lib/useTranslations';

const tooltipStyle = {
    backgroundColor: 'var(--color-admin-card)',
    borderColor: 'var(--color-admin-border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--color-admin-text)',
};

const axisTick = { fill: 'var(--color-admin-muted)', fontSize: 12 };

const CONTENT_STATUS_KEYS = ['brouillon', 'en_attente', 'publie', 'rejete', 'archive'];
const CONTENT_STATUS_LABELS = { brouillon: 'Brouillon', en_attente: 'En attente', publie: 'Publié', rejete: 'Rejeté', archive: 'Archivé' };

const BREAKDOWN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

/** Total + one segmented bar + a ranked list with per-status share. */
function StatusBreakdown({ title, data, icon: Icon }) {
    const { t } = useTranslations();
    const total = data.reduce((sum, row) => sum + row.total, 0);
    const ranked = [...data].sort((x, y) => y.total - x.total);

    return (
        <ChartCard
            title={title}
            action={
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
            }
        >
            {total === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-admin-accent/10 text-admin-accent">
                        <Inbox className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-sm text-admin-muted">{t('admin.common.table_empty', 'Aucune donnée pour le moment.')}</p>
                </div>
            ) : (
                <>
                    <p className="text-3xl font-semibold tabular-nums leading-none text-admin-text">{total}</p>
                    <div className="mt-4 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-admin-hover">
                        {ranked.map((entry, index) => (
                            <span
                                key={entry.statut}
                                title={`${entry.statut} : ${entry.total}`}
                                className="h-full rounded-full transition-all duration-700 ease-out hover:brightness-110"
                                style={{ width: `${(entry.total / total) * 100}%`, backgroundColor: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length] }}
                            />
                        ))}
                    </div>
                    <ul className="mt-4 space-y-1">
                        {ranked.map((entry, index) => {
                            const share = Math.round((entry.total / total) * 100);
                            return (
                                <li key={entry.statut} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-admin-hover/70">
                                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length] }} />
                                    <span className="flex-1 truncate text-sm text-admin-text-secondary transition-colors group-hover:text-admin-text">{entry.statut}</span>
                                    <span className="text-sm font-semibold tabular-nums text-admin-text">{entry.total}</span>
                                    <span className="w-10 text-right text-xs tabular-nums text-admin-muted">{share}%</span>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </ChartCard>
    );
}

const CONTENT_STATUS_I18N_KEYS = {
    brouillon: 'admin.common.draft',
    en_attente: 'admin.statistiques.status_en_attente',
    publie: 'admin.common.published',
    rejete: 'admin.statistiques.status_rejete',
    archive: 'admin.statistiques.status_archive',
};

const CONTENT_STATUS_COLORS = {
    brouillon: '#94a3b8',
    en_attente: '#f59e0b',
    publie: '#10b981',
    rejete: '#ef4444',
    archive: '#6366f1',
};

function TotalBadge({ value, label }) {
    return (
        <span className="flex items-baseline gap-1.5 rounded-full border border-admin-border bg-admin-hover/60 px-3 py-1 text-xs text-admin-text-secondary">
            <span className="text-sm font-semibold tabular-nums text-admin-text">{value}</span>
            {label}
        </span>
    );
}

function ChartTooltip({ active, payload, label, labelFormatter }) {
    const rows = (payload ?? []).filter((entry) => entry.value !== undefined && entry.value !== 0);

    if (!active || !payload?.length) return null;

    return (
        <div className="min-w-[140px] rounded-xl border border-admin-border bg-admin-card px-3 py-2 text-xs shadow-xl">
            <p className="mb-1.5 font-semibold text-admin-text">{label}</p>
            {rows.length === 0 && <p className="text-admin-muted">0</p>}
            {rows.map((entry) => (
                <p key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5 text-admin-text-secondary">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? entry.payload?.fill }} />
                        {labelFormatter ? labelFormatter(entry.name) : entry.name}
                    </span>
                    <span className="font-semibold tabular-nums text-admin-text">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

export default function Index({ usersByRole, contentByStatus, etudiantsByStatut, inscriptionsByStatut, preinscriptionsByStatut, activiteParJour }) {
    const { t } = useTranslations();
    const statusLabel = (value) => t(CONTENT_STATUS_I18N_KEYS[value], CONTENT_STATUS_LABELS[value] ?? value);
    const usersTotal = usersByRole.reduce((sum, row) => sum + row.total, 0);
    const contentTotal = contentByStatus.reduce((sum, row) => sum + CONTENT_STATUS_KEYS.reduce((acc, key) => acc + (row[key] ?? 0), 0), 0);

    return (
        <AdminLayout title={t('admin.statistiques.title', 'Statistiques')}>
            <p className="mb-6 text-sm text-admin-text-secondary">
                {t('admin.statistiques.description', "Vue d'ensemble chiffrée de l'administration, des inscriptions et du contenu.")}
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ChartCard
                    title={t('admin.statistiques.users_by_role_title', 'Utilisateurs par rôle')}
                    description={t('admin.statistiques.users_by_role_desc', 'Comptes administratifs actifs')}
                    action={<TotalBadge value={usersTotal} label={t('admin.statistiques.utilisateurs', 'Utilisateurs')} />}
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={usersByRole} margin={{ left: 0, right: 8, top: 10, bottom: 0 }} barCategoryGap="28%">
                            <defs>
                                <linearGradient id="rolesFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-admin-chart-1)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--color-admin-chart-1)" stopOpacity={0.55} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="role" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} interval={0} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={32} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-admin-accent)', fillOpacity: 0.08, radius: 6 }} />
                            <Bar
                                dataKey="total"
                                name={t('admin.statistiques.utilisateurs', 'Utilisateurs')}
                                fill="url(#rolesFill)"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={56}
                                animationDuration={700}
                                minPointSize={2}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title={t('admin.statistiques.content_by_status_title', 'Contenu par statut')}
                    description={t('admin.statistiques.content_by_status_desc', 'Actualités, galerie et événements')}
                    action={<TotalBadge value={contentTotal} label={t('admin.statistiques.elements', 'éléments')} />}
                >
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={contentByStatus} margin={{ left: 0, right: 8, top: 10, bottom: 0 }} barCategoryGap="28%">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="module" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} interval={0} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={32} />
                            <Tooltip content={<ChartTooltip labelFormatter={statusLabel} />} cursor={{ fill: 'var(--color-admin-accent)', fillOpacity: 0.08, radius: 6 }} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: 12, color: 'var(--color-admin-muted)', paddingTop: 8 }}
                                formatter={(value) => statusLabel(value)}
                            />
                            {CONTENT_STATUS_KEYS.map((status, index) => (
                                <Bar
                                    key={status}
                                    dataKey={status}
                                    name={status}
                                    stackId="statut"
                                    fill={CONTENT_STATUS_COLORS[status]}
                                    radius={index === CONTENT_STATUS_KEYS.length - 1 ? [8, 8, 0, 0] : 0}
                                    maxBarSize={72}
                                    animationDuration={700}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <StatusBreakdown title={t('admin.statistiques.etudiants_by_status', 'Étudiants par statut')} data={etudiantsByStatut} icon={GraduationCap} />
                <StatusBreakdown title={t('admin.statistiques.inscriptions_by_status', 'Inscriptions par statut')} data={inscriptionsByStatut} icon={ClipboardCheck} />
                <StatusBreakdown title={t('admin.statistiques.preinscriptions_by_status', 'Préinscriptions par statut')} data={preinscriptionsByStatut} icon={FileText} />
            </div>

            <div className="mt-5">
                <ChartCard
                    title={t('admin.statistiques.activite_title', 'Activité administrative')}
                    description={t('admin.statistiques.activite_desc', "Actions enregistrées au journal d'activité — 14 derniers jours")}
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={activiteParJour} margin={{ left: -20, right: 10, top: 10 }}>
                            <defs>
                                <linearGradient id="activiteFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-admin-chart-3)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--color-admin-chart-3)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="jour" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--color-admin-text)' }} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name={t('admin.common.actions', 'Actions')}
                                stroke="var(--color-admin-chart-3)"
                                strokeWidth={2}
                                fill="url(#activiteFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </AdminLayout>
    );
}
