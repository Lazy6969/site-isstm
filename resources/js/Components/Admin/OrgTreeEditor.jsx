import { useMemo, useState } from 'react';
import { ArrowDown, ChevronDown, ChevronsDownUp, ChevronsUpDown, Landmark, Network, Pencil, Shield, UserRound, Workflow } from 'lucide-react';
import { administrativePole, categories, directionGrid, pedagogicalPole, titleCategory } from '../Parcours/orgChartData';
import { useTranslations } from '../../lib/useTranslations';

/** Every title_key reachable in a (sub)tree, the root included. */
function keysOf(node) {
    return [node.key, ...(node.children ?? []).flatMap(keysOf)];
}

/** Keys of the nodes that have children — the ones that can fold. */
function branchKeysOf(node) {
    return [...(node.children?.length ? [node.key] : []), ...(node.children ?? []).flatMap(branchKeysOf)];
}

const GOVERNANCE = ['conseil_etablissement', 'directeur'];
const TREE_KEYS = new Set([...GOVERNANCE, ...directionGrid, ...keysOf(pedagogicalPole), ...keysOf(administrativePole)]);
const BRANCH_KEYS = [...branchKeysOf(pedagogicalPole), ...branchKeysOf(administrativePole)];

function Section({ icon: Icon, title, hint, children }) {
    return (
        <section>
            <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-sm font-semibold text-admin-text">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-accent/15 text-admin-accent">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {title}
                {hint && <span className="text-xs font-normal text-admin-muted">{hint}</span>}
            </h2>
            {children}
        </section>
    );
}

/**
 * The org chart laid out like the public Parcours page — governance, the
 * services attached to the direction, then the pedagogical and administrative
 * poles as trees — so each position is edited where it sits in the hierarchy.
 * The shape comes from the same file the public page reads, so the two can't
 * drift apart. Clicking a card selects that person for the side panel.
 */
