import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    CalendarClock,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    History,
    Image as ImageIcon,
    RotateCcw,
    Search,
    Shapes,
    Type,
    Users,
    X,
} from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 10;

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';

const typeStyles = {
    text: 'border-rose-500/30 bg-rose-500/10 text-rose-500',
    icon: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500',
    image: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
};

function truncate(value, max = 80) {
    if (!value) return '—';
    return value.length > max ? `${value.slice(0, max)}…` : value;
}

function formatDateTime(value) {
    return new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function relativeTime(value) {
    const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);
    const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
    if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
    return formatter.format(Math.round(hours / 24), 'day');
}

function dayKey(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function dayLabel(value) {
    const today = dayKey(new Date());
    const yesterday = dayKey(new Date(Date.now() - 24 * 3600 * 1000));
    const key = dayKey(value);
    if (key === today) return "Aujourd'hui";
    if (key === yesterday) return 'Hier';
    return new Date(value).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Smooth height animation without measuring: grid rows 0fr -> 1fr. */
function Collapse({ open, children }) {
    return (
        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} inert={!open}>
            <div className="overflow-hidden">{children}</div>
        </div>
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

function ValuePreview({ revision, value, large = false }) {
    if (revision.type === 'image') {
        return value ? (
            <img src={`/${value}`} alt="" className={`${large ? 'h-24 w-40' : 'h-10 w-16'} rounded-lg border border-admin-border bg-white object-cover`} />
        ) : (
            <span className="text-admin-muted">—</span>
        );
    }

    return <span className="text-sm text-admin-text-secondary">{large ? value || '—' : truncate(value)}</span>;
}

export default function Historique({ revisions }) {
    const { t } = useTranslations();
    const typeMeta = {
        text: { label: t('admin.contenu.type_text', 'Texte'), icon: Type },
        icon: { label: t('admin.contenu.type_icon', 'Icône'), icon: Shapes },
        image: { label: t('admin.contenu.type_image', 'Image'), icon: ImageIcon },
    };

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [sort, setSort] = useState({ field: 'created_at', dir: 'desc' });
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [restoringId, setRestoringId] = useState(null);

    const authorName = (revision) => revision.user?.name ?? t('admin.historique.system', 'Système');

    const stats = useMemo(() => {
        const today = dayKey(new Date());
        const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
        return {
            today: revisions.filter((r) => dayKey(r.created_at) === today).length,
            week: revisions.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
            authors: new Set(revisions.map(authorName)).size,
            keys: new Set(revisions.map((r) => r.content_key)).size,
        };
    }, [revisions]);

    const typeCounts = useMemo(() => {
        const counts = { all: revisions.length, text: 0, icon: 0, image: 0 };
        revisions.forEach((r) => {
            counts[r.type] = (counts[r.type] ?? 0) + 1;
        });
        return counts;
    }, [revisions]);

    const authors = useMemo(() => [...new Set(revisions.map(authorName))].sort((a, b) => a.localeCompare(b)), [revisions]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const direction = sort.dir === 'asc' ? 1 : -1;
        const valueOf = (r) => (sort.field === 'user' ? authorName(r) : r[sort.field] ?? '');

        return revisions
            .filter((r) => typeFilter === 'all' || r.type === typeFilter)
            .filter((r) => userFilter === 'all' || authorName(r) === userFilter)
            .filter((r) => !term || r.content_key.toLowerCase().includes(term) || (r.type !== 'image' && (r.content_value_fr ?? '').toLowerCase().includes(term)))
            .sort((a, b) => String(valueOf(a)).localeCompare(String(valueOf(b)), undefined, { numeric: true }) * direction);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revisions, search, typeFilter, userFilter, sort]);

    useEffect(() => setPage(1), [search, typeFilter, userFilter, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function toggleSort(field) {
        setSort((current) => (current.field === field ? { field, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: field === 'created_at' ? 'desc' : 'asc' }));
    }

    function restore(revision) {
        setRestoringId(revision.id);
        router.post(`/console/content/${revision.id}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => setConfirmId(null),
            onFinish: () => setRestoringId(null),
        });
    }

    const statCards = [
        [CalendarClock, t('admin.historique.stat_today', "Aujourd'hui"), stats.today],
        [History, t('admin.historique.stat_week', '7 derniers jours'), stats.week],
        [Type, t('admin.historique.stat_keys', 'Contenus modifiés'), stats.keys],
        [Users, t('admin.historique.stat_authors', 'Contributeurs'), stats.authors],
    ];

    const filterChips = [
        ['all', t('admin.common.all', 'Tous'), History],
        ['text', typeMeta.text.label, Type],
        ['icon', typeMeta.icon.label, Shapes],
        ['image', typeMeta.image.label, ImageIcon],
    ];

    return (
        <AdminLayout
            title={t('admin.historique.title', 'Historique des modifications')}
            actions={
                <Link
                    href="/console/contenu"
                    className="flex items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm font-medium text-admin-text-secondary shadow-sm transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t('admin.historique.back_to_content', 'Retour au contenu')}
                </Link>
            }
        >
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statCards.map(([Icon, label, value]) => (
                    <div key={label} className="admin-card flex items-center gap-3 px-4 py-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-xs text-admin-text-secondary">{label}</p>
                            <p className="text-xl font-semibold leading-tight tabular-nums text-admin-text">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.historique.search_placeholder', 'Rechercher une clé ou une valeur...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-9 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch('')} aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')} className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted hover:bg-admin-hover hover:text-admin-text">
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-admin-border bg-admin-card p-1">
                    {filterChips.map(([value, label, Icon]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setTypeFilter(value)}
                            className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
                                typeFilter === value ? 'bg-admin-accent text-admin-accent-foreground shadow-sm' : 'text-admin-text-secondary hover:bg-admin-hover'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {label}
                            <span className="tabular-nums opacity-70">{typeCounts[value] ?? 0}</span>
                        </button>
                    ))}
                </div>

                <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    aria-label={t('admin.historique.modified_by', 'Modifié par')}
                    className="h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                >
                    <option value="all">{t('admin.historique.all_authors', 'Tous les auteurs')}</option>
                    {authors.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-card min-w-0 overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead>
                            <tr className="border-b border-admin-border text-left text-xs font-medium text-admin-muted">
                                <SortHeader label={t('admin.common.date', 'Date')} field="created_at" sort={sort} onSort={toggleSort} className="pl-4" />
                                <SortHeader label={t('admin.historique.key', 'Clé')} field="content_key" sort={sort} onSort={toggleSort} />
                                <SortHeader label={t('admin.common.type', 'Type')} field="type" sort={sort} onSort={toggleSort} />
                                <th className="px-3 py-3 uppercase tracking-wide">{t('admin.historique.value_before', 'Valeur (avant modification)')}</th>
                                <SortHeader label={t('admin.historique.modified_by', 'Modifié par')} field="user" sort={sort} onSort={toggleSort} />
                                <th className="w-32 px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-14 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                                <History className="h-6 w-6" aria-hidden="true" />
                                            </span>
                                            <span className="text-admin-muted">{t('admin.historique.empty', 'Aucune modification enregistrée pour le moment.')}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {rows.map((revision, index) => {
                                const meta = typeMeta[revision.type];
                                const TypeIcon = meta.icon;
                                const expanded = expandedId === revision.id;
                                const confirming = confirmId === revision.id;
                                const newDay = sort.field === 'created_at' && (index === 0 || dayKey(rows[index - 1].created_at) !== dayKey(revision.created_at));

                                return (
                                    <Fragment key={revision.id}>
                                        {newDay && (
                                            <tr className="bg-admin-hover/40">
                                                <td colSpan={6} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-admin-muted">
                                                    {dayLabel(revision.created_at)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr
                                            onClick={() => setExpandedId(expanded ? null : revision.id)}
                                            style={{ animationDelay: `${index * 35}ms` }}
                                            className={`animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-backwards cursor-pointer border-b border-admin-border/60 shadow-[inset_3px_0_0_transparent] transition-all duration-200 hover:bg-admin-hover/60 hover:shadow-[inset_3px_0_0_var(--color-admin-accent)] ${expanded ? 'bg-admin-accent/5 shadow-[inset_3px_0_0_var(--color-admin-accent)]' : ''}`}
                                        >
                                            <td className="whitespace-nowrap py-3 pl-4 pr-3">
                                                <p className="text-sm text-admin-text">{formatDateTime(revision.created_at)}</p>
                                                <p className="text-xs text-admin-muted">{relativeTime(revision.created_at)}</p>
                                            </td>
                                            <td className="px-3 py-3 font-mono text-xs text-admin-text">{revision.content_key}</td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${typeStyles[revision.type]}`}>
                                                    <TypeIcon className="h-3 w-3" aria-hidden="true" />
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="max-w-xs px-3 py-3">
                                                <ValuePreview revision={revision} value={revision.content_value_fr} />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-admin-accent/15 text-xs font-semibold text-admin-accent">
                                                        {authorName(revision).charAt(0).toUpperCase()}
                                                    </span>
                                                    <span className="truncate text-sm text-admin-text-secondary">{authorName(revision)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmId(confirmId === revision.id ? null : revision.id);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-text-secondary transition hover:border-admin-accent/40 hover:bg-admin-accent/10 hover:text-admin-accent"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {t('admin.historique.restore', 'Restaurer')}
                                                    </button>
                                                    <ChevronDown className={`h-4 w-4 text-admin-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                                                </div>
                                            </td>
                                        </tr>

                                        <tr className={expanded ? 'border-b border-admin-border/60 bg-admin-accent/5' : ''}>
                                            <td colSpan={6} className="p-0">
                                                <Collapse open={expanded}>
                                                    <div className="grid gap-3 px-4 py-4 md:grid-cols-3">
                                                        {[
                                                            ['FR', revision.content_value_fr],
                                                            ['EN', revision.content_value_en],
                                                            ['MG', revision.content_value_mg],
                                                        ].map(([lang, value]) => (
                                                            <div key={lang} className="rounded-lg border border-admin-border bg-admin-card p-3">
                                                                <p className="mb-1.5 text-xs font-semibold tracking-wide text-admin-muted">{lang}</p>
                                                                <div className="break-words">
                                                                    <ValuePreview revision={revision} value={value} large />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>

                                        <tr className={confirming ? 'border-b border-admin-border/60 bg-amber-500/5' : ''}>
                                            <td colSpan={6} className="p-0">
                                                <Collapse open={confirming}>
                                                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                                        <p className="text-sm text-admin-text">
                                                            {t('admin.historique.confirm_restore', 'Restaurer « :key » à son état du :date ?')
                                                                .replace(':key', revision.content_key)
                                                                .replace(':date', formatDateTime(revision.created_at))}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setConfirmId(null)} className={ghostButton}>
                                                                {t('admin.common.cancel', 'Annuler')}
                                                            </button>
                                                            <button type="button" onClick={() => restore(revision)} disabled={restoringId === revision.id} className={primaryButton}>
                                                                <RotateCcw className={`h-4 w-4 ${restoringId === revision.id ? 'animate-spin' : ''}`} aria-hidden="true" />
                                                                {t('admin.historique.restore', 'Restaurer')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border px-4 py-3 text-sm text-admin-text-secondary">
                    <span>
                        {filtered.length} {t('admin.historique.version_suffix', 'version(s)')} —{' '}
                        {revisions.length >= 200
                            ? t('admin.historique.last_200', '200 dernières modifications')
                            : t('admin.historique.full_history', 'historique complet')}
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
        </AdminLayout>
    );
}
