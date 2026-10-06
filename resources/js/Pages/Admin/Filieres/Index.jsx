import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, BookOpen, Check, ChevronLeft, ChevronRight, Download, ImagePlus, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Textarea } from '../../../Components/ui/textarea';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 10;

const emptyForm = {
    code: '',
    mention: '',
    niveaux: '',
    nom_fr: '',
    nom_en: '',
    nom_mg: '',
    description_fr: '',
    description_en: '',
    description_mg: '',
    debouches_fr: '',
    debouches_en: '',
    debouches_mg: '',
    historique_fr: '',
    historique_en: '',
    historique_mg: '',
    avantages_fr: '',
    avantages_en: '',
    avantages_mg: '',
    display_order: '',
    image: null,
};

const FIELD_KEYS = Object.keys(emptyForm).filter((key) => key !== 'image');
const locales = [
    { key: 'fr', label: 'FR' },
    { key: 'en', label: 'EN' },
    { key: 'mg', label: 'MG' },
];

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';
const selectClass =
    'h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

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

function splitLevels(niveaux) {
    return (niveaux ?? '')
        .split(',')
        .map((level) => level.trim())
        .filter(Boolean);
}

function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/** Create/edit form as an inline side panel, with one tab per language. */
function FilierePanel({ editing, onClose }) {
    const { t } = useTranslations();
    const form = useForm(
        editing
            ? { ...Object.fromEntries(FIELD_KEYS.map((key) => [key, editing[key] ?? ''])), image: null }
            : emptyForm,
    );
    const [locale, setLocale] = useState('fr');
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    function pickImage(file) {
        if (!file) return;
        form.setData('image', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/filieres/${editing.id}`, options);
        } else {
            form.post('/console/filieres', options);
        }
    }

    const errorLocales = locales.filter(({ key }) => Object.keys(form.errors).some((name) => name.endsWith(`_${key}`)));
    const shownImage = preview ?? (editing?.image_path ? `/${editing.image_path}` : null);

    const localizedFields = [
        ['nom', t('admin.common.name', 'Nom'), false],
        ['description', t('admin.common.description', 'Description'), true],
        ['debouches', t('admin.filieres.debouches', 'Débouchés'), true],
        ['historique', t('admin.filieres.historique', 'Historique'), true],
        ['avantages', t('admin.filieres.avantages', 'Avantages'), true],
    ];

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.filieres.edit_filiere', 'Modifier la filière') : t('admin.filieres.new_filiere', 'Nouvelle filière')}
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
                    pickImage(e.dataTransfer.files?.[0]);
                }}
                className={`group relative flex aspect-[16/7] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                }`}
            >
                {shownImage ? (
                    <>
                        <img src={shownImage} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900">
                                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                                {t('admin.hero_slides.change_media', 'Changer le fichier')}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                        <ImagePlus className="h-6 w-6 text-admin-accent" aria-hidden="true" />
                        <p className="text-sm font-medium text-admin-text">{t('admin.filieres.image_optional', 'Image (optionnel)')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            {form.errors.image && <p className="text-sm text-red-500">{form.errors.image}</p>}

            <div className="grid grid-cols-3 gap-3">
                {[
                    ['code', t('admin.filieres.code', 'Code'), undefined],
                    ['mention', t('admin.filieres.mention', 'Mention'), undefined],
                    ['niveaux', t('admin.filieres.levels', 'Niveaux'), 'L1,L2,L3'],
                ].map(([name, label, placeholder]) => (
                    <div key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Input id={name} value={form.data[name]} onChange={(e) => form.setData(name, e.target.value)} placeholder={placeholder} className="mt-1.5" />
                        {form.errors[name] && <p className="mt-1 text-xs text-red-500">{form.errors[name]}</p>}
                    </div>
                ))}
            </div>

            <div>
                <div className="mb-3 flex gap-1 border-b border-admin-border" role="tablist">
                    {locales.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={locale === key}
                            onClick={() => setLocale(key)}
                            className={`relative -mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                                locale === key ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-secondary hover:text-admin-text'
                            }`}
                        >
                            {label}
                            {errorLocales.some((l) => l.key === key) && <span className="absolute right-1 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />}
                        </button>
                    ))}
                </div>
                <div className="space-y-3">
                    {localizedFields.map(([base, label, textarea]) => {
                        const name = `${base}_${locale}`;
                        const Field = textarea ? Textarea : Input;
                        return (
                            <div key={name}>
                                <Label htmlFor={name}>{label}</Label>
                                <Field id={name} value={form.data[name]} onChange={(e) => form.setData(name, e.target.value)} rows={textarea ? 3 : undefined} className="mt-1.5" />
                                {form.errors[name] && <p className="mt-1 text-sm text-red-500">{form.errors[name]}</p>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <Label htmlFor="display_order">{t('admin.filieres.display_order', "Ordre d'affichage")}</Label>
                <Input id="display_order" type="number" value={form.data.display_order} onChange={(e) => form.setData('display_order', e.target.value)} className="mt-1.5" />
                {form.errors.display_order && <p className="mt-1 text-sm text-red-500">{form.errors.display_order}</p>}
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

function SortHeader({ label, field, sort, onSort, className = '' }) {
    const active = sort.field === field;
    return (
        <th className={`px-3 py-3 ${className}`}>
            <button type="button" onClick={() => onSort(field)} className={`flex items-center gap-1 uppercase tracking-wide transition hover:text-admin-text ${active ? 'text-admin-text' : ''}`}>
                {label}
                {active && (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />)}
            </button>
        </th>
    );
}

export default function Index({ filieres }) {
    const { t } = useTranslations();
    const [panel, setPanel] = useState(null); // null | { filiere: object|null }
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [sort, setSort] = useState({ field: 'display_order', dir: 'asc' });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(() => new Set());

    const mentions = useMemo(() => [...new Set(filieres.map((f) => f.mention).filter(Boolean))].sort(), [filieres]);
    const levels = useMemo(() => [...new Set(filieres.flatMap((f) => splitLevels(f.niveaux)))].sort(), [filieres]);
    const activeFilters = Number(Boolean(mentionFilter)) + Number(Boolean(levelFilter));

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const rows = filieres.filter((f) => {
            if (mentionFilter && f.mention !== mentionFilter) return false;
            if (levelFilter && !splitLevels(f.niveaux).includes(levelFilter)) return false;
            if (!term) return true;
            return [f.nom_fr, f.nom_en, f.nom_mg, f.code, f.mention].some((field) => (field ?? '').toLowerCase().includes(term));
        });
        const direction = sort.dir === 'asc' ? 1 : -1;
        return rows.sort((a, b) => {
            const left = a[sort.field] ?? '';
            const right = b[sort.field] ?? '';
            if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
            return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
        });
    }, [filieres, search, mentionFilter, levelFilter, sort]);

    useEffect(() => setPage(1), [search, mentionFilter, levelFilter, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const allOnPageSelected = rows.length > 0 && rows.every((f) => selected.has(f.id));

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
            rows.forEach((f) => (allOnPageSelected ? next.delete(f.id) : next.add(f.id)));
            return next;
        });
    }

    function destroy(filiere) {
        router.delete(`/console/filieres/${filiere.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    function exportCsv() {
        const source = selected.size > 0 ? filtered.filter((f) => selected.has(f.id)) : filtered;
        const header = ['Code', 'Nom (FR)', 'Nom (EN)', 'Nom (MG)', 'Mention', 'Niveaux', 'Ordre'];
        const lines = source.map((f) => [f.code, f.nom_fr, f.nom_en, f.nom_mg, f.mention, f.niveaux, f.display_order].map(csvCell).join(','));
        const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'filieres.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <AdminLayout title={t('admin.filieres.title', 'Filières')}>
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
                        placeholder={t('admin.filieres.search_placeholder', 'Rechercher une filière...')}
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
                <button type="button" onClick={() => setPanel({ filiere: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.filieres.new_filiere', 'Nouvelle filière')}
                </button>
            </div>

            {showFilters && (
                <div className="admin-card animate-in fade-in-0 slide-in-from-top-1 mb-3 flex flex-wrap items-center gap-3 p-3 duration-200">
                    <select value={mentionFilter} onChange={(e) => setMentionFilter(e.target.value)} className={selectClass} aria-label={t('admin.filieres.mention', 'Mention')}>
                        <option value="">{t('admin.filieres.all_mentions', 'Toutes les mentions')}</option>
                        {mentions.map((mention) => (
                            <option key={mention} value={mention}>
                                {mention}
                            </option>
                        ))}
                    </select>
                    <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className={selectClass} aria-label={t('admin.filieres.levels', 'Niveaux')}>
                        <option value="">{t('admin.filieres.all_levels', 'Tous les niveaux')}</option>
                        {levels.map((level) => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </select>
                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setMentionFilter('');
                                setLevelFilter('');
                            }}
                            className="text-sm font-medium text-admin-accent hover:underline"
                        >
                            {t('admin.activity_log.reset_filters', 'Réinitialiser')}
                        </button>
                    )}
                </div>
            )}

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_440px]' : ''}`}>
                <div className="admin-card min-w-0 overflow-hidden !p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-admin-border text-left text-xs font-medium text-admin-muted">
                                    <th className="w-12 py-3 pl-4">
                                        <Checkbox checked={allOnPageSelected} onChange={togglePage} label={t('admin.activity_log.select_page', 'Tout sélectionner')} />
                                    </th>
                                    <SortHeader label={t('admin.filieres.title_single', 'Filière')} field="nom_fr" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.filieres.mention', 'Mention')} field="mention" sort={sort} onSort={toggleSort} />
                                    <th className="px-3 py-3 uppercase tracking-wide">{t('admin.filieres.levels', 'Niveaux')}</th>
                                    <SortHeader label={t('admin.common.order', 'Ordre')} field="display_order" sort={sort} onSort={toggleSort} />
                                    <th className="w-24 px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-14 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                                                </span>
                                                <span className="text-admin-muted">{t('admin.filieres.empty', 'Aucune filière pour le moment.')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {rows.map((filiere) => {
                                    const editingThis = panel?.filiere?.id === filiere.id;
                                    return (
                                        <Fragment key={filiere.id}>
                                            <tr className={`border-b border-admin-border/60 transition-colors hover:bg-admin-hover/60 ${editingThis ? 'bg-admin-accent/10' : selected.has(filiere.id) ? 'bg-admin-accent/5' : ''}`}>
                                                <td className="py-3 pl-4">
                                                    <Checkbox checked={selected.has(filiere.id)} onChange={() => toggleRow(filiere.id)} label={filiere.nom_fr} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {filiere.image_path ? (
                                                            <img src={`/${filiere.image_path}`} alt="" className="h-11 w-11 flex-shrink-0 rounded-lg border border-admin-border object-cover" />
                                                        ) : (
                                                            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-admin-accent/15 text-admin-accent">
                                                                <BookOpen className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-admin-text">{filiere.nom_fr}</p>
                                                            <p className="truncate text-xs text-admin-muted">{filiere.code ?? '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-admin-text-secondary">{filiere.mention ?? '—'}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {splitLevels(filiere.niveaux).length === 0 && <span className="text-admin-muted">—</span>}
                                                        {splitLevels(filiere.niveaux).map((level) => (
                                                            <span key={level} className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-xs font-medium text-sky-500">
                                                                {level}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 tabular-nums text-admin-text-secondary">{filiere.display_order ?? '—'}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex justify-end gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmId(null);
                                                                setPanel({ filiere });
                                                            }}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                            aria-label={`${t('admin.common.edit', 'Modifier')} ${filiere.nom_fr}`}
                                                        >
                                                            <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmId(confirmId === filiere.id ? null : filiere.id)}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`${t('admin.common.delete', 'Supprimer')} ${filiere.nom_fr}`}
                                                        >
                                                            <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {confirmId === filiere.id && (
                                                <tr className="border-b border-admin-border/60 bg-red-500/5">
                                                    <td />
                                                    <td colSpan={5} className="px-3 py-3">
                                                        <div className="animate-in fade-in-0 flex flex-wrap items-center justify-between gap-3 duration-150">
                                                            <p className="text-sm text-admin-text">{t('admin.filieres.confirm_delete', 'Supprimer la filière « :name » ?').replace(':name', filiere.nom_fr)}</p>
                                                            <div className="flex gap-2">
                                                                <button type="button" onClick={() => setConfirmId(null)} className={ghostButton}>
                                                                    {t('admin.common.cancel', 'Annuler')}
                                                                </button>
                                                                <button type="button" onClick={() => destroy(filiere)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
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
                            {filtered.length} {t('admin.filieres.count_suffix', 'filière(s)')}
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

                {panel && <FilierePanel key={panel.filiere?.id ?? 'new'} editing={panel.filiere} onClose={() => setPanel(null)} />}
            </div>
        </AdminLayout>
    );
}
