import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, FileText, Pencil, Plus, Search, SlidersHorizontal, Trash2, Upload, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 10;

const emptyForm = { title: '', category: 'public', file: null };

const FILE_TYPES = {
    pdf: { label: 'PDF', tone: 'bg-red-500/15 text-red-400', border: 'border-red-500/30' },
    doc: { label: 'Word', tone: 'bg-sky-500/15 text-sky-500', border: 'border-sky-500/30' },
    docx: { label: 'Word', tone: 'bg-sky-500/15 text-sky-500', border: 'border-sky-500/30' },
    xls: { label: 'Excel', tone: 'bg-emerald-500/15 text-emerald-500', border: 'border-emerald-500/30' },
    xlsx: { label: 'Excel', tone: 'bg-emerald-500/15 text-emerald-500', border: 'border-emerald-500/30' },
    ppt: { label: 'PowerPoint', tone: 'bg-orange-500/15 text-orange-400', border: 'border-orange-500/30' },
    pptx: { label: 'PowerPoint', tone: 'bg-orange-500/15 text-orange-400', border: 'border-orange-500/30' },
};
const FALLBACK_TYPE = { label: 'Fichier', tone: 'bg-admin-hover text-admin-text-secondary', border: 'border-admin-border' };

const CATEGORY_TONES = {
    public: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
    etudiant: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
};

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';
const selectClass =
    'h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

function extensionOf(path) {
    return (path ?? '').split('.').pop().toLowerCase();
}

function typeOf(document) {
    return FILE_TYPES[extensionOf(document.file_path)] ?? FALLBACK_TYPE;
}

function fileName(document) {
    return (document.file_path ?? '').split('/').pop();
}

