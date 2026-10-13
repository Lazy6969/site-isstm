import { useEffect, useState } from 'react';
import { Image as ImageIcon, Shapes, Type, Video } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslations } from '../../lib/useTranslations';

const SEGMENTS = [
    { key: 'text', label: ['admin.contenu.texts', 'Textes'], icon: Type, bar: 'from-admin-accent to-sky-500', dot: 'bg-admin-accent' },
    { key: 'image', label: ['admin.contenu.images', 'Images'], icon: ImageIcon, bar: 'from-emerald-500 to-teal-400', dot: 'bg-emerald-500' },
    { key: 'icon', label: ['admin.contenu.icons', 'Icônes'], icon: Shapes, bar: 'from-amber-500 to-orange-400', dot: 'bg-amber-500' },
    { key: 'video', label: ['admin.contenu.videos', 'Vidéos'], icon: Video, bar: 'from-rose-500 to-pink-400', dot: 'bg-rose-500' },
];

/**
 * One-line "what is the site made of" strip: a single stacked bar whose
 * segments grow in on load, with a legend that doubles as the type filter
 * (same filter as the stat cards next to it).
 */
export default function ContentMixBar({ stats, typeFilter, onSelect, className = '' }) {
    const { t } = useTranslations();
    const [ready, setReady] = useState(false);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setReady(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const total = Math.max(1, SEGMENTS.reduce((sum, segment) => sum + (stats[segment.key] ?? 0), 0));
    const focused = hovered ?? typeFilter;

    return (
        <div className={cn('admin-card flex flex-col justify-center gap-3 p-5', className)}>
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-admin-text">{t('admin.contenu.mix_titre', 'Répartition du contenu')}</p>
                <p className="truncate text-xs text-admin-muted">
                    {focused
                        ? `${Math.round(((stats[focused] ?? 0) / total) * 100)} % · ${stats[focused] ?? 0}`
                        : t('admin.contenu.mix_hint', 'Cliquez un type pour filtrer')}
                </p>
            </div>

            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-admin-hover" role="img" aria-label={t('admin.contenu.mix_titre', 'Répartition du contenu')}>
                {SEGMENTS.map((segment, index) => {
                    const value = stats[segment.key] ?? 0;
                    if (value === 0) return null;

                    return (
                        <button
                            key={segment.key}
                            type="button"
                            tabIndex={-1}
                            onClick={() => onSelect(segment.key)}
                            onMouseEnter={() => setHovered(segment.key)}
                            onMouseLeave={() => setHovered(null)}
                            className={cn(
                                'h-full bg-gradient-to-r transition-all duration-1000 ease-out first:rounded-l-full last:rounded-r-full',
                                segment.bar,
                                focused && focused !== segment.key ? 'opacity-30' : 'opacity-100',
                            )}
                            style={{ width: ready ? `${(value / total) * 100}%` : '0%', transitionDelay: `${index * 120}ms` }}
                        />
                    );
                })}
            </div>

            <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {SEGMENTS.map((segment) => {
                    const Icon = segment.icon;
                    const active = typeFilter === segment.key;

                    return (
                        <li key={segment.key}>
                            <button
                                type="button"
                                onClick={() => onSelect(segment.key)}
                                onMouseEnter={() => setHovered(segment.key)}
                                onMouseLeave={() => setHovered(null)}
                                aria-pressed={active}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs transition',
                                    active ? 'bg-admin-accent/10 font-semibold text-admin-text' : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text',
                                )}
                            >
                                <span className={cn('h-2 w-2 rounded-full', segment.dot)} aria-hidden="true" />
                                <Icon className="h-3 w-3" aria-hidden="true" />
                                {t(...segment.label)}
                                <span className="font-semibold tabular-nums text-admin-text">{stats[segment.key] ?? 0}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
