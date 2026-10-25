import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUp, CalendarDays, ChevronLeft, ChevronRight, Download, Eye, FileText, History, LayoutGrid, Search, Share2, TrendingUp, UserCheck, UserX } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { cn } from '../../../lib/utils';
import { useTranslations } from '../../../lib/useTranslations';
import DateRangeFilter from '../../../Components/Admin/DateRangeFilter';
import { useDateRange } from '../../../lib/dateRange';
import FilterPanel from '../../../Components/Admin/FilterPanel';

const PAGE_SIZE = 10;

function formatDateTime(value) {
    if (!value) return '—';

    return new Date(value).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function initialsOf(name) {
    return (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

/**
 * Counts from 0 up to `target` with an ease-out curve. Honours the visitor's
 * "reduce motion" setting by jumping straight to the final value.
 */
function useCountUp(target, duration = 1100) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || target === 0) {
            setValue(target);
            return undefined;
        }

        let frame;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

/** True one frame after mount — lets width/opacity transitions play on first paint. */
function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);
    return mounted;
}

const DOWNLOAD_ICON_CSS = `
@keyframes dl-arrow { 0%, 100% { transform: translateY(-3px); opacity: 0.55; } 50% { transform: translateY(3px); opacity: 1; } }
@keyframes dl-ring { 0% { transform: scale(1); opacity: 0.45; } 100% { transform: scale(1.55); opacity: 0; } }
@keyframes dl-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.dl-arrow { animation: dl-arrow 1.6s ease-in-out infinite; }
.dl-ring { animation: dl-ring 2.4s ease-out infinite; }
.dl-float { animation: dl-float 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .dl-arrow, .dl-ring, .dl-float { animation: none; } }
`;

/** Hero download icon: the arrow keeps dropping into the tray, with a soft pulse ring behind and a gentle float. */
function AnimatedDownloadIcon() {
    return (
        <span className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center" aria-hidden="true">
            <style>{DOWNLOAD_ICON_CSS}</style>
            <span className="dl-ring absolute inset-0 rounded-3xl bg-white/30" />
            <span className="dl-float relative flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <g className="dl-arrow">
                        <path d="M7 10l5 5 5-5" />
                        <path d="M12 15V3" />
                    </g>
                </svg>
            </span>
        </span>
    );
}

function AnimatedNumber({ value }) {
    const display = useCountUp(value);
    return <span className="tabular-nums">{display.toLocaleString('fr-FR')}</span>;
}

const STAT_TONES = {
    accent: { icon: 'bg-admin-accent/15 text-admin-accent', glow: 'from-admin-accent/20' },
    sky: { icon: 'bg-sky-500/15 text-sky-500', glow: 'from-sky-500/20' },
    amber: { icon: 'bg-amber-500/15 text-amber-500', glow: 'from-amber-500/20' },
    emerald: { icon: 'bg-emerald-500/15 text-emerald-500', glow: 'from-emerald-500/20' },
};

function StatCard({ icon: Icon, label, value, tone, index, mounted }) {
    const style = STAT_TONES[tone];

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl',
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: mounted ? `${index * 80}ms` : '0ms' }}
        >
            <div className={cn('pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl transition group-hover:scale-125', style.glow)} />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-secondary">{label}</p>
                    <p className="mt-1 text-3xl font-bold leading-none text-admin-text">
                        <AnimatedNumber value={value} />
                    </p>
                </div>
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-2xl transition group-hover:rotate-6 group-hover:scale-110', style.icon)}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
            </div>
        </div>
    );
}