export default function OrgTreeEditor({ people, labelOf, search, selectedId, onSelect }) {
    const { t } = useTranslations();
    const [closed, setClosed] = useState(() => new Set());
    const [onlyNoPhoto, setOnlyNoPhoto] = useState(false);

    const term = search.trim().toLowerCase();
    const filtering = term !== '' || onlyNoPhoto;
    const chefSuffix = labelOf('chef_de_parcours');

    const matches = (key) => {
        const person = people[key];
        if (!person) return false;
        if (onlyNoPhoto && person.photo_path) return false;
        if (!term) return true;
        return `${person.name} ${labelOf(key)}`.toLowerCase().includes(term);
    };
    const subtreeVisible = (node) => matches(node.key) || (node.children ?? []).some(subtreeVisible);

    const missingPhoto = useMemo(() => Object.values(people).filter((person) => !person.photo_path).length, [people]);
    const others = Object.keys(people).filter((key) => !TREE_KEYS.has(key) && key !== 'chef_de_parcours');

    function toggle(key) {
        setClosed((previous) => {
            const next = new Set(previous);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    function renderNode(node) {
        if (filtering && !subtreeVisible(node)) return null;

        const person = people[node.key];
        if (!person) return null;

        const children = node.children ?? [];
        const hasChildren = children.length > 0;
        const open = filtering || !closed.has(node.key);
        const swatch = categories[titleCategory[node.key] ?? 'parcours']?.swatch ?? 'bg-slate-400';
        const selected = selectedId === person.id;
        const dimmed = filtering && !matches(node.key);
        const suffix = node.suffixKey ? labelOf(node.suffixKey) : null;

        return (
            <div key={node.key}>
                <div
                    className={`group admin-card flex items-center gap-1 !p-1.5 transition-all duration-200 ${
                        selected ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
                    } ${dimmed ? 'opacity-60' : ''}`}
                >
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => toggle(node.key)}
                            disabled={filtering}
                            aria-expanded={open}
                            aria-label={`${open ? t('admin.organigramme.collapse', 'Replier') : t('admin.organigramme.expand', 'Déplier')} — ${labelOf(node.key)}`}
                            className="flex h-9 w-7 flex-shrink-0 items-center justify-center rounded-lg text-admin-muted transition hover:bg-admin-hover hover:text-admin-text disabled:opacity-40"
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
                        </button>
                    ) : (
                        <span className="w-1.5 flex-shrink-0" aria-hidden="true" />
                    )}

                    <button type="button" onClick={() => onSelect(person)} aria-pressed={selected} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left">
                        <span className={`h-9 w-1 flex-shrink-0 rounded-full ${swatch}`} aria-hidden="true" />
                        {person.photo_path ? (
                            <img src={`/${person.photo_path}`} alt="" className="h-11 w-11 flex-shrink-0 rounded-full border-2 border-admin-accent/30 object-cover" />
                        ) : (
                            <span
                                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-amber-500/50 bg-amber-500/10 text-amber-500"
                                title={t('admin.organigramme.no_photo_filter', 'Sans photo')}
                            >
                                <UserRound className="h-5 w-5" aria-hidden="true" />
                            </span>
                        )}
                        <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-xs font-medium leading-snug text-admin-muted">{labelOf(node.key)}</span>
                            <span className="block truncate text-sm font-semibold text-admin-text">
                                {person.name}
                                {suffix && <span className="font-normal text-admin-text-secondary"> · {suffix}</span>}
                            </span>
                        </span>
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-admin-muted transition group-hover:bg-admin-accent group-hover:text-admin-accent-foreground">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                        </span>
                    </button>
                </div>

                {hasChildren && open && (
                    <div className="ml-5 mt-2 space-y-2 border-l-2 border-admin-border pl-4">
                        {children.map((child) => renderNode(child))}
                    </div>
                )}
            </div>
        );
    }

    const governanceVisible = GOVERNANCE.some((key) => !filtering || matches(key));
    const directionVisible = directionGrid.some((key) => !filtering || matches(key));
    const poleVisible = (pole) => !filtering || subtreeVisible(pole);
    const nothing = filtering && !governanceVisible && !directionVisible && !poleVisible(pedagogicalPole) && !poleVisible(administrativePole) && !others.some(matches);

    return (
        <div className="mx-auto min-w-0 max-w-5xl space-y-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={() => setOnlyNoPhoto((value) => !value)}
                    aria-pressed={onlyNoPhoto}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        onlyNoPhoto
                            ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                            : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                    }`}
                >
                    {t('admin.organigramme.no_photo_filter', 'Sans photo')}
                    <span className={`rounded-full px-1.5 text-xs ${onlyNoPhoto ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{missingPhoto}</span>
                </button>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setClosed(new Set())}
                        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                    >
                        <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
                        {t('admin.organigramme.expand_all', 'Tout déplier')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setClosed(new Set(BRANCH_KEYS))}
                        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                    >
                        <ChevronsDownUp className="h-4 w-4" aria-hidden="true" />
                        {t('admin.organigramme.collapse_all', 'Tout replier')}
                    </button>
                </div>
            </div>

            {nothing && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                        <Network className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="text-sm text-admin-text-secondary">{t('admin.common.no_results', 'Aucun résultat')}</p>
                </div>
            )}

            {governanceVisible && (
                <Section icon={Landmark} title={t('admin.organigramme.tree_governance', 'Gouvernance')}>
                    <div className="mx-auto max-w-md space-y-1">
                        {renderNode({ key: GOVERNANCE[0] })}
                        {(!filtering || (matches(GOVERNANCE[0]) && matches(GOVERNANCE[1]))) && (
                            <div className="flex justify-center text-admin-muted" aria-hidden="true">
                                <ArrowDown className="h-4 w-4" />
                            </div>
                        )}
                        {renderNode({ key: GOVERNANCE[1] })}
                    </div>
                </Section>
            )}

            {directionVisible && (
                <Section icon={Shield} title={t('admin.organigramme.tree_direction', 'Direction & services rattachés')}>
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {directionGrid.map((key) => renderNode({ key }))}
                    </div>
                </Section>
            )}

            {(poleVisible(pedagogicalPole) || poleVisible(administrativePole)) && (
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    {poleVisible(pedagogicalPole) && (
                        <Section icon={Workflow} title={t('admin.organigramme.tree_pole_pedagogique', 'Pôle pédagogique')}>
                            {renderNode(pedagogicalPole)}
                        </Section>
                    )}
                    {poleVisible(administrativePole) && (
                        <Section icon={Workflow} title={t('admin.organigramme.tree_pole_administratif', 'Pôle administratif')}>
                            {renderNode(administrativePole)}
                        </Section>
                    )}
                </div>
            )}

            {others.some((key) => !filtering || matches(key)) && (
                <Section icon={Network} title={t('admin.organigramme.tree_other', 'Autres postes')}>
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2 md:grid-cols-2">
                        {others.map((key) => renderNode({ key }))}
                    </div>
                </Section>
            )}
        </div>
    );
}
