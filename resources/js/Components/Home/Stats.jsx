import { useEffect, useRef, useState } from 'react';

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

    return (
        <div ref={ref} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <p className="mt-2 text-3xl font-bold text-isstm-navy">+{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
    );
}

export default function Stats({ content }) {
    const items = [
        { icon: '🎓', target: Number(content.stat_students ?? 0), label: 'Étudiants' },
        { icon: '👨‍🏫', target: Number(content.stat_teachers ?? 0), label: 'Enseignants' },
        { icon: '🧭', target: Number(content.stat_majors ?? 0), label: 'Filières' },
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
