export default function SelectField({ label, error, children, className = '', ...props }) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <select
                {...props}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
            >
                {children}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
