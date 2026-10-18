import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CATEGORY_ICONS, STATUT_STYLES } from '../../lib/materiel';

export const inputClass =
    'h-10 w-full rounded-xl border border-admin-border bg-admin-bg/50 px-3 text-sm text-admin-text outline-none transition placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10 disabled:opacity-60';

export function useCountUp(target, duration = 900) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || target === 0) {
            setValue(target);
            return undefined;
        }
        let frame;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

export function StatusBadge({ statut, className }) {
    const style = STATUT_STYLES[statut] ?? STATUT_STYLES.disponible;

    return (
        <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', style.badge, className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
            {style.label}
        </span>
    );
}

export function CategoryIcon({ categorie, className = 'h-5 w-5' }) {
    const Icon = CATEGORY_ICONS[categorie] ?? CATEGORY_ICONS.autre;

    return <Icon className={className} aria-hidden="true" />;
}

/** Photo of an item, or a tinted tile with its category icon. */
export function Thumb({ materiel, className = 'h-12 w-12', iconClass = 'h-6 w-6' }) {
    return materiel.photo_path ? (
        <img src={`/${materiel.photo_path}`} alt="" className={cn('flex-shrink-0 rounded-xl object-cover', className)} />
    ) : (
        <span className={cn('flex flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent/15 to-sky-500/15 text-admin-accent', className)}>
            <CategoryIcon categorie={materiel.categorie} className={iconClass} />
        </span>
    );
}

export function StatCard({ icon: Icon, label, value, tone, glow, suffix = '', onClick, active = false }) {
    const display = useCountUp(value);
    const Wrapper = onClick ? 'button' : 'div';

    return (
        <Wrapper
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            aria-pressed={onClick ? active : undefined}
            className={cn(
                'group relative overflow-hidden rounded-2xl border bg-admin-card p-4 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg',
                active ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border',
                onClick && 'w-full cursor-pointer',
            )}
        >
            <span className={cn('pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl transition group-hover:scale-125', glow)} />
            <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-admin-text-secondary">{label}</p>
                    <p className="mt-1 truncate text-2xl font-bold tabular-nums text-admin-text">
                        {display.toLocaleString('fr-FR')}
                        {suffix && <span className="ml-1 text-sm font-semibold text-admin-text-secondary">{suffix}</span>}
                    </p>
                </div>
                <span className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition group-hover:rotate-6', tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
        </Wrapper>
    );
}

/** Gradient banner at the top of each page. */
export function PageHero({ icon: Icon, title, subtitle, children }) {
    return (
        <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-admin-accent via-admin-accent/90 to-sky-500 p-5 text-white shadow-lg shadow-admin-accent/20 sm:p-6">
            <span className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                        <Icon className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
                        {subtitle && <p className="mt-0.5 max-w-2xl text-sm text-white/85">{subtitle}</p>}
                    </div>
                </div>
                {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
            </div>
        </div>
    );
}

export function HeroButton({ icon: Icon, children, onClick, href }) {
    const className = 'flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/30';
    const content = (
        <>
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {children}
        </>
    );

    return href ? (
        <a href={href} className={className}>
            {content}
        </a>
    ) : (
        <button type="button" onClick={onClick} className={className}>
            {content}
        </button>
    );
}

export function EmptyState({ icon: Icon, title, hint }) {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-admin-border bg-admin-card px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-accent/10 text-admin-accent">
                <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold text-admin-text">{title}</p>
            {hint && <p className="mt-1 max-w-sm text-xs text-admin-muted">{hint}</p>}
        </div>
    );
}

export function Field({ label, error, hint, children, className }) {
    return (
        <div className={className}>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-[11px] text-admin-muted">{hint}</p>}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

/** Red box listing the server's refusals (an action the equipment's statut doesn't allow, validation errors…). */
export function ErrorBanner({ errors }) {
    const messages = Object.values(errors ?? {}).filter(Boolean);
    if (messages.length === 0) return null;

    return (
        <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <ul className="space-y-0.5">
                {messages.map((message) => (
                    <li key={message}>{message}</li>
                ))}
            </ul>
        </div>
    );
}

export function Tabs({ tabs, value, onChange }) {
    return (
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-admin-border bg-admin-card p-1 shadow-sm" role="tablist">
            {tabs.map(([key, label, count]) => (
                <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={value === key}
                    onClick={() => onChange(key)}
                    className={cn(
                        'flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300',
                        value === key ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text',
                    )}
                >
                    {label}
                    {count !== undefined && <span className={cn('rounded-full px-2 py-0.5 text-[11px] tabular-nums', value === key ? 'bg-white/25' : 'bg-admin-hover')}>{count}</span>}
                </button>
            ))}
        </div>
    );
}

export function PrimaryButton({ children, icon: Icon, className, ...props }) {
    return (
        <button
            {...props}
            className={cn(
                'flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-admin-accent to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50',
                className,
            )}
        >
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {children}
        </button>
    );
}

export function GhostButton({ children, icon: Icon, className, ...props }) {
    return (
        <button {...props} className={cn('flex items-center justify-center gap-2 rounded-full border border-admin-border bg-admin-card px-4 py-2 text-sm font-semibold text-admin-text-secondary transition hover:bg-admin-hover disabled:opacity-50', className)}>
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {children}
        </button>
    );
}
