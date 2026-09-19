import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';
import EditableIcon from '../QuickEdit/EditableIcon';

function useCountUp(target, active) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) return;
        const duration = 1400;
        const start = performance.now();

        let frame;
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.round(target * (1 - (1 - progress) ** 3)));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, active]);

    return value;
}

function StatBox({ iconKey, iconValue, target, label }) {
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    const value = useCountUp(target, active);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setActive(true);
            },
            { threshold: 0.4 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700" ref={ref}>
            <EditableIcon contentKey={iconKey} value={iconValue} className="mx-auto h-7 w-7 text-isstm-gold" />
            <p className="mt-2 text-3xl font-bold text-isstm-navy dark:text-white">+{value}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

export default function Stats({ content }) {
    const { t } = useTranslations();
    const items = [
        {
            iconKey: 'stat_students_icon',
            iconValue: content.stat_students_icon,
            target: Number(content.stat_students ?? 0),
            label: t('accueil.stat_etudiants', 'Étudiants'),
        },
        {
            iconKey: 'stat_teachers_icon',
            iconValue: content.stat_teachers_icon,
            target: Number(content.stat_teachers ?? 0),
            label: t('accueil.stat_enseignants', 'Enseignants'),
        },
        {
            iconKey: 'stat_majors_icon',
            iconValue: content.stat_majors_icon,
            target: Number(content.stat_majors ?? 0),
            label: t('accueil.stat_filieres', 'Filières'),
        },
    ];

    return (
        <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {items.map((item) => (
                    <StatBox key={item.label} {...item} />
                ))}
            </div>
        </section>
    );
}
