export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-admin-border bg-admin-card py-14 text-center">
            {Icon && <Icon className="h-6 w-6 text-admin-muted" aria-hidden="true" />}
            {title && <p className="text-sm font-medium text-admin-text">{title}</p>}
            {description && <p className="max-w-sm text-sm text-admin-text-secondary">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
