export default function ChartCard({ title, description, action, children, className = '' }) {
    return (
        <div className={`admin-card p-5 transition-colors duration-300 hover:border-admin-accent/30 ${className}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-admin-text">{title}</h2>
                    {description && <p className="mt-0.5 text-xs text-admin-muted">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}
