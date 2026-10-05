import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
    Pencil,
    Type,
    Image as ImageIcon,
    Shapes,
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
    Link2,
    ChevronDown,
    ExternalLink,
    Monitor,
    Smartphone,
    Tablet,
} from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import StatCard from '../../../Components/Admin/StatCard';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import { ICONS, getIcon } from '../../../Components/QuickEdit/icons';
import { useTranslations } from '../../../lib/useTranslations';

const localeLabels = { fr: 'FR', en: 'EN', mg: 'MG' };

function useTypeMeta() {
    const { t } = useTranslations();
    return {
        text: { label: t('admin.contenu.type_text', 'Texte'), icon: Type, variant: 'default' },
        icon: { label: t('admin.contenu.type_icon', 'Icône'), icon: Shapes, variant: 'gold' },
        image: { label: t('admin.contenu.type_image', 'Image'), icon: ImageIcon, variant: 'success' },
        url: { label: t('admin.contenu.type_url', 'Lien'), icon: Link2, variant: 'default' },
    };
}

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

// Public URL that best shows a category, matched on its label like the icons above.
const CATEGORY_PREVIEW_RULES = [
    [/^accueil|pied de page|^autres/, '/'],
    [/^contact|localisation/, '/contact'],
    [/^inscription|frais/, '/inscription'],
    [/préinscription/, '/preinscription'],
    [/^histoire|^historique/, '/historique'],
    [/^bourse/, '/bourse'],
    [/mentions/, '/mentions-legales'],
    [/confidentialité/, '/confidentialite'],
    [/association/, '/associations'],
    [/^actualit/, '/actualites'],
    [/campus/, '/campus'],
    [/^vie étudiante/, '/vie-etudiante'],
    [/^documents/, '/documents'],
    [/^équipe/, '/equipe'],
    [/^événement/, '/evenements'],
    [/^filières/, '/filieres'],
    [/^formations/, '/formations'],
    [/^galerie/, '/galerie'],
    [/organigramme|parcours/, '/parcours'],
    [/^recherche/, '/recherche'],
];

function previewPath(label) {
    const lower = label.toLowerCase();
    return CATEGORY_PREVIEW_RULES.find(([pattern]) => pattern.test(lower))?.[1] ?? '/';
}

const HIGHLIGHT_CLASS = '__isstm-highlight';

function normalizeText(value) {
    return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Finds, inside the same-origin preview document, the element that displays
 * the given content: an <img> whose src ends with the stored path, or the
 * deepest element whose text contains the stored text.
 */
function findPreviewElement(doc, content) {
    if (!doc?.body || !content) return null;

    if (content.type === 'image') {
        const path = (content.content_value_fr ?? '').replace(/^\/+/, '');
        if (!path) return null;
        return [...doc.querySelectorAll('img')].find((img) => (img.getAttribute('src') ?? '').includes(path)) ?? null;
    }

    if (content.type !== 'text') return null;

    const needle = normalizeText(content.content_value_fr);
    if (needle.length < 2) return null;
    const probe = needle.length > 60 ? needle.slice(0, 60) : needle;

    const candidates = [...doc.body.querySelectorAll('*')].filter(
        (el) => !['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'].includes(el.tagName.toUpperCase()) && normalizeText(el.textContent).includes(probe),
    );

    return candidates.find((el) => !candidates.some((other) => other !== el && el.contains(other))) ?? null;
}

function applyPreviewHighlight(iframe, content) {
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;

    if (!doc.getElementById('__isstm-highlight-style')) {
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-admin-accent').trim() || '#e11d3f';
        const style = doc.createElement('style');
        style.id = '__isstm-highlight-style';
        style.textContent = `
            .${HIGHLIGHT_CLASS} { outline: 3px solid ${accent} !important; outline-offset: 4px; border-radius: 4px; animation: __isstm-pulse 1.1s ease-in-out infinite; }
            @keyframes __isstm-pulse { 0%, 100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 0 10px ${accent}33; } }`;
        doc.head.appendChild(style);
    }

    doc.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));

    const target = findPreviewElement(doc, content);
    if (target) {
        target.classList.add(HIGHLIGHT_CLASS);
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
}

const PREVIEW_DEVICES = {
    desktop: { icon: Monitor, width: '100%' },
    tablet: { icon: Tablet, width: '768px' },
    mobile: { icon: Smartphone, width: '390px' },
};

/**
 * Live preview of the public page that shows the selected category. The
 * iframe is re-keyed by `version` so it reloads after each save.
 */
