export default function FileInput({ id, label, file, existingLabel, onChange, error, required = true }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <label
                htmlFor={id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700/60"
            >
                <span className="rounded-md bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white">Choisir un fichier</span>
                <span className="min-w-0 flex-1 truncate text-right text-xs text-slate-500 dark:text-slate-400">
                    {file ? file.name : existingLabel ? existingLabel : 'Aucun fichier n’a été sélectionné'}
                </span>
                <input id={id} name={id} type="file" accept="image/*,.pdf" onChange={onChange} className="sr-only" />
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
