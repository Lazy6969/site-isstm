import { useState } from 'react';

export default function OrgNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(false);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    return (
        <div>
            <button
                type="button"
                onClick={() => hasChildren && setOpen((v) => !v)}
                aria-expanded={hasChildren ? open : undefined}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    depth === 0
                        ? 'border-isstm-navy/20 bg-isstm-navy/5 hover:bg-isstm-navy/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                } ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
            >
                <span>
                    <span className="block text-sm font-semibold text-isstm-navy">{node.title}</span>
                    <span className="block text-xs text-slate-500">
                        {node.name}
                        {node.role ? ` · ${node.role}` : ''}
                    </span>
                </span>
                {hasChildren && (
                    <svg
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {hasChildren && open && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-isstm-navy/10 pl-4">
                    {node.children.map((child) => (
                        <OrgNode key={child.title} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
