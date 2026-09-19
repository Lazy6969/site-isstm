export default function ChartCard({ title, description, action, children }) {
    return (
        <div className="rounded-xl border border-admin-border bg-admin-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-admin-text">{title}</h2>
                    {description && <p className="text-xs text-admin-muted">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}
