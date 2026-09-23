import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MapPin, CalendarDays } from 'lucide-react';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_LABEL = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function EventsCalendar({ evenements }) {
    const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
    const today = new Date();

    const eventsByDay = useMemo(() => {
        const map = new Map();
        evenements.forEach((event) => {
            const key = new Date(event.date_debut).toDateString();
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(event);
        });
        return map;
    }, [evenements]);

    const gridDays = useMemo(() => {
        const first = startOfMonth(monthCursor);
        const firstWeekday = (first.getDay() + 6) % 7; // Monday = 0
        const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
        const cells = Array.from({ length: firstWeekday }, () => null);
        for (let day = 1; day <= daysInMonth; day++) {
            cells.push(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day));
        }
        return cells;
    }, [monthCursor]);

    const upcoming = useMemo(
        () => [...evenements].sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut)).slice(0, 4),
        [evenements],
    );

    function changeMonth(delta) {
        setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    }

    return (
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px]">
                <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-isstm-navy dark:text-white">
                            <CalendarDays className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                            Calendrier des événements
                        </h2>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => changeMonth(-1)}
                                aria-label="Mois précédent"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-isstm-navy dark:hover:bg-slate-700 dark:hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="w-28 text-center text-xs font-medium text-slate-600 capitalize dark:text-slate-300">
                                {MONTH_LABEL.format(monthCursor)}
                            </span>
                            <button
                                type="button"
                                onClick={() => changeMonth(1)}
                                aria-label="Mois suivant"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-isstm-navy dark:hover:bg-slate-700 dark:hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {WEEKDAYS.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {gridDays.map((date, index) => {
                            if (!date) return <span key={`empty-${index}`} />;
                            const dayEvents = eventsByDay.get(date.toDateString()) ?? [];
                            const isToday = sameDay(date, today);
                            return (
                                <div
                                    key={date.toISOString()}
                                    title={dayEvents.map((event) => event.titre).join(', ')}
                                    className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition ${
                                        isToday
                                            ? 'bg-isstm-navy font-semibold text-white'
                                            : dayEvents.length > 0
                                              ? 'bg-isstm-gold/10 text-isstm-navy dark:text-white'
                                              : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    {date.getDate()}
                                    {dayEvents.length > 0 && (
                                        <span
                                            className={`mt-0.5 h-1 w-1 rounded-full ${isToday ? 'bg-white' : 'bg-isstm-gold'}`}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-slate-100 p-5 md:border-t-0 md:border-l dark:border-slate-700">
                    <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">À venir</h3>
                    {upcoming.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500">Aucun événement programmé.</p>
                    ) : (
                        <ul className="space-y-3">
                            {upcoming.map((event) => (
                                <li key={event.id} className="text-sm">
                                    <p className="font-medium text-isstm-navy dark:text-white">{event.titre}</p>
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span>
                                            {new Date(event.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                        {event.lieu && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                                {event.lieu}
                                            </span>
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link
                        href="/evenements"
                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-isstm-navy hover:underline dark:text-isstm-gold"
                    >
                        Voir tous les événements →
                    </Link>
                </div>
            </div>
        </div>
    );
}
