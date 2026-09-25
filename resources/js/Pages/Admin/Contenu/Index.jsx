import { useEffect, useMemo, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
    Pencil,
    Type,
    Image as ImageIcon,
    Shapes,
    RefreshCw,
    Search,
    X,
    LayoutGrid,
    FolderOpen,
    Home,
    Phone,
    GraduationCap,
    Target,
    MapPin,
    BookOpen,
    Scale,
    ShieldCheck,
    Users,
    BarChart3,
    Wallet,
    Archive,
} from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import StatCard from '../../../Components/Admin/StatCard';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import { Badge } from '../../../Components/ui/badge';
import { ICONS, getIcon } from '../../../Components/QuickEdit/icons';

const localeLabels = { fr: 'FR', en: 'EN', mg: 'MG' };

const typeMeta = {
    text: { label: 'Texte', icon: Type, variant: 'default' },
    icon: { label: 'Icône', icon: Shapes, variant: 'gold' },
    image: { label: 'Image', icon: ImageIcon, variant: 'success' },
};

// Ordered by specificity — the first matching keyword wins, so "Accueil —
// Direction" hits "direction" before the generic "accueil" fallback.
const CATEGORY_ICON_RULES = [
    [/direction/, Home],
    [/mission|vision/, Target],
    [/statistique/, BarChart3],
    [/contact/, Phone],
    [/inscription/, GraduationCap],
    [/frais|bourse/, Wallet],
    [/localisation/, MapPin],
    [/histoire/, BookOpen],
    [/mentions/, Scale],
    [/confidentialité/, ShieldCheck],
    [/association/, Users],
    [/accueil/, Home],
];

function categoryIcon(label) {
    const lower = label.toLowerCase();
    return CATEGORY_ICON_RULES.find(([pattern]) => pattern.test(lower))?.[1] ?? FolderOpen;
}

/**
 * The category picker — a compact menu on the right, content on the left, so
 * editing a category never requires scrolling past every other one first.
 * Renders as a horizontal scrollable strip on mobile, a stacked list on
 * desktop (same markup, just a different flex direction).
 */
