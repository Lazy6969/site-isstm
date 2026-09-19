export default function StatCard({ label, value, icon: Icon, hint }) {
    return (
        <div className="rounded-xl border border-admin-border bg-admin-card p-5 transition hover:border-admin-text/20">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-admin-text-secondary">{label}</p>
                {Icon && <Icon className="h-[18px] w-[18px] text-admin-muted" aria-hidden="true" />}
            </div>
            <p className="mt-2 text-2xl font-semibold text-admin-text">{value}</p>
            {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
        </div>
    );
}
