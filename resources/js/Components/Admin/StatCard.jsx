import { useId } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTranslations } from '../../lib/useTranslations';

export default function StatCard({ label, value, icon: Icon, hint, trend, onClick, active = false }) {
    const { t } = useTranslations();
    // Raw useId() values contain colons, which some SVG/CSS contexts don't
    // accept in an id — strip them for a safe url(#...) reference.
    const gradientId = `spark-${useId().replace(/:/g, '')}`;
    const trendData = trend?.map((total, index) => ({ index, total }));
    const hasTrendSignal = trendData?.some((point) => point.total > 0);
    const lastMonth = trend?.at(-1) ?? null;
    const previousMonth = trend && trend.length > 1 ? trend.at(-2) : null;
    const delta = lastMonth !== null && previousMonth !== null ? lastMonth - previousMonth : null;
    const Wrapper = onClick ? 'button' : 'div';

    return (
        <Wrapper
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`group admin-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg hover:shadow-admin-accent/10 ${
                active ? '!border-admin-accent ring-1 ring-admin-accent/40' : ''
            } ${onClick ? 'w-full cursor-pointer' : ''}`}
        >
            <div className="flex items-start gap-4">
                {Icon && (
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-admin-text">{label}</p>
                    <div className="flex items-end justify-between gap-2">
                        <p className="text-3xl font-semibold tracking-tight text-admin-text">{value}</p>
                        {hasTrendSignal && (
                            <div className="h-10 w-20 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                                        <defs>
                                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-admin-accent)" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="var(--color-admin-accent)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="var(--color-admin-accent)"
                                            strokeWidth={1.75}
                                            fill={`url(#${gradientId})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                    {delta !== null && (
                        <p
                            className={`mt-0.5 flex items-center gap-1 text-xs font-semibold ${
                                delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-400' : 'text-admin-muted'
                            }`}
                        >
                            {delta > 0 && <ArrowUp className="h-3 w-3" aria-hidden="true" />}
                            {delta < 0 && <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                            {delta > 0 ? '+' : ''}
                            {delta} {t('admin.dashboard.this_month', 'ce mois-ci')}
                        </p>
                    )}
                    {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
                </div>
            </div>
        </Wrapper>
    );
}
