import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Download, ExternalLink, Globe, HeartHandshake, ImagePlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 10;

const emptyForm = {
    nom: '',
    site_url: '',
    display_order: '',
    logo: null,
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

function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function hostOf(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

function LogoBox({ partenaire, size = 'h-11 w-11' }) {
    return partenaire.logo_path ? (
        <img src={`/${partenaire.logo_path}`} alt="" className={`${size} flex-shrink-0 rounded-lg border border-admin-border bg-white object-contain p-1`} />
    ) : (
        <span className={`${size} flex flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-500`}>
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>
    );
}

/** Create/edit form as an inline side panel (no modal). */
function PartnerPanel({ editing, onClose }) {
    const { t } = useTranslations();
    const form = useForm(editing ? { nom: editing.nom, site_url: editing.site_url ?? '', display_order: editing.display_order ?? '', logo: null } : emptyForm);
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    function pickLogo(file) {
        if (!file) return;
        form.setData('logo', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/partenaires/${editing.id}`, options);
        } else {
            form.post('/console/partenaires', options);
        }
    }

    const shownLogo = preview ?? (editing?.logo_path ? `/${editing.logo_path}` : null);

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.partenaires.edit_partner', 'Modifier le partenaire') : t('admin.partenaires.new_partner', 'Nouveau partenaire')}
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
                    pickLogo(e.dataTransfer.files?.[0]);
                }}
                className={`group relative flex aspect-[16/7] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-white hover:border-admin-accent/60'
                }`}
            >
                {shownLogo ? (
                    <>
                        <img src={shownLogo} alt="" className="h-full w-full object-contain p-3" />
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
                        <p className="text-sm font-medium text-slate-800">{t('admin.partenaires.logo_optional', 'Logo (optionnel)')}</p>
                        <p className="text-xs text-slate-500">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickLogo(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            {form.errors.logo && <p className="text-sm text-red-500">{form.errors.logo}</p>}

            <div>
                <Label htmlFor="nom">{t('admin.common.name', 'Nom')}</Label>
                <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
            </div>

            <div>
                <Label htmlFor="site_url">{t('admin.partenaires.website_optional', 'Site web (optionnel)')}</Label>
                <Input id="site_url" type="url" value={form.data.site_url} onChange={(e) => form.setData('site_url', e.target.value)} className="mt-1.5" placeholder="https://..." />
                {form.errors.site_url && <p className="mt-1 text-sm text-red-500">{form.errors.site_url}</p>}
            </div>

            <div>
                <Label htmlFor="display_order">{t('admin.partenaires.display_order_optional', "Ordre d'affichage (optionnel)")}</Label>
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

export default function Index({ partenaires }) {
    const { t } = useTranslations();
    const [panel, setPanel] = useState(null); // null | { partenaire: object|null }
    const [confirmId, setConfirmId] = useState(null);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState({ field: 'display_order', dir: 'asc' });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(() => new Set());

    const withLogo = partenaires.filter((p) => p.logo_path).length;
    const withSite = partenaires.filter((p) => p.site_url).length;
    const ordered = useMemo(() => [...partenaires].sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999)), [partenaires]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const rows = term ? partenaires.filter((p) => [p.nom, p.site_url].some((field) => (field ?? '').toLowerCase().includes(term))) : [...partenaires];
        const direction = sort.dir === 'asc' ? 1 : -1;
        return rows.sort((a, b) => {
            const left = a[sort.field] ?? '';
            const right = b[sort.field] ?? '';
            if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
            return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
        });
    }, [partenaires, search, sort]);

    useEffect(() => setPage(1), [search, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const allOnPageSelected = rows.length > 0 && rows.every((p) => selected.has(p.id));

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
            rows.forEach((p) => (allOnPageSelected ? next.delete(p.id) : next.add(p.id)));
            return next;
        });
    }

    function destroy(partenaire) {
        router.delete(`/console/partenaires/${partenaire.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    function exportCsv() {
        const source = selected.size > 0 ? filtered.filter((p) => selected.has(p.id)) : filtered;
        const header = ['Nom', 'Site', 'Ordre'];
        const lines = source.map((p) => [p.nom, p.site_url, p.display_order].map(csvCell).join(','));
        const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'partenaires.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <AdminLayout title={t('admin.partenaires.title', 'Partenaires')}>
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                    {[
                        [HeartHandshake, t('admin.partenaires.stat_total', 'Partenaires'), partenaires.length, null],
                        [ImagePlus, t('admin.partenaires.stat_logo', 'Avec logo'), withLogo, partenaires.length - withLogo],
                        [Globe, t('admin.partenaires.stat_site', 'Avec site web'), withSite, null],
                    ].map(([Icon, label, value, missing]) => (
                        <div key={label} className="admin-card flex items-center gap-3 px-4 py-3">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-xs text-admin-text-secondary">{label}</p>
                                <p className="text-xl font-semibold leading-tight text-admin-text">
                                    {value}
                                    {missing > 0 && <span className="ml-2 text-xs font-medium text-amber-500">{missing} {t('admin.partenaires.missing', 'sans logo')}</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="admin-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-admin-text">{t('admin.partenaires.site_preview', 'Aperçu sur le site')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.partenaires.site_preview_hint', 'dans l’ordre d’affichage — cliquez un logo pour le modifier')}</p>
                    </div>
                    {ordered.length === 0 ? (
                        <p className="py-6 text-center text-sm text-admin-muted">{t('admin.partenaires.empty', 'Aucun partenaire pour le moment.')}</p>
                    ) : (
                        <ul className="flex flex-wrap gap-2.5 rounded-xl bg-white p-3">
                            {ordered.map((partenaire) => (
                                <li key={partenaire.id}>
                                    <button
                                        type="button"
                                        onClick={() => setPanel({ partenaire })}
                                        title={partenaire.nom}
                                        className={`flex h-16 w-24 items-center justify-center rounded-lg border bg-white p-1.5 transition hover:scale-105 hover:border-admin-accent hover:shadow-md ${
                                            panel?.partenaire?.id === partenaire.id ? 'border-admin-accent ring-2 ring-admin-accent/40' : 'border-slate-200'
                                        }`}
                                    >
                                        {partenaire.logo_path ? (
                                            <img src={`/${partenaire.logo_path}`} alt={partenaire.nom} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="line-clamp-2 text-center text-[0.65rem] font-semibold text-slate-500">{partenaire.nom}</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.partenaires.search_placeholder', 'Rechercher un partenaire...')}
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
                <button type="button" onClick={() => setPanel({ partenaire: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.partenaires.new_partner', 'Nouveau partenaire')}
                </button>
            </div>

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_400px]' : ''}`}>
                <div className="admin-card min-w-0 overflow-hidden !p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                            <thead>
                                <tr className="border-b border-admin-border text-left text-xs font-medium text-admin-muted">
                                    <th className="w-12 py-3 pl-4">
                                        <Checkbox checked={allOnPageSelected} onChange={togglePage} label={t('admin.activity_log.select_page', 'Tout sélectionner')} />
                                    </th>
                                    <SortHeader label={t('admin.partenaires.title_single', 'Partenaire')} field="nom" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.partenaires.site', 'Site')} field="site_url" sort={sort} onSort={toggleSort} />
                                    <SortHeader label={t('admin.common.order', 'Ordre')} field="display_order" sort={sort} onSort={toggleSort} />
                                    <th className="w-24 px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-14 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                                    <HeartHandshake className="h-6 w-6" aria-hidden="true" />
                                                </span>
                                                <span className="text-admin-muted">{t('admin.partenaires.empty', 'Aucun partenaire pour le moment.')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {rows.map((partenaire) => {
                                    const editingThis = panel?.partenaire?.id === partenaire.id;
                                    return (
                                        <Fragment key={partenaire.id}>
                                            <tr className={`border-b border-admin-border/60 transition-colors hover:bg-admin-hover/60 ${editingThis ? 'bg-admin-accent/10' : selected.has(partenaire.id) ? 'bg-admin-accent/5' : ''}`}>
                                                <td className="py-3 pl-4">
                                                    <Checkbox checked={selected.has(partenaire.id)} onChange={() => toggleRow(partenaire.id)} label={partenaire.nom} />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <LogoBox partenaire={partenaire} />
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-admin-text">{partenaire.nom}</p>
                                                            {!partenaire.logo_path && <p className="text-xs text-amber-500">{t('admin.partenaires.no_logo', 'Logo manquant')}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {partenaire.site_url ? (
                                                        <a
                                                            href={partenaire.site_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-500 transition hover:bg-sky-500/20"
                                                        >
                                                            {hostOf(partenaire.site_url)}
                                                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-admin-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 tabular-nums text-admin-text-secondary">{partenaire.display_order ?? '—'}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex justify-end gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmId(null);
                                                                setPanel({ partenaire });
                                                            }}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                            aria-label={`${t('admin.common.edit', 'Modifier')} ${partenaire.nom}`}
                                                        >
                                                            <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmId(confirmId === partenaire.id ? null : partenaire.id)}
                                                            className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`${t('admin.common.delete', 'Supprimer')} ${partenaire.nom}`}
                                                        >
                                                            <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {confirmId === partenaire.id && (
                                                <tr className="border-b border-admin-border/60 bg-red-500/5">
                                                    <td />
                                                    <td colSpan={4} className="px-3 py-3">
                                                        <div className="animate-in fade-in-0 flex flex-wrap items-center justify-between gap-3 duration-150">
                                                            <p className="text-sm text-admin-text">{t('admin.partenaires.confirm_delete', 'Supprimer le partenaire « :name » ?').replace(':name', partenaire.nom)}</p>
                                                            <div className="flex gap-2">
                                                                <button type="button" onClick={() => setConfirmId(null)} className={ghostButton}>
                                                                    {t('admin.common.cancel', 'Annuler')}
                                                                </button>
                                                                <button type="button" onClick={() => destroy(partenaire)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
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
                            {filtered.length} {t('admin.partenaires.count_suffix', 'partenaire(s)')}
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

                {panel && <PartnerPanel key={panel.partenaire?.id ?? 'new'} editing={panel.partenaire} onClose={() => setPanel(null)} />}
            </div>
        </AdminLayout>
    );
}