function SitePreview({ path, version, highlight = null }) {
    const { t } = useTranslations();
    const [device, setDevice] = useState('desktop');
    const iframeRef = useRef(null);
    const [loadedKey, setLoadedKey] = useState(null);
    const frameKey = `${path}-${version}`;

    useEffect(() => {
        if (loadedKey !== frameKey) return;
        try {
            applyPreviewHighlight(iframeRef.current, highlight);
        } catch {
            // cross-origin or not-yet-ready document — nothing to highlight.
        }
    }, [highlight, loadedKey, frameKey]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 rounded-lg bg-admin-hover p-1">
                    {Object.entries(PREVIEW_DEVICES).map(([name, { icon: DeviceIcon }]) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setDevice(name)}
                            aria-label={name}
                            aria-pressed={device === name}
                            className={`rounded-md p-1.5 transition ${device === name ? 'bg-admin-accent text-admin-accent-foreground' : 'text-admin-muted hover:text-admin-text'}`}
                        >
                            <DeviceIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                    ))}
                </div>
                <span className="min-w-0 truncate font-mono text-xs text-admin-muted">{path}</span>
                <a
                    href={path}
                    target="isstm-site-preview"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('admin.contenu.view_site', 'Voir le site')}
                </a>
            </div>
            <div className="flex justify-center overflow-hidden rounded-xl border border-admin-border bg-admin-bg/60 p-2">
                <iframe
                    ref={iframeRef}
                    key={frameKey}
                    src={path}
                    onLoad={() => setLoadedKey(frameKey)}
                    title={t('admin.contenu.preview', 'Aperçu du site')}
                    style={{ width: PREVIEW_DEVICES[device].width }}
                    className="h-[70vh] max-w-full rounded-lg bg-white transition-[width] duration-300"
                />
            </div>
        </div>
    );
}

/**
 * The category picker — a compact tree: labels like "Accueil — Direction" are
 * grouped under one collapsible parent ("Accueil") so dozens of categories fit
 * in a short, independently scrollable list instead of a page-long stack.
 * Horizontal chip strip on mobile.
 */
function splitLabel(label) {
    const [parent, ...rest] = label.split(' — ');
    return rest.length > 0 ? { parent, child: rest.join(' — ') } : { parent: label, child: null };
}

function catLabel(t, part) {
    return t(`admin.contenu.cat.${part}`, part);
}