function Checkbox({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border transition ${
                checked ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground' : 'border-admin-muted/50 hover:border-admin-accent'
            }`}
        >
            {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
        </button>
    );
}

function SortHeader({ label, field, sort, onSort }) {
    const active = sort.field === field;
    return (
        <th className="px-3 py-3">
            <button type="button" onClick={() => onSort(field)} className={`flex items-center gap-1 uppercase tracking-wide transition hover:text-admin-text ${active ? 'text-admin-text' : ''}`}>
                {label}
                {active && (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />)}
            </button>
        </th>
    );
}

function FileTile({ document, size = 'h-11 w-11' }) {
    const type = typeOf(document);
    return (
        <span className={`${size} flex flex-shrink-0 flex-col items-center justify-center rounded-lg text-[0.6rem] font-bold uppercase ${type.tone}`}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            {extensionOf(document.file_path).slice(0, 4)}
        </span>
    );
}

function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/** Create/edit form as an inline side panel (no modal). */
function DocumentPanel({ editing, onClose }) {
    const { t } = useTranslations();
    const form = useForm(editing ? { title: editing.title, category: editing.category, file: null } : emptyForm);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    function pickFile(file) {
        if (!file) return;
        form.setData((data) => ({ ...data, file, title: data.title || file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') }));
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/documents/${editing.id}`, options);
        } else {
            form.post('/console/documents', options);
        }
    }

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.documents.edit_document', 'Modifier le document') : t('admin.documents.new_document', 'Nouveau document')}
                </h2>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                    dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                }`}
            >
                <Upload className="h-6 w-6 text-admin-accent" aria-hidden="true" />
                {form.data.file ? (
                    <p className="text-sm font-medium text-admin-text">{form.data.file.name}</p>
                ) : (
                    <>
                        <p className="text-sm font-medium text-admin-text">{t('admin.documents.file_label', 'Fichier')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')} · PDF, Word, Excel, PowerPoint</p>
                    </>
                )}
                {editing && !form.data.file && (
                    <p className="text-xs text-admin-muted">{t('admin.documents.file_keep_hint', '(laisser vide pour conserver le fichier actuel)')}</p>
                )}
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(e) => pickFile(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}

            <div>
                <Label htmlFor="title">{t('admin.common.title', 'Titre')}</Label>
                <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" />
                {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
            </div>

            <div>
                <Label htmlFor="category">{t('admin.common.category', 'Catégorie')}</Label>
                <Select id="category" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} className="mt-1.5">
                    <option value="public">{t('admin.documents.category_public', 'Public')}</option>
                    <option value="etudiant">{t('admin.documents.category_etudiant', 'Étudiants')}</option>
                </Select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onClose} className={ghostButton}>
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button type="submit" disabled={form.processing} className={primaryButton}>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {editing ? t('admin.common.save', 'Enregistrer') : t('admin.common.create', 'Créer')}
                </button>
            </div>
        </form>
    );
}

/** Quick preview: PDFs render inline; other formats get a card with open/download. */
function PreviewPanel({ document, categoryLabel, dateLabel, onClose, onEdit }) {
    const { t } = useTranslations();
    const type = typeOf(document);
    const isPdf = extensionOf(document.file_path) === 'pdf';
    const url = `/${document.file_path}`;

    return (
        <div className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <FileTile document={document} />
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-admin-text">{document.title}</h2>
                        <p className="truncate text-xs text-admin-muted">
                            {type.label} · {categoryLabel} · {dateLabel}
                        </p>
                    </div>
                </div>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            {isPdf ? (
                <iframe src={`${url}#toolbar=0&navpanes=0`} title={document.title} className="h-[60vh] w-full rounded-xl border border-admin-border bg-white" />
            ) : (
                <div className={`flex flex-col items-center gap-3 rounded-xl border border-dashed ${type.border} px-4 py-12 text-center`}>
                    <FileTile document={document} size="h-16 w-16" />
                    <p className="text-sm font-medium text-admin-text">{fileName(document)}</p>
                    <p className="max-w-xs text-xs text-admin-muted">{t('admin.documents.no_inline_preview', 'Ce format ne peut pas être affiché ici : ouvrez ou téléchargez le fichier.')}</p>
                </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={onEdit} className={ghostButton}>
                    <span className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        {t('admin.common.edit', 'Modifier')}
                    </span>
                </button>
                <a href={url} target="_blank" rel="noopener" className={ghostButton}>
                    <span className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        {t('admin.documents.open', 'Ouvrir')}
                    </span>
                </a>
                <a href={url} download className={primaryButton}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('admin.documents.download', 'Télécharger')}
                </a>
            </div>
        </div>
    );
}

