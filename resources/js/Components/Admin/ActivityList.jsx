import { UserPlus, GraduationCap, ClipboardCheck, ChevronRight } from 'lucide-react';
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

export default function ActivityList({ items }) {
    const { t } = useTranslations();
    const timeAgo = useTimeAgo();

    if (items.length === 0) {
        return <p className="text-sm text-admin-muted">{t('admin.time.no_recent_activity', 'Aucune activité récente.')}</p>;
    }

    return (
        <ul className="divide-y divide-admin-border/60">
            {items.map((item, index) => {
                const Icon = icons[item.type];
                return (
                    <li
                        key={index}
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
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-admin-muted" aria-hidden="true" />
                    </li>
                );
            })}
        </ul>
    );
}
