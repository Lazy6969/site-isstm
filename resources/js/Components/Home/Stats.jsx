import { GraduationCap, Users, Compass } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

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

function StatBox({ icon, target, label }) {
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

    const Icon = icon;

    return (
        <div ref={ref} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <Icon className="mx-auto h-7 w-7 text-isstm-gold" aria-hidden="true" />
            <p className="mt-2 text-3xl font-bold text-isstm-navy">+{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
    );
}

export default function Stats({ content }) {
    const { t } = useTranslations();
    const items = [
        { icon: GraduationCap, target: Number(content.stat_students ?? 0), label: t('accueil.stat_etudiants', 'Étudiants') },
        { icon: Users, target: Number(content.stat_teachers ?? 0), label: t('accueil.stat_enseignants', 'Enseignants') },
        { icon: Compass, target: Number(content.stat_majors ?? 0), label: t('accueil.stat_filieres', 'Filières') },
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