export default function Index({ documents }) {
    const { t, locale } = useTranslations();
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';
    const categoryLabels = {
        public: t('admin.documents.category_public', 'Public'),
        etudiant: t('admin.documents.category_etudiant', 'Étudiants'),
    };

    const [panel, setPanel] = useState(null); // null | { mode: 'edit'|'preview', document: object|null }
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sort, setSort] = useState({ field: 'created_at', dir: 'desc' });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(() => new Set());

    const formatDate = (value) => (value ? new Date(value).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
    const typeKey = (document) => typeOf(document).label;

    const counts = useMemo(() => {
        const result = {};
        documents.forEach((document) => (result[document.category] = (result[document.category] ?? 0) + 1));
        return result;
    }, [documents]);
    const typeOptions = useMemo(() => [...new Set(documents.map(typeKey))].sort(), [documents]);
    const activeFilters = Number(Boolean(typeFilter));

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const rows = documents.filter((document) => {
            if (categoryFilter && document.category !== categoryFilter) return false;
            if (typeFilter && typeKey(document) !== typeFilter) return false;
            if (!term) return true;
            return `${document.title} ${fileName(document)}`.toLowerCase().includes(term);
        });
        const direction = sort.dir === 'asc' ? 1 : -1;
        return rows.sort((a, b) => {
            const left = sort.field === 'type' ? typeKey(a) : a[sort.field] ?? '';
            const right = sort.field === 'type' ? typeKey(b) : b[sort.field] ?? '';
            return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documents, search, categoryFilter, typeFilter, sort]);

    useEffect(() => setPage(1), [search, categoryFilter, typeFilter, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const allOnPageSelected = rows.length > 0 && rows.every((document) => selected.has(document.id));
    const chips = [['', t('admin.actualites.all', 'Tous'), documents.length], ...Object.keys(categoryLabels).filter((key) => counts[key]).map((key) => [key, categoryLabels[key], counts[key]])];

    function toggleSort(field) {
        setSort((current) => (current.field === field ? { field, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' }));
    }

    function toggleRow(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function togglePage() {
        setSelected((prev) => {
            const next = new Set(prev);
            rows.forEach((document) => (allOnPageSelected ? next.delete(document.id) : next.add(document.id)));
            return next;
        });
    }

    function destroy(document) {
        router.delete(`/console/documents/${document.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    function exportCsv() {
        const source = selected.size > 0 ? filtered.filter((document) => selected.has(document.id)) : filtered;
        const header = ['Titre', 'Catégorie', 'Type', 'Fichier', 'Ajouté le'];
        const lines = source.map((document) => [document.title, document.category, typeKey(document), fileName(document), document.created_at].map(csvCell).join(','));
        const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = 'documents.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    const activePanelId = panel?.document?.id;

    return (
        <AdminLayout title={t('admin.documents.title', 'Documents')}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${
                        showFilters || activeFilters > 0 ? 'border-admin-accent/60 bg-admin-accent/10 text-admin-accent' : 'border-admin-border bg-admin-card text-admin-text hover:bg-admin-hover'
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    {showFilters ? t('admin.activity_log.hide_filters', 'Masquer les filtres') : t('admin.activity_log.show_filters', 'Afficher les filtres')}
                    {activeFilters > 0 && <span className="rounded-full bg-admin-accent px-1.5 text-xs text-admin-accent-foreground">{activeFilters}</span>}
                </button>

                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.documents.search_placeholder', 'Rechercher un document...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-9 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch('')} aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')} className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted hover:bg-admin-hover hover:text-admin-text">
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={exportCsv}
                    disabled={filtered.length === 0}
                    className="flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3.5 text-sm font-medium text-admin-text transition hover:bg-admin-hover disabled:opacity-40"
                >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('admin.activity_log.export', 'Exporter')}
                    {selected.size > 0 && <span className="text-xs text-admin-muted">({selected.size})</span>}
                </button>
                <button type="button" onClick={() => setPanel({ mode: 'edit', document: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.documents.new_document', 'Nouveau document')}
                </button>
            </div>

            {showFilters && (
                <div className="admin-card animate-in fade-in-0 slide-in-from-top-1 mb-3 flex flex-wrap items-center gap-3 p-3 duration-200">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass} aria-label={t('admin.common.type', 'Type')}>
                        <option value="">{t('admin.documents.all_types', 'Tous les formats')}</option>
                        {typeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    {activeFilters > 0 && (
                        <button type="button" onClick={() => setTypeFilter('')} className="text-sm font-medium text-admin-accent hover:underline">
                            {t('admin.activity_log.reset_filters', 'Réinitialiser')}
                        </button>
                    )}
                </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
                {chips.map(([value, label, count]) => (
                    <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setCategoryFilter(value)}
                        className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                            categoryFilter === value
                                ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                        }`}
                    >
                        {label}
                        <span className={`rounded-full px-1.5 text-xs ${categoryFilter === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{count}</span>
                    </button>
                ))}
            </div>

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_460px]' : ''}`}>
                <div className="admin-card min-w-0 overflow-hidden !p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-admin-border text-left text-xs font-medium text-admin-muted">
                                    <th className="w-12 py-3 pl-4">
                                        <Checkbox checked={allOnPageSelected} onChange={togglePage} label={t('admin.activity_log.select_page', 'Tout sélectionner')} />
                                    </th>
                                    <SortHeader label={t('admin.documents.title_single', 'Document')} field="title" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.common.category', 'Catégorie')} field="category" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.common.type', 'Type')} field="type" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.documents.added_on', 'Ajouté le')} field="created_at" sort={sort} onSort={toggleSort} />
                                    <th className="w-32 px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-14 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                                    <FileText className="h-6 w-6" aria-hidden="true" />
                                                </span>
                                                <span className="text-admin-muted">{t('admin.documents.empty', 'Aucun document pour le moment.')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {rows.map((document) => {
                                    const active = activePanelId === document.id;
                                    const type = typeOf(document);
                                    return (
                                        <Fragment key={document.id}>
                                            <tr className={`border-b border-admin-border/60 transition-colors hover:bg-admin-hover/60 ${active ? 'bg-admin-accent/10' : selected.has(document.id) ? 'bg-admin-accent/5' : ''}`}>
                                                <td className="py-3 pl-4">
                                                    <Checkbox checked={selected.has(document.id)} onChange={() => toggleRow(document.id)} label={document.title} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <button type="button" onClick={() => setPanel({ mode: 'preview', document })} className="flex w-full items-center gap-3 text-left">
                                                        <FileTile document={document} />
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-admin-text hover:text-admin-accent">{document.title}</p>
                                                            <p className="truncate text-xs text-admin-muted">{fileName(document)}</p>
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${CATEGORY_TONES[document.category] ?? ''}`}>
                                                        {categoryLabels[document.category] ?? document.category}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${type.tone}`}>{type.label}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3 text-admin-text-secondary">{formatDate(document.created_at)}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex justify-end gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPanel({ mode: 'preview', document })}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                            aria-label={`${t('admin.documents.preview', 'Aperçu')} ${document.title}`}
                                                        >
                                                            <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmId(null);
                                                                setPanel({ mode: 'edit', document });
                                                            }}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                            aria-label={`${t('admin.common.edit', 'Modifier')} ${document.title}`}
                                                        >
                                                            <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmId(confirmId === document.id ? null : document.id)}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`${t('admin.common.delete', 'Supprimer')} ${document.title}`}
                                                        >
                                                            <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {confirmId === document.id && (
                                                <tr className="border-b border-admin-border/60 bg-red-500/5">
                                                    <td />
                                                    <td colSpan={5} className="px-3 py-3">
                                                        <div className="animate-in fade-in-0 flex flex-wrap items-center justify-between gap-3 duration-150">
                                                            <p className="text-sm text-admin-text">{t('admin.documents.confirm_delete', 'Supprimer le document « :title » ?').replace(':title', document.title)}</p>
                                                            <div className="flex gap-2">
                                                                <button type="button" onClick={() => setConfirmId(null)} className={ghostButton}>
                                                                    {t('admin.common.cancel', 'Annuler')}
                                                                </button>
                                                                <button type="button" onClick={() => destroy(document)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
                                                                    {t('admin.hero_slides.delete_confirm', 'Supprimer')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border px-4 py-3 text-sm text-admin-text-secondary">
                        <span>
                            {filtered.length} {t('admin.documents.count_suffix', 'document(s)')}
                        </span>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} aria-label={t('admin.activity_log.previous', 'Précédent')} className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border transition hover:bg-admin-hover disabled:opacity-40">
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="tabular-nums">
                                {currentPage} / {pageCount}
                            </span>
                            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount} aria-label={t('admin.activity_log.next', 'Suivant')} className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border transition hover:bg-admin-hover disabled:opacity-40">
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                {panel?.mode === 'edit' && <DocumentPanel key={panel.document?.id ?? 'new'} editing={panel.document} onClose={() => setPanel(null)} />}
                {panel?.mode === 'preview' && (
                    <PreviewPanel
                        key={panel.document.id}
                        document={panel.document}
                        categoryLabel={categoryLabels[panel.document.category] ?? panel.document.category}
                        dateLabel={formatDate(panel.document.created_at)}
                        onClose={() => setPanel(null)}
                        onEdit={() => setPanel({ mode: 'edit', document: panel.document })}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