function ActivityChart({ daily, t }) {
    const mounted = useMounted();
    const max = Math.max(1, ...daily.map((day) => day.count));
    const total = daily.reduce((sum, day) => sum + day.count, 0);

    return (
        <section className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold text-admin-text">
                    <TrendingUp className="h-5 w-5 text-admin-accent" aria-hidden="true" />
                    {t('admin.telechargements.activite', 'Activité des 14 derniers jours')}
                </h2>
                <span className="rounded-full bg-admin-accent/10 px-2.5 py-0.5 text-xs font-semibold text-admin-accent">
                    {total} {t('admin.telechargements.telechargements', 'téléchargement(s)')}
                </span>
            </div>
            <div className="flex h-36 items-end gap-1.5 sm:gap-2">
                {daily.map((day, index) => {
                    const height = day.count === 0 ? 4 : Math.max(10, (day.count / max) * 100);
                    const label = new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                    return (
                        <div key={day.date} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                            <span className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-md bg-admin-text px-2 py-1 text-[11px] font-medium text-admin-bg opacity-0 shadow transition group-hover:opacity-100">
                                {label} · {day.count}
                            </span>
                            <div
                                className={cn(
                                    'w-full rounded-t-lg transition-all duration-700 ease-out',
                                    day.count === 0 ? 'bg-admin-hover' : 'bg-gradient-to-t from-admin-accent to-admin-accent/50 group-hover:brightness-110',
                                )}
                                style={{ height: mounted ? `${height}%` : '0%', transitionDelay: `${index * 35}ms` }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-admin-muted">
                <span>{new Date(daily[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                <span>{t('admin.telechargements.aujourdhui_court', "Aujourd'hui")}</span>
            </div>
        </section>
    );
}

/** Small icon with its total underneath — one per tracked action on a document. */
function MiniCounter({ icon: Icon, value, label, tone }) {
    return (
        <div className="flex w-12 flex-col items-center gap-1" title={label + ' : ' + value}>
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl transition hover:scale-110', tone)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold leading-none text-admin-text">
                <AnimatedNumber value={value} />
            </span>
        </div>
    );
}

const RANK_STYLES = [
    'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30',
    'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/30',
    'bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-orange-500/30',
];

function DocumentRanking({ documents, t, limit = null }) {
    const mounted = useMounted();
    const shown = limit ? documents.slice(0, limit) : documents;
    const maxCount = Math.max(1, ...documents.map((document) => document.downloads_count));

    return (
        <section className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold text-admin-text">
                    <FileText className="h-5 w-5 text-admin-accent" aria-hidden="true" />
                    {t('admin.telechargements.par_document', 'Par document')}
                </h2>
                <Link href="/console/documents" className="text-xs font-semibold text-admin-accent transition hover:underline">
                    {t('admin.telechargements.gerer_documents', 'Gérer les documents')}
                </Link>
            </div>

            {documents.length === 0 ? (
                <p className="py-6 text-center text-sm text-admin-muted">{t('admin.telechargements.aucun_document', 'Aucun document pour le moment.')}</p>
            ) : (
                <ul className="space-y-1">
                    {shown.map((document, index) => (
                        <li key={document.id} className="rounded-xl p-3 transition hover:bg-admin-hover/60">
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-md',
                                        document.downloads_count > 0 && RANK_STYLES[index] ? RANK_STYLES[index] : 'bg-admin-hover text-admin-text-secondary shadow-none',
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="truncate text-sm font-semibold text-admin-text">{document.title}</p>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-admin-hover">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-admin-accent to-admin-accent/50 transition-all duration-1000 ease-out"
                                            style={{ width: mounted ? `${(document.downloads_count / maxCount) * 100}%` : '0%', transitionDelay: `${index * 90}ms` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-admin-muted">
                                        {document.unique_downloaders} {t('admin.telechargements.utilisateurs', 'utilisateur(s)')}
                                        {' · '}
                                        {t('admin.telechargements.dernier', 'dernier :')} {formatDateTime(document.last_downloaded_at)}
                                    </p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2" aria-label={t('admin.telechargements.compteurs', 'Compteurs du document')}>
                                    <MiniCounter icon={Download} value={document.downloads_count} label={t('admin.telechargements.compteur_telechargements', 'Téléchargements')} tone="text-admin-accent bg-admin-accent/10" />
                                    <MiniCounter icon={Eye} value={document.views_count} label={t('admin.telechargements.compteur_vues', 'Vues / consultations')} tone="text-sky-500 bg-sky-500/10" />
                                    <MiniCounter icon={Share2} value={document.shares_count} label={t('admin.telechargements.compteur_partages', 'Partages')} tone="text-emerald-500 bg-emerald-500/10" />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function Downloads({ downloads, documents, stats, daily }) {
    const { t } = useTranslations();
    const mounted = useMounted();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const listTop = useRef(null);
    const [tab, setTab] = useState('apercu');
    const [showTop, setShowTop] = useState(false);

    const tabs = [
        { key: 'apercu', label: t('admin.telechargements.onglet_apercu', "Vue d'ensemble"), icon: LayoutGrid },
        { key: 'documents', label: t('admin.telechargements.onglet_documents', 'Documents'), icon: FileText, count: documents.length },
        { key: 'historique', label: t('admin.telechargements.onglet_historique', 'Historique'), icon: History, count: downloads.length },
    ];

    function changeTab(next) {
        setTab(next);
        setPage(1);
    }

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const range = useDateRange();
    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const inRange = downloads.filter((download) => range.matches(download.created_at));
        if (!term) return inRange;

        return inRange.filter(
            (download) =>
                download.document_title?.toLowerCase().includes(term) ||
                download.user_name?.toLowerCase().includes(term) ||
                download.user_email?.toLowerCase().includes(term) ||
                download.ip_address?.toLowerCase().includes(term),
        );
    }, [downloads, search, range]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function goTo(next) {
        setPage(next);
        listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <AdminLayout title={t('admin.telechargements.titre', 'Suivi des téléchargements')}>
            <div className="sticky top-[68px] z-20 -mx-4 -mt-4 mb-5 bg-admin-bg px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div
                className={cn(
                    'relative mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-admin-accent via-admin-accent/80 to-sky-500 p-4 text-white shadow-lg transition duration-700 sm:px-6',
                    mounted ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
                )}
            >
                <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/80">{t('admin.telechargements.sur_mesure', "Vue d'ensemble")}</p>
                        <h2 className="mt-0.5 text-xl font-bold sm:text-2xl">
                            <AnimatedNumber value={stats.total} /> {t('admin.telechargements.telechargements', 'téléchargement(s)')}
                        </h2>
                        <p className="mt-1 max-w-xl text-sm text-white/80">
                            {t('admin.telechargements.intro', 'Suivez en temps réel quels documents sont téléchargés, par qui et quand.')}
                        </p>
                    </div>
                    <AnimatedDownloadIcon />
                </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard index={0} mounted={mounted} tone="accent" icon={Download} label={t('admin.telechargements.stat_total', 'Au total')} value={stats.total} />
                <StatCard index={1} mounted={mounted} tone="sky" icon={CalendarDays} label={t('admin.telechargements.stat_today', "Aujourd'hui")} value={stats.today} />
                <StatCard index={2} mounted={mounted} tone="amber" icon={TrendingUp} label={t('admin.telechargements.stat_week', '7 derniers jours')} value={stats.last_7_days} />
                <StatCard index={3} mounted={mounted} tone="emerald" icon={UserCheck} label={t('admin.telechargements.stat_users', 'Utilisateurs identifiés')} value={stats.identified_users} />
            </div>

            <nav
                className="flex gap-1 overflow-x-auto rounded-full border border-admin-border bg-admin-card/90 p-1.5 shadow-md backdrop-blur"
                aria-label={t('admin.telechargements.sections', 'Sections')}
            >
                {tabs.map(({ key, label, icon: Icon, count }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => changeTab(key)}
                        aria-current={tab === key ? 'page' : undefined}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
                            tab === key ? 'bg-admin-accent text-admin-accent-foreground shadow-md shadow-admin-accent/30' : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text',
                        )}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                        {count !== undefined && (
                            <span className={cn('rounded-full px-2 py-0.5 text-[11px]', tab === key ? 'bg-white/20' : 'bg-admin-hover')}>{count}</span>
                        )}
                    </button>
                ))}
            </nav>
            </div>

            {tab === 'apercu' && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <ActivityChart daily={daily} t={t} />
                    <div>
                        <DocumentRanking documents={documents} t={t} limit={3} />
                        {documents.length > 3 && (
                            <button
                                type="button"
                                onClick={() => changeTab('documents')}
                                className="mt-3 w-full rounded-full border border-admin-border bg-admin-card py-2 text-sm font-semibold text-admin-accent shadow-sm transition hover:bg-admin-hover"
                            >
                                {t('admin.telechargements.voir_tous_documents', 'Voir les {n} documents').replace('{n}', documents.length)}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {tab === 'documents' && <DocumentRanking documents={documents} t={t} />}

            {tab === 'historique' && (
            <section ref={listTop} className="scroll-mt-36">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-admin-text">
                        <History className="h-5 w-5 text-admin-accent" aria-hidden="true" />
                        {t('admin.telechargements.historique', 'Qui a téléchargé quoi')}
                        <span className="rounded-full bg-admin-accent/10 px-2.5 py-0.5 text-xs font-semibold text-admin-accent">{filtered.length}</span>
                    </h2>
                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder={t('admin.telechargements.recherche', 'Rechercher un nom, un document, une IP...')}
                            className="rounded-full pl-10"
                        />
                    </div>
                </div>

                <FilterPanel activeCount={Number(range.active)} search={search} onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}>
                <DateRangeFilter range={range} label={t('admin.dates.download_date', 'Date du téléchargement')} />
                </FilterPanel>

                {visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-admin-border bg-admin-card px-6 py-14 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-admin-accent/10 text-admin-accent">
                            <Download className="h-8 w-8" aria-hidden="true" />
                        </span>
                        <p className="mt-4 text-sm font-semibold text-admin-text">{t('admin.telechargements.aucun', 'Aucun téléchargement enregistré.')}</p>
                        <p className="mt-1 max-w-sm text-xs text-admin-muted">
                            {t('admin.telechargements.aucun_hint', 'Chaque téléchargement depuis le site public apparaîtra ici avec son auteur et sa date.')}
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {visible.map((download) => (
                            <li
                                key={download.id}
                                className="group flex flex-col gap-3 rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg sm:flex-row sm:items-center sm:gap-5"
                            >
                                <span
                                    className={cn(
                                        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                        download.user_name ? 'bg-gradient-to-br from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'bg-admin-hover text-admin-text-secondary',
                                    )}
                                    aria-hidden="true"
                                >
                                    {download.user_name ? initialsOf(download.user_name) : <UserX className="h-5 w-5" />}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-admin-text">{download.document_title ?? '—'}</p>
                                    <p className="mt-0.5 truncate text-xs text-admin-text-secondary">
                                        {download.user_name ? (
                                            <>
                                                <span className="font-medium text-admin-text">{download.user_name}</span> · {download.user_email}
                                            </>
                                        ) : (
                                            t('admin.telechargements.visiteur', 'Visiteur anonyme')
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-shrink-0 items-center gap-2 text-xs sm:flex-col sm:items-end sm:gap-1">
                                    <span className="rounded-full bg-admin-hover px-2.5 py-0.5 font-mono text-[11px] text-admin-text-secondary">{download.ip_address ?? '—'}</span>
                                    <span className="text-admin-muted">{formatDateTime(download.created_at)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {pageCount > 1 && (
                    <div className="mt-5 flex items-center justify-between text-sm text-admin-text-secondary">
                        <span>
                            {t('admin.telechargements.page', 'Page')} {currentPage} / {pageCount}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => goTo(currentPage - 1)}
                                className="flex items-center gap-1 rounded-full border border-admin-border bg-admin-card px-4 py-2 font-medium shadow-sm transition hover:bg-admin-hover disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                {t('admin.telechargements.precedent', 'Précédent')}
                            </button>
                            <button
                                type="button"
                                disabled={currentPage === pageCount}
                                onClick={() => goTo(currentPage + 1)}
                                className="flex items-center gap-1 rounded-full border border-admin-border bg-admin-card px-4 py-2 font-medium shadow-sm transition hover:bg-admin-hover disabled:opacity-40"
                            >
                                {t('admin.telechargements.suivant', 'Suivant')}
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </section>
            )}

            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label={t('admin.telechargements.haut', 'Retour en haut')}
                className={cn(
                    'fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent text-admin-accent-foreground shadow-lg shadow-admin-accent/30 transition-all duration-300 hover:-translate-y-1',
                    showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
                )}
            >
                <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </button>
        </AdminLayout>
    );
}
