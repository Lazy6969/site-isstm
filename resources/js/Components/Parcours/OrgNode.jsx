import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { categories, roleLabels, titleCategory } from './orgChartData';

/**
 * Recursive, expand/collapse org-chart card. `node.key` is a title_key from
 * orgChartData.js; the actual person (name/photo) for that key comes from
 * `people` (DB-driven, keyed by title_key) and is merged in here at render
 * time — the tree shape itself stays static.
 */
export default function OrgNode({ node, people, t, depth = 0, emphasize = false }) {
    const [open, setOpen] = useState(false);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const person = people?.[node.key];
    const title = t(`parcours.role.${node.key}`, roleLabels[node.key] ?? node.key);
    const name = person?.name ?? '';
    const photo = person?.photo_path;
    const suffix = node.suffixKey ? t(`parcours.role.${node.suffixKey}`, roleLabels[node.suffixKey]) : null;
    const category = titleCategory[node.key] ?? 'parcours';
    const colorClass = categories[category]?.node ?? '';

    return (
        <div>
            <button
                type="button"
                onClick={() => hasChildren && setOpen((v) => !v)}
                aria-expanded={hasChildren ? open : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    emphasize ? 'border-isstm-navy bg-isstm-navy hover:brightness-110' : colorClass
                } ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
            >
                {photo && (
                    <img src={`/${photo}`} alt="" className="h-10 w-10 shrink-0 rounded-full border border-white object-cover dark:border-slate-700" />
                )}
                <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${emphasize ? 'text-white' : 'text-isstm-navy dark:text-white'}`}>{title}</span>
                    <span className={`block truncate text-xs ${emphasize ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {name}
                        {suffix ? ` · ${suffix}` : ''}
                    </span>
                </span>
                {hasChildren && (
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${emphasize ? 'text-white/80' : 'text-slate-400'} ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                )}
            </button>

            {hasChildren && open && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-isstm-navy/10 pl-4 dark:border-white/10">
                    {node.children.map((child) => (
                        <OrgNode key={child.key} node={child} people={people} t={t} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
