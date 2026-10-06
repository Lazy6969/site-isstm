import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, GraduationCap, Layers, UserPlus } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const COLORS = [
    'var(--color-admin-chart-1)',
    'var(--color-admin-chart-2)',
    'var(--color-admin-chart-3)',
    'var(--color-admin-chart-4)',
    'var(--color-admin-chart-5)',
    'var(--color-admin-chart-6)',
];

/** Friendly empty state: says what is missing and offers the way to fix it. */
function EmptyDistribution({ canManage }) {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-accent/25 to-admin-accent/5 text-admin-accent">
                <GraduationCap className="h-8 w-8" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-admin-accent text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                    <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
            </span>
            <div>
                <p className="text-sm font-semibold text-admin-text">{t('admin.dashboard.no_students_in_class', 'Aucun étudiant affecté à une classe.')}</p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-admin-text-secondary">
                    {t('admin.dashboard.distribution_empty_hint', 'Dès que des étudiants seront inscrits dans une classe, leur répartition apparaîtra ici.')}
                </p>
            </div>
            {canManage && (
                <Link
                    href="/console/scolarite/etudiants"
                    className="mt-1 inline-flex items-center gap-2 rounded-lg border border-admin-accent/40 px-3.5 py-2 text-sm font-semibold text-admin-accent transition hover:bg-admin-accent hover:text-admin-accent-foreground"
                >
                    {t('admin.dashboard.shortcut_students', 'Gérer les étudiants')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

/**
 * One card for the two breakdowns of enrolled students — by program and by
 * level — switched by tabs: a stacked share bar, then a ranked list with
 * proportional bars. Same data as before, just easier to read.
 */
export default function StudentDistribution({ byProgram, byLevel, canManage = false }) {
    const { t } = useTranslations();
    const [view, setView] = useState('program');

    const views = {
        program: { label: t('admin.dashboard.by_program_tab', 'Par filière'), icon: BookOpen, rows: byProgram.map((row) => ({ name: row.filiere, total: row.total })) },
        level: { label: t('admin.dashboard.by_level_tab', 'Par niveau'), icon: Layers, rows: byLevel.map((row) => ({ name: row.niveau, total: row.total })) },
    };
    const rows = views[view].rows;
    const total = useMemo(() => rows.reduce((sum, row) => sum + row.total, 0), [rows]);
    const ranked = useMemo(() => [...rows].sort((a, b) => b.total - a.total), [rows]);
    const max = ranked[0]?.total ?? 0;
    const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

    return (
        <div className="admin-card p-5 transition-colors duration-300 hover:border-admin-accent/30">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-admin-text">{t('admin.dashboard.students_distribution', 'Répartition des étudiants')}</h2>
                    <p className="mt-0.5 text-xs text-admin-muted">{t('admin.dashboard.distribution_desc', 'Étudiants affectés à une classe')}</p>
                </div>
                <div className="flex gap-1 rounded-xl bg-admin-hover p-1" role="tablist">
                    {Object.entries(views).map(([key, { label, icon: Icon }]) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={view === key}
                            onClick={() => setView(key)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                view === key ? 'bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25' : 'text-admin-muted hover:text-admin-text'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {ranked.length === 0 ? (
                <EmptyDistribution canManage={canManage} />
            ) : (
                <div key={view} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                    <div className="mb-5 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-4xl font-bold leading-none tracking-tight text-admin-text">{total}</p>
                            <p className="mt-1 text-xs text-admin-muted">{t('admin.dashboard.total', 'Total')}</p>
                        </div>
                        <p className="text-right text-xs text-admin-text-secondary">
                            {ranked.length} {view === 'program' ? t('admin.dashboard.programs_count', 'filière(s)') : t('admin.dashboard.levels_count', 'niveau(x)')}
                        </p>
                    </div>

                    <div className="mb-5 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-admin-hover" role="img" aria-label={t('admin.dashboard.students_distribution', 'Répartition des étudiants')}>
                        {ranked.map((row, index) => (
                            <span
                                key={row.name}
                                title={`${row.name} — ${row.total} (${percent(row.total)}%)`}
                                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                                style={{ width: `${(row.total / total) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }}
                            />
                        ))}
                    </div>

                    <ol className="space-y-3">
                        {ranked.map((row, index) => (
                            <li key={row.name} className="group">
                                <div className="mb-1.5 flex items-center gap-3 text-sm">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold text-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                        {index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate font-medium text-admin-text">{row.name}</span>
                                    <span className="tabular-nums text-admin-text-secondary">{row.total}</span>
                                    <span className="w-10 text-right text-xs font-semibold tabular-nums text-admin-muted">{percent(row.total)}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-admin-hover">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                                        style={{ width: `${max ? (row.total / max) * 100 : 0}%`, backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
