export default function StatCard({ label, value, icon: Icon, hint }) {
    return (
        <div className="group rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-admin-accent/30 hover:shadow-lg hover:shadow-admin-accent/10">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-admin-text-secondary">{label}</p>
                {Icon && (
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-admin-accent/10 text-admin-accent transition-colors duration-300 group-hover:bg-admin-accent group-hover:text-admin-accent-foreground">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                )}
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-admin-text">{value}</p>
            {hint && <p className="mt-1.5 text-xs text-admin-muted">{hint}</p>}
        </div>
    );
}
