import { useState } from 'react';
import { ChevronDown, ClipboardCheck, GraduationCap, RotateCcw, UserPlus, X } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const icons = { preinscription: UserPlus, etudiant: GraduationCap, inscription: ClipboardCheck };

function useTimeAgo() {
    const { t, locale } = useTranslations();

    return function timeAgo(isoDate) {
        const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
        const steps = [
            [60, 'second'],
            [60, 'minute'],
            [24, 'hour'],
            [30, 'day'],
            [12, 'month'],
            [Number.POSITIVE_INFINITY, 'year'],
        ];

        let value = seconds;
        let unit = 'second';
        for (const [factor, label] of steps) {
            if (value < factor || factor === Number.POSITIVE_INFINITY) {
                unit = label;
                break;
            }
            value = Math.floor(value / factor);
        }

        if (unit === 'second' && value < 10) return t('admin.time.just_now', "à l'instant");

        const unitLabel = t(`admin.time.${unit}`, unit);
        // French/Malagasy pluralize by suffixing 's' (except invariant nouns like "mois"); English always does.
        const plural = value > 1 && !(locale === 'fr' && unit === 'month') ? 's' : '';
        const before = t('admin.time.ago_before', 'Il y a ');
        const after = t('admin.time.ago_after', '');

        return `${before}${value} ${unitLabel}${plural}${after}`;
    };
}

/**
 * The recent-activity feed. It opens on the latest few entries and expands on
 * demand, so the dashboard stays short. When `onDismiss` is given, each entry
 * has a cross to remove it from this account's feed (the dossier it came from
 * is never touched), and `onRestore` brings back everything that was removed.
 */
export default function ActivityList({ items, onDismiss, hiddenCount = 0, onRestore, collapsedCount = 3 }) {
    const { t } = useTranslations();
    const timeAgo = useTimeAgo();
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? items : items.slice(0, collapsedCount);
    const extra = items.length - collapsedCount;

    const restoreLink =
        onRestore && hiddenCount > 0 ? (
            <button
                type="button"
                onClick={onRestore}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-admin-muted transition hover:text-admin-accent"
            >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.dashboard.restore_activities', 'Réafficher les activités masquées')} ({hiddenCount})
            </button>
        ) : null;

    if (items.length === 0) {
        return (
            <div>
                <p className="text-sm text-admin-muted">{t('admin.time.no_recent_activity', 'Aucune activité récente.')}</p>
                {restoreLink}
            </div>
        );
    }

    return (
        <div>
            <ul className="divide-y divide-admin-border/60">
                {visible.map((item, index) => {
                    const Icon = icons[item.type];
                    return (
                        <li
                            key={item.key ?? index}
                            className="group flex items-center gap-3 px-1 py-3 transition-colors duration-200 hover:bg-admin-hover/60"
                        >
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-admin-accent text-admin-accent-foreground">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-admin-text">{item.label}</p>
                                <p className="truncate text-sm text-admin-text-secondary">{item.subject}</p>
                                <p className="text-xs text-admin-muted">{timeAgo(item.created_at)}</p>
                            </div>
                            {onDismiss && (
                                <button
                                    type="button"
                                    onClick={() => onDismiss(item)}
                                    aria-label={`${t('admin.dashboard.dismiss_activity', 'Retirer cette activité')} — ${item.subject}`}
                                    title={t('admin.dashboard.dismiss_activity', 'Retirer cette activité')}
                                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-admin-muted transition hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            {extra > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm font-medium text-admin-text-secondary transition hover:border-admin-accent/50 hover:bg-admin-hover hover:text-admin-text"
                >
                    {expanded ? t('admin.dashboard.activity_show_less', 'Voir moins') : `${t('admin.dashboard.activity_show_more', 'En savoir plus')} (${extra})`}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
            )}

            {restoreLink}
        </div>
    );
}