function CategoryMenu({ groups, selected, onSelect }) {
    return (
        <nav aria-label="Catégories de contenu" className="lg:sticky lg:top-20">
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-admin-muted lg:px-0">Menu</p>
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
                {groups.map(([label, items]) => {
                    const Icon = categoryIcon(label);
                    const active = selected === label;
                    return (
                        <li key={label} className="flex-shrink-0 lg:flex-shrink">
                            <button
                                type="button"
                                onClick={() => onSelect(label)}
                                className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition lg:whitespace-normal ${
                                    active
                                        ? 'border-admin-accent bg-admin-accent/10 text-admin-accent'
                                        : 'border-admin-border bg-admin-card text-admin-text-secondary hover:bg-admin-hover'
                                }`}
                            >
                                <span
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                                        active ? 'bg-admin-accent text-admin-accent-foreground' : 'bg-admin-hover text-admin-text-secondary'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1 truncate">{label}</span>
                                <span className="flex-shrink-0 text-xs opacity-70">{items.length}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

function truncate(value, max = 90) {
    if (!value) return '—';
    return value.length > max ? `${value.slice(0, max)}…` : value;
}

function matchesSearch(content, term) {
    if (content.content_key.toLowerCase().includes(term)) return true;
    return ['content_value_fr', 'content_value_en', 'content_value_mg'].some((field) =>
        (content[field] ?? '').toLowerCase().includes(term),
    );
}

/**
 * The edit form for whichever item was clicked — shown inline on the right
 * (in place of CategoryMenu) instead of a modal, so it never blocks the
 * content being edited. Saving hides it again (see onSuccess: onClose).
 */
function InlineEditPanel({ editing, onClose, icons }) {
    const { content, locale } = editing;
    const form = useForm({ key: '', value: '', file: null, locale: null });

    useEffect(() => {
        if (!content) return;
        if (content.type === 'text') {
            form.setData({ key: content.content_key, value: content[`content_value_${locale}`] ?? '', file: null, locale });
        } else if (content.type === 'icon') {
            form.setData({ key: content.content_key, value: content.content_value_fr, file: null, locale: null });
        } else {
            form.setData({ key: content.content_key, value: '', file: null, locale: null });
        }
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, locale]);

    function submit(e) {
        e.preventDefault();
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            forceFormData: content?.type === 'image',
            onSuccess: onClose,
        });
    }

    function pickIcon(name) {
        form.setData('value', name);
        form.post('/console/content/update', { preserveScroll: true, preserveState: true, onSuccess: onClose });
    }

    return (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm lg:sticky lg:top-20">
            <div className="mb-4 flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-mono text-xs text-admin-muted" title={content.content_key}>
                    {content.content_key}
                    {locale && <span className="ml-2 font-sans text-admin-text-secondary">({localeLabels[locale]})</span>}
                </p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                    aria-label="Fermer sans enregistrer"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            {content.type === 'text' && (
                <form onSubmit={submit} className="space-y-3">
                    {locale === 'fr' && (
                        <p className="rounded-lg bg-admin-accent/10 px-3 py-2 text-xs text-admin-accent">
                            En enregistrant, l'anglais et le malgache seront traduits automatiquement à partir de ce texte français.
                        </p>
                    )}
                    <Textarea value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} rows={8} autoFocus />
                    {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90">
                            Enregistrer
                        </Button>
                    </div>
                </form>
            )}

            {content.type === 'icon' && (
                <div>
                    <div className="grid grid-cols-4 gap-2">
                        {icons.map((name) => {
                            const Icon = ICONS[name];
                            const selected = name === form.data.value;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => pickIcon(name)}
                                    disabled={form.processing}
                                    title={name}
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                                        selected
                                            ? 'border-admin-accent bg-admin-accent/10 text-admin-accent'
                                            : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            );
                        })}
                    </div>
                    {form.errors.value && <p className="mt-3 text-sm text-red-500">{form.errors.value}</p>}
                </div>
            )}

            {content.type === 'image' && (
                <form onSubmit={submit} className="space-y-4">
                    <img src={`/${content.content_value_fr}`} alt="" className="h-40 w-full rounded-lg border border-admin-border object-cover" />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.file}
                            className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90"
                        >
                            Enregistrer
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

function ContentCard({ content, onEdit }) {
    const IconPreview = content.type === 'icon' ? getIcon(content.content_value_fr) : null;
    const meta = typeMeta[content.type];
    const TypeIcon = meta.icon;

    return (
        <div className="group flex flex-col rounded-xl border border-admin-border bg-admin-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-admin-accent/30 hover:shadow-md">
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate font-mono text-xs text-admin-muted" title={content.content_key}>
                    {content.content_key}
                </p>
                <Badge variant={meta.variant} className="flex-shrink-0">
                    <TypeIcon className="h-3 w-3" aria-hidden="true" />
                    {meta.label}
                </Badge>
            </div>

            {content.type === 'text' && (
                <div className="flex-1 space-y-2">
                    <div className="rounded-lg border border-admin-accent/25 bg-admin-accent/5 px-3 py-2.5">
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-wide text-admin-accent uppercase">
                                <span className="flex h-4 w-7 items-center justify-center rounded bg-admin-accent text-[0.6rem] text-admin-accent-foreground">
                                    FR
                                </span>
                                Source
                            </span>
                            <button
                                onClick={() => onEdit(content, 'fr')}
                                className="flex-shrink-0 rounded p-1 text-admin-accent transition hover:bg-admin-card"
                                aria-label={`Modifier ${content.content_key} (FR)`}
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                        <p className="text-sm text-admin-text">{truncate(content.content_value_fr)}</p>
                    </div>

                    <div className="space-y-1">
                        {['en', 'mg'].map((locale) => (
                            <div key={locale} className="flex items-start gap-2 rounded-lg bg-admin-hover px-2.5 py-1.5">
                                <span className="mt-0.5 flex h-5 w-7 flex-shrink-0 items-center justify-center rounded bg-admin-card text-[0.6rem] font-bold text-admin-muted">
                                    {localeLabels[locale]}
                                </span>
                                <p className="min-w-0 flex-1 text-xs text-admin-muted">{truncate(content[`content_value_${locale}`], 65)}</p>
                                <button
                                    onClick={() => onEdit(content, locale)}
                                    className="flex-shrink-0 rounded p-1 text-admin-muted transition hover:bg-admin-card hover:text-admin-accent"
                                    aria-label={`Modifier ${content.content_key} (${localeLabels[locale]})`}
                                >
                                    <Pencil className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="flex items-start gap-1 text-[0.68rem] leading-snug text-admin-muted">
                        <RefreshCw className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        EN/MG sont traduits automatiquement depuis le FR à l'enregistrement — modifiables ensuite à la main si besoin.
                    </p>
                </div>
            )}

            {content.type === 'icon' && IconPreview && (
                <div className="flex flex-1 items-center justify-between gap-2 rounded-lg bg-admin-hover px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-admin-accent/10 text-admin-accent">
                            <IconPreview className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="truncate text-sm text-admin-text-secondary">{content.content_value_fr}</span>
                    </div>
                    <Button
                        onClick={() => onEdit(content, null)}
                        className="h-8 flex-shrink-0 bg-admin-card px-2.5 text-admin-text-secondary shadow-none hover:bg-admin-accent hover:text-admin-accent-foreground"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                </div>
            )}

            {content.type === 'image' && (
                <div className="flex flex-1 flex-col gap-2.5">
                    <img
                        src={`/${content.content_value_fr}`}
                        alt=""
                        className="h-28 w-full rounded-lg border border-admin-border object-cover"
                    />
                    <Button
                        onClick={() => onEdit(content, null)}
                        className="w-full bg-admin-hover text-admin-text hover:bg-admin-accent hover:text-admin-accent-foreground"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Remplacer l'image
                    </Button>
                </div>
            )}
        </div>
    );
}

/** The left-hand content pane for whichever category is selected in CategoryMenu. */
function CategoryPanel({ label, items, onEdit }) {
    const CategoryIcon = categoryIcon(label);

    return (
        <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent/15 to-admin-accent/5 text-admin-accent">
                    <CategoryIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-admin-text">{label}</p>
                    <p className="text-xs text-admin-muted">
                        {items.length} élément{items.length > 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-admin-border p-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((content) => (
                    <ContentCard key={content.id} content={content} onEdit={onEdit} />
                ))}
            </div>
        </div>
    );
}

export default function Index({ groups, icons }) {
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(() => Object.keys(groups)[0] ?? null);

    function onEdit(content, locale) {
        setEditing({ content, locale });
    }

    const allItems = useMemo(() => Object.values(groups).flat(), [groups]);
    const stats = useMemo(
        () => ({
            total: allItems.length,
            text: allItems.filter((c) => c.type === 'text').length,
            icon: allItems.filter((c) => c.type === 'icon').length,
            image: allItems.filter((c) => c.type === 'image').length,
            categories: Object.keys(groups).length,
        }),
        [groups, allItems],
    );

    const term = search.trim().toLowerCase();
    const isSearching = term !== '';
    const visibleGroups = useMemo(() => {
        if (!isSearching) return Object.entries(groups);
        return Object.entries(groups)
            .map(([label, items]) => [label, items.filter((content) => matchesSearch(content, term))])
            .filter(([, items]) => items.length > 0);
    }, [groups, term, isSearching]);

    // Keep the selected category valid: fall back to the first visible one
    // when a search filters the current selection out (or on first load).
    useEffect(() => {
        if (visibleGroups.some(([label]) => label === selected)) return;
        setSelected(visibleGroups[0]?.[0] ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleGroups]);

    const selectedGroup = visibleGroups.find(([label]) => label === selected);

    return (
        <AdminLayout
            title="Contenu du site"
            actions={
                <Link
                    href="/console/contenu/historique"
                    className="flex items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm font-medium text-admin-text-secondary shadow-sm transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    Historique des modifications
                </Link>
            }
        >
            <p className="mb-5 text-sm text-admin-text-secondary">
                Textes, icônes et images affichés sur les pages publiques (accueil, contact, histoire, frais, mentions légales…).
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Total" value={stats.total} icon={LayoutGrid} />
                <StatCard label="Textes" value={stats.text} icon={Type} />
                <StatCard label="Icônes" value={stats.icon} icon={Shapes} />
                <StatCard label="Images" value={stats.image} icon={ImageIcon} />
                <StatCard label="Catégories" value={stats.categories} icon={FolderOpen} />
            </div>

            <div className="relative mb-4 w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher une clé ou un texte..."
                    className="pl-9"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                        aria-label="Effacer la recherche"
                    >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
            </div>

            {visibleGroups.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-admin-border bg-admin-card py-14 text-center">
                    <Search className="h-6 w-6 text-admin-muted" aria-hidden="true" />
                    <p className="text-sm text-admin-text-secondary">Aucun contenu ne correspond à « {search} ».</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    {selectedGroup && <CategoryPanel label={selectedGroup[0]} items={selectedGroup[1]} onEdit={onEdit} />}
                    {editing ? (
                        <InlineEditPanel editing={editing} onClose={() => setEditing(null)} icons={icons} />
                    ) : (
                        <CategoryMenu groups={visibleGroups} selected={selected} onSelect={setSelected} />
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