function CategoryMenu({ groups, selected, onSelect }) {
    const { t } = useTranslations();
    const [openParents, setOpenParents] = useState(() => new Set([splitLabel(selected ?? '').parent]));

    const tree = useMemo(() => {
        const map = new Map();
        groups.forEach(([label, items]) => {
            const { parent, child } = splitLabel(label);
            if (!map.has(parent)) map.set(parent, { parent, entries: [], total: 0 });
            const node = map.get(parent);
            node.entries.push({ label, child, count: items.length });
            node.total += items.length;
        });
        return [...map.values()];
    }, [groups]);

    useEffect(() => {
        if (!selected) return;
        const { parent } = splitLabel(selected);
        setOpenParents((prev) => (prev.has(parent) ? prev : new Set(prev).add(parent)));
    }, [selected]);

    function toggleParent(parent) {
        setOpenParents((prev) => {
            const next = new Set(prev);
            if (next.has(parent)) {
                next.delete(parent);
            } else {
                next.add(parent);
            }
            return next;
        });
    }

    return (
        <nav
            aria-label={t('admin.contenu.categories', 'Catégories de contenu')}
            className="admin-card sticky top-20 z-10 flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden"
        >
            <p className="flex items-center justify-between border-b border-admin-border px-4 py-3 text-sm font-semibold text-admin-text">
                {t('admin.contenu.pages_of_site', 'Pages du site')}
                <span className="rounded-full bg-admin-accent/15 px-2 py-0.5 text-xs font-medium text-admin-accent">{groups.length}</span>
            </p>
            <ul className="flex-1 space-y-0.5 overflow-y-auto p-2 [scrollbar-width:thin]">
                {tree.map(({ parent, entries, total }) => {
                    const single = entries.length === 1 && !entries[0].child;
                    const Icon = categoryIcon(parent);
                    const open = openParents.has(parent);
                    const parentActive = entries.some((entry) => entry.label === selected);

                    if (single) {
                        const active = selected === entries[0].label;
                        return (
                            <li key={parent}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(entries[0].label)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition ${
                                        active
                                            ? 'bg-gradient-to-r from-admin-accent to-admin-accent/80 text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                            : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    <span className="min-w-0 flex-1 truncate">{catLabel(t, parent)}</span>
                                    <span className="text-xs opacity-70">{total}</span>
                                </button>
                            </li>
                        );
                    }

                    return (
                        <li key={parent}>
                            <button
                                type="button"
                                onClick={() => toggleParent(parent)}
                                aria-expanded={open}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition hover:bg-admin-hover ${
                                    parentActive ? 'text-admin-accent' : 'text-admin-text'
                                }`}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate">{catLabel(t, parent)}</span>
                                <span className="text-xs font-normal text-admin-muted">{total}</span>
                                <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-admin-muted transition-transform duration-200 ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
                            </button>
                            {open && (
                                <ul className="ml-[1.15rem] mt-0.5 space-y-0.5 border-l border-admin-border pl-2">
                                    {entries.map((entry) => {
                                        const active = selected === entry.label;
                                        return (
                                            <li key={entry.label}>
                                                <button
                                                    type="button"
                                                    onClick={() => onSelect(entry.label)}
                                                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[0.8rem] transition ${
                                                        active
                                                            ? 'bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                                            : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                                    }`}
                                                >
                                                    <span className="min-w-0 flex-1 truncate">{catLabel(t, entry.child ?? entry.label)}</span>
                                                    <span className="text-xs opacity-70">{entry.count}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
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
    const { t } = useTranslations();
    const { content, locale } = editing;
    const form = useForm({ key: '', value: '', file: null, locale: null });

    useEffect(() => {
        if (!content) return;
        if (content.type === 'text') {
            form.setData({ key: content.content_key, value: content[`content_value_${locale}`] ?? '', file: null, locale });
        } else if (content.type === 'icon' || content.type === 'url') {
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
        <div className="sticky top-16 z-10 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-mono text-xs text-admin-muted" title={content.content_key}>
                    {content.content_key}
                    {locale && <span className="ml-2 font-sans text-admin-text-secondary">({localeLabels[locale]})</span>}
                </p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                    aria-label={t('admin.contenu.save_close', 'Fermer sans enregistrer')}
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            {content.type === 'text' && (
                <form onSubmit={submit} className="space-y-3">
                    {locale === 'fr' && (
                        <p className="rounded-lg bg-admin-accent/10 px-3 py-2 text-xs text-admin-accent">
                            {t('admin.contenu.translation_notice', "En enregistrant, l'anglais et le malgache seront traduits automatiquement à partir de ce texte français.")}
                        </p>
                    )}
                    <Textarea value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} rows={8} autoFocus />
                    {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            {t('admin.common.cancel', 'Annuler')}
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90">
                            {t('admin.common.save', 'Enregistrer')}
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
                            {t('admin.common.cancel', 'Annuler')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.file}
                            className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90"
                        >
                            {t('admin.common.save', 'Enregistrer')}
                        </Button>
                    </div>
                </form>
            )}

            {content.type === 'url' && (
                <form onSubmit={submit} className="space-y-3">
                    <Input
                        type="url"
                        placeholder="https://..."
                        value={form.data.value}
                        onChange={(e) => form.setData('value', e.target.value)}
                        autoFocus
                    />
                    {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                    <p className="text-xs text-admin-muted">{t('admin.contenu.url_hint', 'Laissez vide pour désactiver le bouton qui utilise ce lien.')}</p>
                    <div className="flex justify-end gap-2">
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            {t('admin.common.cancel', 'Annuler')}
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90">
                            {t('admin.common.save', 'Enregistrer')}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

/**
 * Turns a technical key ("directeur_mot_titre") into a readable name
 * ("Mot titre"), dropping the leading segment that only names the section.
 */
function readableName(key) {
    const parts = key.split('_');
    const words = (parts.length > 1 ? parts.slice(1) : parts).join(' ').trim();
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}

const TYPE_TINT = {
    text: 'bg-sky-500/15 text-sky-500',
    icon: 'bg-amber-500/15 text-amber-500',
    image: 'bg-emerald-500/15 text-emerald-500',
    url: 'bg-violet-500/15 text-violet-500',
};

/**
 * One editable item as a readable row: what it is, what it currently says
 * (or shows), and a clear "Modifier" action. Hovering it frames the matching
 * element in the site preview; the row being edited stays highlighted.
 */
function ContentRow({ content, onEdit, onHover, isEditing }) {
    const { t } = useTranslations();
    const typeMeta = useTypeMeta();
    const meta = typeMeta[content.type];
    const TypeIcon = meta.icon;
    const IconPreview = content.type === 'icon' ? getIcon(content.content_value_fr) : null;
    const locale = content.type === 'text' ? 'fr' : null;

    return (
        <li>
            <div
                role="button"
                tabIndex={0}
                onClick={() => onEdit(content, locale)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEdit(content, locale);
                    }
                }}
                onMouseEnter={() => onHover?.(content)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(content)}
                onBlur={() => onHover?.(null)}
                className={`group flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-all duration-200 ${
                    isEditing
                        ? 'border-admin-accent bg-admin-accent/10 ring-1 ring-admin-accent/40'
                        : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/50 hover:bg-admin-hover hover:shadow-md hover:shadow-admin-accent/10'
                }`}
            >
                {content.type === 'image' ? (
                    <img src={`/${content.content_value_fr}`} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg border border-admin-border object-cover" />
                ) : (
                    <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${TYPE_TINT[content.type]}`}>
                        {IconPreview ? <IconPreview className="h-6 w-6" aria-hidden="true" /> : <TypeIcon className="h-5 w-5" aria-hidden="true" />}
                    </span>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-admin-text">{readableName(content.content_key)}</p>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${TYPE_TINT[content.type]}`}>{meta.label}</span>
                    </div>
                    {content.type === 'text' && <p className="mt-1 line-clamp-2 text-sm leading-snug text-admin-text-secondary">{truncate(content.content_value_fr, 160)}</p>}
                    {content.type === 'icon' && <p className="mt-1 text-sm text-admin-text-secondary">{content.content_value_fr}</p>}
                    {content.type === 'image' && <p className="mt-1 truncate text-sm text-admin-text-secondary">{content.content_value_fr.split('/').pop()}</p>}
                    {content.type === 'url' && <p className="mt-1 truncate text-sm text-admin-text-secondary">{content.content_value_fr || t('admin.contenu.url_empty', 'Aucun lien défini')}</p>}
                    <p className="mt-1 truncate font-mono text-[0.65rem] text-admin-muted" title={content.content_key}>
                        {content.content_key}
                    </p>
                </div>

                <span
                    className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isEditing ? 'bg-admin-accent text-admin-accent-foreground' : 'bg-admin-hover text-admin-text-secondary group-hover:bg-admin-accent group-hover:text-admin-accent-foreground'
                    }`}
                >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">{content.type === 'image' ? t('admin.contenu.replace_image', "Remplacer l'image") : t('admin.common.edit', 'Modifier')}</span>
                </span>
            </div>
        </li>
    );
}

/**
 * The content pane for whichever category is selected in CategoryMenu — one
 * readable row per item, always visible (no collapsed cards to open first).
 */
function CategoryPanel({ label, items, onEdit, onHover, editingId, compact = false }) {
    const { t } = useTranslations();
    const CategoryIcon = categoryIcon(label);
    const [filter, setFilter] = useState('');
    const term = filter.trim().toLowerCase();
    const shown = term ? items.filter((c) => matchesSearch(c, term) || readableName(c.content_key).toLowerCase().includes(term)) : items;

    return (
        <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card/60">
            <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/70 text-admin-accent-foreground shadow-md shadow-admin-accent/25">
                    <CategoryIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-admin-text">{label.split(' — ').map((part) => catLabel(t, part)).join(' — ')}</p>
                    <p className="text-xs text-admin-muted">
                        {items.length} {items.length > 1 ? t('admin.contenu.items', 'éléments') : t('admin.contenu.item', 'élément')} ·{' '}
                        {t('admin.contenu.hover_hint', "survolez un élément pour le repérer dans l'aperçu")}
                    </p>
                </div>
            </div>
            {items.length > 6 && (
                <div className="relative border-t border-admin-border px-3 pt-3">
                    <Search className="pointer-events-none absolute left-6 top-1/2 mt-1.5 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <Input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder={t('admin.contenu.filter_category', 'Filtrer dans cette catégorie...')}
                        className="h-9 pl-9"
                    />
                </div>
            )}
            <ul
                className={`space-y-2 overflow-y-auto border-t border-admin-border p-3 [scrollbar-width:thin] ${
                    compact ? 'max-h-[calc(100vh-30rem)] min-h-40' : 'max-h-[calc(100vh-17rem)]'
                }`}
            >
                {shown.length === 0 && <li className="py-6 text-center text-sm text-admin-muted">{t('admin.common.no_results', 'Aucun résultat')}</li>}
                {shown.map((content) => (
                    <ContentRow key={content.id} content={content} onEdit={onEdit} onHover={onHover} isEditing={editingId === content.id} />
                ))}
            </ul>
        </div>
    );
}

export default function Index({ groups, icons }) {
    const { t } = useTranslations();
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState(null);
    const [selected, setSelected] = useState(() => Object.keys(groups)[0] ?? null);
    const [tab, setTab] = useState('edit');
    const [hovered, setHovered] = useState(null);
    const [previewVersion, setPreviewVersion] = useState(0);

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
        return Object.entries(groups)
            .map(([label, items]) => [
                label,
                items
                    .filter((content) => !typeFilter || content.type === typeFilter)
                    .filter((content) => !isSearching || matchesSearch(content, term)),
            ])
            .filter(([, items]) => items.length > 0);
    }, [groups, term, isSearching, typeFilter]);

    // Keep the selected category valid: fall back to the first visible one
    // when a search/type filter excludes the current selection (or on first load).
    useEffect(() => {
        if (visibleGroups.some(([label]) => label === selected)) return;
        setSelected(visibleGroups[0]?.[0] ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleGroups]);

    const selectedGroup = visibleGroups.find(([label]) => label === selected);

    function closeEditor() {
        setEditing(null);
        setPreviewVersion((v) => v + 1);
    }

    function toggleTypeFilter(type) {
        setTypeFilter((current) => (current === type ? null : type));
    }

    return (
        <AdminLayout
            title={t('admin.contenu.title', 'Contenu du site')}
            actions={
                <Link
                    href="/console/contenu/historique"
                    className="flex items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm font-medium text-admin-text-secondary shadow-sm transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    {t('admin.contenu.history', 'Historique des modifications')}
                </Link>
            }
        >
            <p className="mb-5 text-sm text-admin-text-secondary">
                {t(
                    'admin.contenu.description',
                    'Textes, icônes et images affichés sur les pages publiques (accueil, contact, histoire, frais, mentions légales…).',
                )}
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard label={t('admin.contenu.total', 'Total')} value={stats.total} icon={LayoutGrid} onClick={() => setTypeFilter(null)} active={!typeFilter} />
                <StatCard label={t('admin.contenu.texts', 'Textes')} value={stats.text} icon={Type} onClick={() => toggleTypeFilter('text')} active={typeFilter === 'text'} />
                <StatCard label={t('admin.contenu.icons', 'Icônes')} value={stats.icon} icon={Shapes} onClick={() => toggleTypeFilter('icon')} active={typeFilter === 'icon'} />
                <StatCard label={t('admin.contenu.images', 'Images')} value={stats.image} icon={ImageIcon} onClick={() => toggleTypeFilter('image')} active={typeFilter === 'image'} />
                <StatCard label={t('admin.contenu.categories', 'Catégories')} value={stats.categories} icon={FolderOpen} />
            </div>

            <div className="relative mb-4 w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('admin.contenu.search_placeholder', 'Rechercher une clé ou un texte...')}
                    className="pl-9"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                        aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')}
                    >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
            </div>

            {visibleGroups.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-admin-border bg-admin-card py-14 text-center">
                    <Search className="h-6 w-6 text-admin-muted" aria-hidden="true" />
                    <p className="text-sm text-admin-text-secondary">
                        {isSearching
                            ? t('admin.contenu.empty_search', 'Aucun contenu ne correspond à « :term ».').replace(':term', search)
                            : t('admin.common.no_results', 'Aucun résultat')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <CategoryMenu
                        groups={visibleGroups}
                        selected={selected}
                        onSelect={(label) => {
                            setSelected(label);
                            setEditing(null);
                            setHovered(null);
                        }}
                    />

                    <div className="admin-card min-w-0 p-4 lg:sticky lg:top-20 lg:self-start">
                        <div className="mb-4 flex gap-1 border-b border-admin-border" role="tablist">
                            {[
                                ['edit', t('admin.contenu.tab_edit', 'Édition du contenu')],
                                ['preview', t('admin.contenu.tab_preview', 'Aperçu du site')],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === value}
                                    onClick={() => setTab(value)}
                                    className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                                        tab === value ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-secondary hover:text-admin-text'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === 'preview' ? (
                            selectedGroup && <SitePreview path={previewPath(selectedGroup[0])} version={previewVersion} highlight={editing?.content ?? null} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <div className="min-w-0 space-y-4">
                                    {editing && <InlineEditPanel editing={editing} onClose={closeEditor} icons={icons} />}
                                    {selectedGroup && <CategoryPanel key={selectedGroup[0]} label={selectedGroup[0]} items={selectedGroup[1]} onEdit={onEdit} onHover={setHovered} editingId={editing?.content?.id ?? null} compact={Boolean(editing)} />}
                                </div>
                                <div className="hidden min-w-0 xl:block">
                                    {selectedGroup && <SitePreview path={previewPath(selectedGroup[0])} version={previewVersion} highlight={hovered ?? editing?.content ?? null} />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
