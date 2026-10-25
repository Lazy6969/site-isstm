import { useId } from 'react';
import { Activity, ArrowDown, ArrowUp, Flame, Globe } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useTranslations } from '../../lib/useTranslations';

const tooltipStyle = {
    backgroundColor: 'var(--color-admin-card)',
    borderColor: 'var(--color-admin-border)',
    borderRadius: 8,
    fontSize: 12,
    color: 'var(--color-admin-text)',
};

function Chip({ label, value }) {
    return (
        <div className="rounded-xl border border-admin-border bg-admin-hover/40 px-3 py-2">
            <p className="text-[11px] text-admin-muted">{label}</p>
            <p className="text-lg font-semibold tabular-nums text-admin-text">{value}</p>
        </div>
    );
}

/**
 * Live-looking traffic panel for the dashboard: the last 14 days of real page
 * views as an area chart, the week-over-week change, today/yesterday/best day,
 * and the most visited pages. Everything comes from the page-view log.
 */
export default function SiteTrafficCard({ trafic }) {
    const { t } = useTranslations();
    const gradientId = `traffic-${useId().replace(/:/g, '')}`;
    const { jours, aujourdhui, hier, sept_jours: week, sept_jours_precedents: previousWeek, pages } = trafic;
    const best = jours.reduce((max, day) => (day.total > max.total ? day : max), jours[0]);
    const delta = previousWeek > 0 ? Math.round(((week - previousWeek) / previousWeek) * 100) : null;
    const up = delta === null || delta >= 0;
    const maxPage = Math.max(1, ...pages.map((page) => page.total));

    return (
        <div className="group admin-card relative overflow-hidden p-5 sm:col-span-2 xl:col-span-3">
            <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-admin-accent/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" aria-hidden="true" />

            <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                        <Activity className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-admin-text">
                            {t('admin.dashboard.traffic_title', 'Fréquentation du site')}
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                        </p>
                        <p className="text-xs text-admin-muted">{t('admin.dashboard.traffic_subtitle', '14 derniers jours — visites réelles du site public')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-semibold tracking-tight tabular-nums text-admin-text">{week}</p>
                    <p className="flex items-center justify-end gap-1 text-xs">
                        {delta !== null && (
                            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${up ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                                {up ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                                {Math.abs(delta)}%
                            </span>
                        )}
                        <span className="text-admin-muted">{t('admin.dashboard.traffic_week', 'visites sur 7 jours')}</span>
                    </p>
                </div>
            </div>

            <div className="relative mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={jours} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-admin-chart-1)" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="var(--color-admin-chart-1)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="jour" hide />
                                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--color-admin-text)' }} formatter={(value) => [value, t('admin.dashboard.traffic_visits', 'Visites')]} />
                                <Area type="monotone" dataKey="total" stroke="var(--color-admin-chart-1)" strokeWidth={2.5} fill={`url(#${gradientId})`} animationDuration={900} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <Chip label={t('admin.dashboard.traffic_today', "Aujourd'hui")} value={aujourdhui} />
                        <Chip label={t('admin.dashboard.traffic_yesterday', 'Hier')} value={hier} />
                        <div className="rounded-xl border border-admin-border bg-admin-hover/40 px-3 py-2">
                            <p className="flex items-center gap-1 text-[11px] text-admin-muted">
                                <Flame className="h-3 w-3 text-amber-500" aria-hidden="true" />
                                {t('admin.dashboard.traffic_best', 'Meilleur jour')}
                            </p>
                            <p className="text-lg font-semibold tabular-nums text-admin-text">
                                {best.total} <span className="text-xs font-normal text-admin-muted">{best.total > 0 ? best.jour : ''}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-admin-border bg-admin-hover/30 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-admin-text-secondary">
                        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('admin.dashboard.traffic_top_pages', 'Pages les plus vues (7 j)')}
                    </p>
                    {pages.length === 0 ? (
                        <p className="py-4 text-center text-xs text-admin-muted">{t('admin.dashboard.traffic_empty', 'Aucune visite enregistrée.')}</p>
                    ) : (
                        <ul className="space-y-2">
                            {pages.map((page) => (
                                <li key={page.path}>
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <span className="truncate text-admin-text" title={page.path}>{page.path}</span>
                                        <span className="font-semibold tabular-nums text-admin-text-secondary">{page.total}</span>
                                    </div>
                                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-admin-border/60">
                                        <div className="h-full rounded-full bg-gradient-to-r from-admin-accent to-admin-accent/60 transition-all duration-700" style={{ width: `${Math.max(6, (page.total / maxPage) * 100)}%` }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
