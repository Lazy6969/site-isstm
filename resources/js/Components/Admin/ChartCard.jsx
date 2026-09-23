export default function ChartCard({ title, description, action, children }) {
    return (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-admin-text">{title}</h2>
                    {description && <p className="mt-0.5 text-xs text-admin-muted">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}
