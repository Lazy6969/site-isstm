import { ChevronDown, Pencil } from 'lucide-react';
import { useState } from 'react';
import { categories, roleLabels, titleCategory } from './orgChartData';
import EditTextDialog from '../QuickEdit/EditTextDialog';

/**
 * Recursive, expand/collapse org-chart card. `node.key` is a title_key from
 * orgChartData.js; the actual person (name/photo) for that key comes from
 * `people` (DB-driven, keyed by title_key) and is merged in here at render
 * time — the tree shape itself stays static. `onEditPerson` (only called when
 * a real OrgPerson row already backs this node — see Parcours.jsx) opens the
 * in-place edit dialog for that person.
 *
 * The role title itself (e.g. "Directeur") is separately admin-editable via
 * `content`/`contentStyles` (SiteContent key `parcours_role_<node.key>`) —
 * it can't reuse EditableText's own built-in pencil here, since that renders
 * the pencil as a nested <button>, and the title already sits inside this
 * card's own expand/collapse <button>; nesting buttons is invalid HTML and
 * would make the two click targets fight each other. Styled as a standalone
 * trigger instead, positioned opposite the existing person-edit pencil.
 */
export default function OrgNode({ node, people, t, content = {}, contentStyles = {}, depth = 0, emphasize = false, canEdit = false, onEditPerson }) {
    const [open, setOpen] = useState(false);
    const [editingTitleKey, setEditingTitleKey] = useState(null);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    function roleLabel(key) {
        return content[`parcours_role_${key}`] ?? t(`parcours.role.${key}`, roleLabels[key] ?? key);
    }

    const person = people?.[node.key];
    const title = roleLabel(node.key);
    const name = person?.name ?? '';
    const photo = person?.photo_path;
    const suffix = node.suffixKey ? roleLabel(node.suffixKey) : null;
    const category = titleCategory[node.key] ?? 'parcours';
    const colorClass = categories[category]?.node ?? '';
    const editingTitleValue = editingTitleKey ? roleLabel(editingTitleKey) : '';

    return (
        <div>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => hasChildren && setOpen((v) => !v)}
                    aria-expanded={hasChildren ? open : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        emphasize ? 'border-isstm-navy bg-isstm-navy hover:brightness-110' : colorClass
                    } ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
                >
                    {photo && (
                        <img
                            src={`/${photo}`}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full border border-white object-cover dark:border-slate-700"
                        />
                    )}
                    <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${emphasize ? 'text-white' : 'text-isstm-navy dark:text-white'}`}>
                            {title}
                        </span>
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
                {canEdit && person?.id && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditPerson(person, title);
                        }}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                        aria-label={`Modifier ${title}`}
                    >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                    </button>
                )}
                {canEdit && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleKey(node.key);
                        }}
                        className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                        aria-label={`Modifier l'intitulé « ${title} »`}
                        title="Modifier l'intitulé de ce poste"
                    >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                    </button>
                )}
            </div>

            {hasChildren && open && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-isstm-navy/10 pl-4 dark:border-white/10">
                    {node.children.map((child) => (
                        <OrgNode
                            key={child.key}
                            node={child}
                            people={people}
                            t={t}
                            content={content}
                            contentStyles={contentStyles}
                            depth={depth + 1}
                            canEdit={canEdit}
                            onEditPerson={onEditPerson}
                        />
                    ))}
                </div>
            )}

            {editingTitleKey && (
                <EditTextDialog
                    open={editingTitleKey !== null}
                    onClose={() => setEditingTitleKey(null)}
                    contentKey={`parcours_role_${editingTitleKey}`}
                    initialValue={editingTitleValue}
                    initialStyle={contentStyles[`parcours_role_${editingTitleKey}`]}
                />
            )}
        </div>
    );
}
