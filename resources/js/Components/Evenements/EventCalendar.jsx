import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { CATEGORY_META } from './categoryMeta';
import { useTranslations } from '../../lib/useTranslations';

const WEEKDAY_KEYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

function dayKey(date) {
    return date.toISOString().slice(0, 10);
}

function startOfMonth(base) {
    return new Date(base.getFullYear(), base.getMonth(), 1);
}

/**
 * Month-grid calendar for events — the same "click a day to see what's on
 * it" concept as the legacy site's calendar, rebuilt as a React component
 * over a fixed prev-month..+11-months window the controller already sends.
 */
export default function EventCalendar({ evenements }) {
    const { t } = useTranslations();
    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);

    const today = useMemo(() => new Date(), []);
    const todayKey = dayKey(today);

    const eventsByDay = useMemo(() => {
        const map = new Map();
        for (const event of evenements) {
            const key = event.date_debut.slice(0, 10);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(event);
        }
        return map;
    }, [evenements]);

    const visibleMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const monthLabel = visibleMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const firstOfMonth = startOfMonth(visibleMonth);
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first week

    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d));
    }

    const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <button
                    type="button"
                    onClick={() => setMonthOffset((v) => Math.max(v - 1, -1))}
                    disabled={monthOffset <= -1}
                    aria-label={t('evenements.mois_precedent', 'Mois précédent')}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="text-sm font-semibold text-isstm-navy capitalize dark:text-white">{monthLabel}</span>
                <button
                    type="button"
                    onClick={() => setMonthOffset((v) => Math.min(v + 1, 11))}
                    disabled={monthOffset >= 11}
                    aria-label={t('evenements.mois_suivant', 'Mois suivant')}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 px-4 pt-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {WEEKDAY_KEYS.map((key) => (
                    <span key={key}>{t(`evenements.jour_${key}`, key.slice(0, 3))}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 p-4 pt-1.5">
                {cells.map((date, index) => {
                    if (!date) return <span key={`blank-${index}`} />;

                    const key = dayKey(date);
                    const dayEvents = eventsByDay.get(key) ?? [];
                    const hasEvents = dayEvents.length > 0;
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDay;

                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={!hasEvents}
                            onClick={() => setSelectedDay(isSelected ? null : key)}
                            className={`flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition ${
                                isSelected
                                    ? 'bg-isstm-navy text-white'
                                    : isToday
                                      ? 'bg-isstm-gold/15 font-semibold text-isstm-navy dark:text-isstm-gold'
                                      : hasEvents
                                        ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                                        : 'cursor-default text-slate-300 dark:text-slate-600'
                            }`}
                        >
                            {date.getDate()}
                            {hasEvents && (
                                <span className="flex gap-0.5">
                                    {dayEvents.slice(0, 3).map((event) => (
                                        <span
                                            key={event.id}
                                            className="h-1 w-1 rounded-full"
                                            style={{
                                                backgroundColor: isSelected ? '#fff' : (CATEGORY_META[event.categorie]?.color ?? '#003366'),
                                            }}
                                        />
                                    ))}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedEvents.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-700">
                    {selectedEvents.map((event) => {
                        const meta = CATEGORY_META[event.categorie] ?? CATEGORY_META.general;
                        const Icon = meta.icon;

                        return (
                            <div key={event.id} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                <span
                                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white"
                                    style={{ backgroundColor: meta.color }}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-isstm-navy dark:text-white">{event.titre}</h4>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                        {new Date(event.date_debut).toLocaleString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    {event.lieu && (
                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                            {event.lieu}
                                        </p>
                                    )}
                                    {event.description && (
                                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
