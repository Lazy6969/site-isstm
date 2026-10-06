import { Fragment, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Download, Eye, EyeOff, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 15;

function roleLabels(t) {
    return {
        'super-admin': t('admin.roles.super_admin', 'Super Admin'),
        enseignant: t('admin.roles.enseignant', 'Enseignant'),
        scolarite: t('admin.roles.scolarite', 'Scolarité'),
        'responsable-materiel': t('admin.roles.materiel', 'Matériel'),
        etudiant: t('admin.roles.etudiant', 'Étudiant'),
    };
}

const PILL = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    danger: 'border-red-500/30 bg-red-500/10 text-red-400',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
    neutral: 'border-admin-border bg-admin-hover text-admin-text-secondary',
};

const ACTION_TONES = {
    role_changed: 'info',
    role_permissions_updated: 'info',
    user_activated: 'success',
    user_deactivated: 'danger',
    preinscription_approved: 'success',
};

function toneFor(action) {
    if (ACTION_TONES[action]) return ACTION_TONES[action];
    if (/delet|remov|reject|refus|deactiv/.test(action)) return 'danger';
    if (/creat|approv|activ|publish|add/.test(action)) return 'success';
    if (/updat|edit|chang/.test(action)) return 'info';
    return 'neutral';
}

function humanize(action) {
    const text = action.replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function Pill({ tone = 'neutral', children }) {
    return <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${PILL[tone]}`}>{children}</span>;
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

function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function Index({ logs }) {
    const { t, locale } = useTranslations();
    const ROLE_LABELS = roleLabels(t);
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [actionFilter, setActionFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(() => new Set());
    const [openId, setOpenId] = useState(null);

    const formatDate = (value) => new Date(value).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (value) => new Date(value).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

    const actions = useMemo(() => [...new Set(logs.map((log) => log.action))].sort(), [logs]);
    const roles = useMemo(() => [...new Set(logs.map((log) => log.user_role).filter(Boolean))].sort(), [logs]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return logs.filter((log) => {
            if (actionFilter && log.action !== actionFilter) return false;
            if (roleFilter && log.user_role !== roleFilter) return false;
            if (!term) return true;
            return [log.description, log.user_name, log.action, log.ip_address].some((field) => (field ?? '').toLowerCase().includes(term));
        });
    }, [logs, search, actionFilter, roleFilter]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const allOnPageSelected = rows.length > 0 && rows.every((log) => selected.has(log.id));
    const activeFilters = Number(Boolean(actionFilter)) + Number(Boolean(roleFilter));

    useEffect(() => {
        setPage(1);
    }, [search, actionFilter, roleFilter]);

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
            rows.forEach((log) => (allOnPageSelected ? next.delete(log.id) : next.add(log.id)));
            return next;
        });
    }

    function exportCsv() {
        const source = selected.size > 0 ? filtered.filter((log) => selected.has(log.id)) : filtered;
        const header = ['Date', 'User', 'Role', 'Action', 'Description', 'IP'];
        const lines = source.map((log) => [log.created_at, log.user_name ?? '', log.user_role ?? '', log.action, log.description, log.ip_address ?? ''].map(csvCell).join(','));
        const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'journal-activite.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    const selectClass =
        'h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

    return (
        <AdminLayout title={t('admin.activity_log.title', "Journal d'activité")}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${
                        showFilters || activeFilters > 0
                            ? 'border-admin-accent/60 bg-admin-accent/10 text-admin-accent'
                            : 'border-admin-border bg-admin-card text-admin-text hover:bg-admin-hover'
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    {showFilters ? t('admin.activity_log.hide_filters', 'Masquer les filtres') : t('admin.activity_log.show_filters', 'Afficher les filtres')}
                    {activeFilters > 0 && <span className="rounded-full bg-admin-accent px-1.5 text-xs text-admin-accent-foreground">{activeFilters}</span>}
                </button>

                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        id="activity-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.activity_log.search_placeholder', 'Rechercher par utilisateur ou action...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-9 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')}
                            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted hover:bg-admin-hover hover:text-admin-text"
                        >
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
            </div>

            {showFilters && (
                <div className="admin-card mb-3 flex flex-wrap items-center gap-3 p-3">
                    <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={selectClass} aria-label={t('admin.activity_log.action', 'Action')}>
                        <option value="">{t('admin.activity_log.all_actions', 'Toutes les actions')}</option>
                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {humanize(action)}
                            </option>
                        ))}
                    </select>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass} aria-label={t('admin.activity_log.role', 'Rôle')}>
                        <option value="">{t('admin.activity_log.all_roles', 'Tous les rôles')}</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {ROLE_LABELS[role] ?? role}
                            </option>
                        ))}
                    </select>
                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setActionFilter('');
                                setRoleFilter('');
                            }}
                            className="text-sm font-medium text-admin-accent hover:underline"
                        >
                            {t('admin.activity_log.reset_filters', 'Réinitialiser')}
                        </button>
                    )}
                </div>
            )}

            <div className="admin-card overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="border-b border-admin-border text-left text-xs font-medium uppercase tracking-wide text-admin-muted">
                                <th className="w-12 py-3 pl-4">
                                    <Checkbox checked={allOnPageSelected} onChange={togglePage} label={t('admin.activity_log.select_page', 'Tout sélectionner')} />
                                </th>
                                <th className="px-3 py-3">{t('admin.activity_log.user', 'Utilisateur')}</th>
                                <th className="px-3 py-3">{t('admin.activity_log.role', 'Rôle')}</th>
                                <th className="px-3 py-3">{t('admin.activity_log.action', 'Action')}</th>
                                <th className="px-3 py-3">{t('admin.common.date', 'Date')}</th>
                                <th className="px-3 py-3">IP</th>
                                <th className="w-16 px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-admin-muted">
                                        {t('admin.activity_log.empty', 'Aucune activité pour le moment.')}
                                    </td>
                                </tr>
                            )}
                            {rows.map((log) => {
                                const open = openId === log.id;
                                const name = log.user_name ?? t('admin.activity_log.system', 'Système');
                                return (
                                    <Fragment key={log.id}>
                                        <tr className={`border-b border-admin-border/60 transition-colors hover:bg-admin-hover/60 ${selected.has(log.id) ? 'bg-admin-accent/5' : ''}`}>
                                            <td className="py-3.5 pl-4">
                                                <Checkbox checked={selected.has(log.id)} onChange={() => toggleRow(log.id)} label={name} />
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-admin-accent/15 text-sm font-semibold text-admin-accent">
                                                        {name.charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="font-medium text-admin-text">{name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                {log.user_role ? <Pill>{ROLE_LABELS[log.user_role] ?? log.user_role}</Pill> : <span className="text-admin-muted">—</span>}
                                            </td>
                                            <td className="max-w-md px-3 py-3.5">
                                                <div className="flex flex-col items-start gap-1">
                                                    <Pill tone={toneFor(log.action)}>{humanize(log.action)}</Pill>
                                                    <span className="line-clamp-1 text-admin-text-secondary">{log.description}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3.5 text-admin-text-secondary">
                                                <span className="block">{formatDate(log.created_at)}</span>
                                                <span className="block text-xs text-admin-muted">{formatTime(log.created_at)}</span>
                                            </td>
                                            <td className="px-3 py-3.5 text-xs text-admin-muted">{log.ip_address ?? '—'}</td>
                                            <td className="px-3 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenId(open ? null : log.id)}
                                                    aria-expanded={open}
                                                    aria-label={t('admin.activity_log.details', 'Détails')}
                                                    className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                >
                                                    {open ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
                                                </button>
                                            </td>
                                        </tr>
                                        {open && (
                                            <tr className="border-b border-admin-border/60 bg-admin-bg/40">
                                                <td />
                                                <td colSpan={6} className="px-3 py-4">
                                                    <p className="text-sm text-admin-text">{log.description}</p>
                                                    <p className="mt-1 font-mono text-xs text-admin-muted">
                                                        {log.action} · {new Date(log.created_at).toLocaleString(dateLocale)} · {log.ip_address ?? '—'}
                                                    </p>
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
                        {filtered.length} {t('admin.activity_log.count_suffix', 'entrée(s)')} —{' '}
                        {logs.length >= 200 ? t('admin.activity_log.last_200', '200 dernières actions') : t('admin.activity_log.full_history', 'historique complet')}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            aria-label={t('admin.activity_log.previous', 'Précédent')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border transition hover:bg-admin-hover disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="tabular-nums">
                            {currentPage} / {pageCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage >= pageCount}
                            aria-label={t('admin.activity_log.next', 'Suivant')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border transition hover:bg-admin-hover disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
