import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Download, GraduationCap, ImagePlus, Mail, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 10;

const emptyForm = {
    name: '',
    category: 'permanent',
    specialty_fr: '',
    specialty_en: '',
    specialty_mg: '',
    description_fr: '',
    description_en: '',
    description_mg: '',
    email: '',
    display_order: '',
    photo: null,
};

const FIELD_KEYS = Object.keys(emptyForm).filter((key) => key !== 'photo');
const locales = [
    { key: 'fr', label: 'FR' },
    { key: 'en', label: 'EN' },
    { key: 'mg', label: 'MG' },
];

const CATEGORY_TONES = {
    permanent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    vacataire: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
};

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';

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

function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/** Create/edit form as an inline side panel, with one tab per language. */
function TeacherPanel({ editing, onClose }) {
    const { t } = useTranslations();
    const form = useForm(editing ? { ...Object.fromEntries(FIELD_KEYS.map((key) => [key, editing[key] ?? ''])), photo: null } : emptyForm);
    const [locale, setLocale] = useState('fr');
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    function pickPhoto(file) {
        if (!file) return;
        form.setData('photo', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/enseignants/${editing.id}`, options);
        } else {
            form.post('/console/enseignants', options);
        }
    }

    const errorLocales = locales.filter(({ key }) => Object.keys(form.errors).some((name) => name.endsWith(`_${key}`)));
    const shownPhoto = preview ?? (editing?.photo_path ? `/${editing.photo_path}` : null);
    const specialtyName = `specialty_${locale}`;
    const descriptionName = `description_${locale}`;

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.enseignants.edit_teacher', "Modifier l'enseignant") : t('admin.enseignants.new_teacher', 'Nouvel enseignant')}
                </h2>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="flex items-center gap-4">
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
                        pickPhoto(e.dataTransfer.files?.[0]);
                    }}
                    className={`group relative flex h-24 w-24 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-200 ${
                        dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                    }`}
                >
                    {shownPhoto ? (
                        <>
                            <img src={shownPhoto} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <ImagePlus className="h-5 w-5 text-white" aria-hidden="true" />
                            </div>
                        </>
                    ) : (
                        <ImagePlus className="h-6 w-6 text-admin-accent" aria-hidden="true" />
                    )}
                    <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-admin-text">{t('admin.enseignants.photo_optional', 'Photo (optionnel)')}</p>
                    <p className="text-xs text-admin-muted">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                    {form.errors.photo && <p className="mt-1 text-sm text-red-500">{form.errors.photo}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="name">{t('admin.common.name', 'Nom')}</Label>
                    <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1.5" />
                    {form.errors.name && <p className="mt-1 text-xs text-red-500">{form.errors.name}</p>}
                </div>
                <div>
                    <Label htmlFor="category">{t('admin.common.category', 'Catégorie')}</Label>
                    <Select id="category" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} className="mt-1.5">
                        <option value="permanent">{t('admin.enseignants.category_permanent', 'Enseignant permanent')}</option>
                        <option value="vacataire">{t('admin.enseignants.category_vacataire', 'Enseignant vacataire')}</option>
                    </Select>
                    {form.errors.category && <p className="mt-1 text-xs text-red-500">{form.errors.category}</p>}
                </div>
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
                    <div>
                        <Label htmlFor={specialtyName}>{t('admin.enseignants.specialty', 'Spécialité')}</Label>
                        <Input id={specialtyName} value={form.data[specialtyName]} onChange={(e) => form.setData(specialtyName, e.target.value)} className="mt-1.5" />
                        {form.errors[specialtyName] && <p className="mt-1 text-sm text-red-500">{form.errors[specialtyName]}</p>}
                    </div>
                    <div>
                        <Label htmlFor={descriptionName}>{t('admin.common.description', 'Description')}</Label>
                        <Textarea id={descriptionName} value={form.data[descriptionName]} onChange={(e) => form.setData(descriptionName, e.target.value)} rows={4} className="mt-1.5" />
                        {form.errors[descriptionName] && <p className="mt-1 text-sm text-red-500">{form.errors[descriptionName]}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
                <div>
                    <Label htmlFor="email">{t('admin.enseignants.email_optional', 'Email (optionnel)')}</Label>
                    <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="mt-1.5" />
                    {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                </div>
                <div>
                    <Label htmlFor="display_order">{t('admin.common.order', 'Ordre')}</Label>
                    <Input id="display_order" type="number" value={form.data.display_order} onChange={(e) => form.setData('display_order', e.target.value)} className="mt-1.5" />
                    {form.errors.display_order && <p className="mt-1 text-xs text-red-500">{form.errors.display_order}</p>}
                </div>
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

export default function Index({ teachers }) {
    const { t } = useTranslations();
    const categoryLabels = {
        permanent: t('admin.enseignants.category_permanent', 'Enseignant permanent'),
        vacataire: t('admin.enseignants.category_vacataire', 'Enseignant vacataire'),
    };

    const [panel, setPanel] = useState(null); // null | { teacher: object|null }
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sort, setSort] = useState({ field: 'display_order', dir: 'asc' });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(() => new Set());

    const counts = useMemo(() => {
        const result = {};
        teachers.forEach((teacher) => (result[teacher.category] = (result[teacher.category] ?? 0) + 1));
        return result;
    }, [teachers]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const rows = teachers.filter((teacher) => {
            if (categoryFilter && teacher.category !== categoryFilter) return false;
            if (!term) return true;
            return [teacher.name, teacher.email, teacher.specialty_fr, teacher.specialty_en, teacher.specialty_mg].some((field) => (field ?? '').toLowerCase().includes(term));
        });
        const direction = sort.dir === 'asc' ? 1 : -1;
        return rows.sort((a, b) => {
            const left = a[sort.field] ?? '';
            const right = b[sort.field] ?? '';
            if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
            return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
        });
    }, [teachers, search, categoryFilter, sort]);

    useEffect(() => setPage(1), [search, categoryFilter, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const allOnPageSelected = rows.length > 0 && rows.every((teacher) => selected.has(teacher.id));
    const chips = [['', t('admin.actualites.all', 'Tous'), teachers.length], ...Object.keys(categoryLabels).filter((key) => counts[key]).map((key) => [key, categoryLabels[key], counts[key]])];

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
            rows.forEach((teacher) => (allOnPageSelected ? next.delete(teacher.id) : next.add(teacher.id)));
            return next;
        });
    }

    function destroy(teacher) {
        router.delete(`/console/enseignants/${teacher.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    function exportCsv() {
        const source = selected.size > 0 ? filtered.filter((teacher) => selected.has(teacher.id)) : filtered;
        const header = ['Nom', 'Catégorie', 'Spécialité (FR)', 'Spécialité (EN)', 'Spécialité (MG)', 'E-mail', 'Ordre'];
        const lines = source.map((teacher) =>
            [teacher.name, teacher.category, teacher.specialty_fr, teacher.specialty_en, teacher.specialty_mg, teacher.email, teacher.display_order].map(csvCell).join(','),
        );
        const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'enseignants.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <AdminLayout title={t('admin.enseignants.title', 'Enseignants')}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.enseignants.search_placeholder', 'Rechercher un enseignant...')}
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
                <button type="button" onClick={() => setPanel({ teacher: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.enseignants.new_teacher', 'Nouvel enseignant')}
                </button>
            </div>

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

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_440px]' : ''}`}>
                <div className="admin-card min-w-0 overflow-hidden !p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-admin-border text-left text-xs font-medium text-admin-muted">
                                    <th className="w-12 py-3 pl-4">
                                        <Checkbox checked={allOnPageSelected} onChange={togglePage} label={t('admin.activity_log.select_page', 'Tout sélectionner')} />
                                    </th>
                                    <SortHeader label={t('admin.common.name', 'Nom')} field="name" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.common.category', 'Catégorie')} field="category" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.enseignants.specialty', 'Spécialité')} field="specialty_fr" sort={sort} onSort={toggleSort} />
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
                                                    <GraduationCap className="h-6 w-6" aria-hidden="true" />
                                                </span>
                                                <span className="text-admin-muted">{t('admin.enseignants.empty', 'Aucun enseignant pour le moment.')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {rows.map((teacher) => {
                                    const editingThis = panel?.teacher?.id === teacher.id;
                                    return (
                                        <Fragment key={teacher.id}>
                                            <tr className={`border-b border-admin-border/60 transition-colors hover:bg-admin-hover/60 ${editingThis ? 'bg-admin-accent/10' : selected.has(teacher.id) ? 'bg-admin-accent/5' : ''}`}>
                                                <td className="py-3 pl-4">
                                                    <Checkbox checked={selected.has(teacher.id)} onChange={() => toggleRow(teacher.id)} label={teacher.name} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {teacher.photo_path ? (
                                                            <img src={`/${teacher.photo_path}`} alt="" className="h-10 w-10 flex-shrink-0 rounded-full border border-admin-border object-cover" />
                                                        ) : (
                                                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-admin-accent/15 text-sm font-semibold text-admin-accent">
                                                                {teacher.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-admin-text">{teacher.name}</p>
                                                            {teacher.email ? (
                                                                <p className="flex items-center gap-1 truncate text-xs text-admin-muted">
                                                                    <Mail className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                                                    {teacher.email}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-admin-muted">—</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${CATEGORY_TONES[teacher.category] ?? ''}`}>
                                                        {categoryLabels[teacher.category] ?? teacher.category}
                                                    </span>
                                                </td>
                                                <td className="max-w-[220px] truncate px-3 py-3 text-admin-text-secondary">{teacher.specialty_fr || '—'}</td>
                                                <td className="px-3 py-3 tabular-nums text-admin-text-secondary">{teacher.display_order ?? '—'}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex justify-end gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmId(null);
                                                                setPanel({ teacher });
                                                            }}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                            aria-label={`${t('admin.common.edit', 'Modifier')} ${teacher.name}`}
                                                        >
                                                            <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmId(confirmId === teacher.id ? null : teacher.id)}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`${t('admin.common.delete', 'Supprimer')} ${teacher.name}`}
                                                        >
                                                            <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {confirmId === teacher.id && (
                                                <tr className="border-b border-admin-border/60 bg-red-500/5">
                                                    <td />
                                                    <td colSpan={5} className="px-3 py-3">
                                                        <div className="animate-in fade-in-0 flex flex-wrap items-center justify-between gap-3 duration-150">
                                                            <p className="text-sm text-admin-text">{t('admin.enseignants.confirm_delete', "Supprimer l'enseignant « :name » ?").replace(':name', teacher.name)}</p>
                                                            <div className="flex gap-2">
                                                                <button type="button" onClick={() => setConfirmId(null)} className={ghostButton}>
                                                                    {t('admin.common.cancel', 'Annuler')}
                                                                </button>
                                                                <button type="button" onClick={() => destroy(teacher)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
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
                            {filtered.length} {t('admin.enseignants.count_suffix', 'enseignant(s)')}
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

                {panel && <TeacherPanel key={panel.teacher?.id ?? 'new'} editing={panel.teacher} onClose={() => setPanel(null)} />}
            </div>
        </AdminLayout>
    );
}
