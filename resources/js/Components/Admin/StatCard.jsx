import { useId } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function StatCard({ label, value, icon: Icon, hint, trend }) {
    // Raw useId() values contain colons, which some SVG/CSS contexts don't
    // accept in an id — strip them for a safe url(#...) reference.
    const gradientId = `spark-${useId().replace(/:/g, '')}`;
    const trendData = trend?.map((total, index) => ({ index, total }));
    const hasTrendSignal = trendData?.some((point) => point.total > 0);
    const lastMonth = trend?.at(-1) ?? null;
    const previousMonth = trend && trend.length > 1 ? trend.at(-2) : null;
    const delta = lastMonth !== null && previousMonth !== null ? lastMonth - previousMonth : null;

    return (
        <div className="group rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-admin-accent/30 hover:shadow-lg hover:shadow-admin-accent/10">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-admin-text-secondary">{label}</p>
                {Icon && (
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-admin-accent/10 text-admin-accent transition-colors duration-300 group-hover:bg-admin-accent group-hover:text-admin-accent-foreground">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                )}
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-3xl font-semibold tracking-tight text-admin-text">{value}</p>
                    {hint && <p className="mt-1.5 text-xs text-admin-muted">{hint}</p>}
                    {delta !== null && (
                        <p
                            className={`mt-1.5 text-xs font-medium ${
                                delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-red-500' : 'text-admin-muted'
                            }`}
                        >
                            {delta > 0 ? '+' : ''}
                            {delta} ce mois-ci
                        </p>
                    )}
                </div>

                {hasTrendSignal && (
                    <div className="h-10 w-20 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-admin-accent)" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="var(--color-admin-accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--color-admin-accent)"
                                    strokeWidth={1.5}
                                    fill={`url(#${gradientId})`}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
