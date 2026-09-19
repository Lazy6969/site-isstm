import { UserPlus, GraduationCap, ClipboardCheck } from 'lucide-react';

const icons = { preinscription: UserPlus, etudiant: GraduationCap, inscription: ClipboardCheck };

function timeAgo(isoDate) {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
    const steps = [
        [60, 'seconde'],
        [60, 'minute'],
        [24, 'heure'],
        [30, 'jour'],
        [12, 'mois'],
        [Number.POSITIVE_INFINITY, 'an'],
    ];

    let value = seconds;
    let unit = 'seconde';
    for (const [factor, label] of steps) {
        if (value < factor || factor === Number.POSITIVE_INFINITY) {
            unit = label;
            break;
        }
        value = Math.floor(value / factor);
    }

    if (unit === 'seconde' && value < 10) return "à l'instant";

    return `Il y a ${value} ${unit}${value > 1 && unit !== 'mois' ? 's' : ''}`;
}

export default function ActivityList({ items }) {
    if (items.length === 0) {
        return <p className="text-sm text-admin-muted">Aucune activité récente.</p>;
    }

    return (
        <ul className="space-y-4">
            {items.map((item, index) => {
                const Icon = icons[item.type];
                return (
                    <li key={index} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-admin-hover text-admin-text-secondary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm text-admin-text">{item.label}</p>
                            <p className="truncate text-sm text-admin-text-secondary">{item.subject}</p>
                            <p className="text-xs text-admin-muted">{timeAgo(item.created_at)}</p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
