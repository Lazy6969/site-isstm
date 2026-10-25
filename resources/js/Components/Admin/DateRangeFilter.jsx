import { CalendarRange } from 'lucide-react';
import DateField from './DateField';
import { isoDay } from '../../lib/dateRange';
import { useTranslations } from '../../lib/useTranslations';

const selectClass =
    'h-9 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

/**
 * "Du … au …" calendar filter with quick presets, driven by useDateRange().
 * `label` names what the date is (e.g. "Déposée le").
 */
export default function DateRangeFilter({ range, label, className = '' }) {
    const { t } = useTranslations();
    const presets = [
        [t('admin.dates.today', "Aujourd'hui"), () => [isoDay(0), isoDay(0)]],
        [t('admin.dates.last7', '7 jours'), () => [isoDay(-6), isoDay(0)]],
        [t('admin.dates.last30', '30 jours'), () => [isoDay(-29), isoDay(0)]],
    ];

    function apply(from, to) {
        range.setFrom(from);
        range.setTo(to);
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="flex items-center gap-1.5 text-xs font-medium text-admin-text-secondary">
                <CalendarRange className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                {label ?? t('admin.dates.period', 'Période')}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-admin-muted">
                {t('admin.dates.from', 'Du')}
                <DateField value={range.from} max={range.to || undefined} onChange={(e) => range.setFrom(e.target.value)} className={selectClass} />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-admin-muted">
                {t('admin.dates.to', 'au')}
                <DateField value={range.to} min={range.from || undefined} onChange={(e) => range.setTo(e.target.value)} className={selectClass} />
            </label>
            <div className="flex items-center gap-1">
                {presets.map(([text, compute]) => (
                    <button
                        key={text}
                        type="button"
                        onClick={() => apply(...compute())}
                        className="h-8 rounded-full border border-admin-border px-3 text-xs font-medium text-admin-text-secondary transition hover:border-admin-accent/50 hover:text-admin-accent"
                    >
                        {text}
                    </button>
                ))}
                {range.active && (
                    <button type="button" onClick={range.reset} className="h-8 rounded-full px-3 text-xs font-medium text-admin-accent hover:bg-admin-hover">
                        {t('admin.dates.reset', 'Effacer')}
                    </button>
                )}
            </div>
        </div>
    );
}
