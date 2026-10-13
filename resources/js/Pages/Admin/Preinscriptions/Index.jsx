import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ClipboardCheck,
    Download,
    FilePen,
    FileSearch,
    GraduationCap,
    Inbox,
    Mail,
    Phone,
    Search,
    Send,
    UserPlus,
} from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import { Avatar, AvatarFallback, AvatarImage } from '../../../Components/ui/avatar';
import { buttonVariants } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { cn } from '../../../lib/utils';
import { useTranslations } from '../../../lib/useTranslations';

const STATUS_LABELS = {
    en_attente: 'Soumis',
    en_cours_examen: "En cours d'examen",
    a_completer: 'À compléter',
};

const STATUS_STYLES = {
    en_attente: { badge: 'bg-sky-500/10 text-sky-600 ring-sky-500/20', dot: 'bg-sky-500' },
    en_cours_examen: { badge: 'bg-amber-500/10 text-amber-600 ring-amber-500/20', dot: 'bg-amber-500' },
    a_completer: { badge: 'bg-rose-500/10 text-rose-600 ring-rose-500/20', dot: 'bg-rose-500' },
};

const FALLBACK_STYLE = { badge: 'bg-admin-hover text-admin-text-secondary ring-admin-border', dot: 'bg-admin-muted' };

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] ?? FALLBACK_STYLE;

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', style.badge)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, tone }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm">
            <span className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', tone)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-admin-text">{value}</p>
                <p className="mt-1 truncate text-xs font-medium text-admin-text-secondary">{label}</p>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, hint, compact = false }) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-dashed border-admin-border bg-admin-card text-center',
                compact ? 'px-6 py-8' : 'px-6 py-14',
            )}
        >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-accent/10 text-admin-accent">
                <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold text-admin-text">{title}</p>
            {hint && <p className="mt-1 max-w-sm text-xs text-admin-muted">{hint}</p>}
        </div>
    );
}

export default function Index({ preinscriptions, brouillons }) {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [view, setView] = useState('list');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return preinscriptions;
        return preinscriptions.filter(
            (p) =>
                p.nom?.toLowerCase().includes(term) ||
                p.prenoms?.toLowerCase().includes(term) ||
                p.email?.toLowerCase().includes(term) ||
                p.numero_dossier?.toLowerCase().includes(term) ||
                p.filiere?.nom_fr?.toLowerCase().includes(term),
        );
    }, [preinscriptions, search]);

    const countByStatus = (status) => preinscriptions.filter((p) => p.status === status).length;

    const examineLabel = t('preinscriptions_admin.examiner', 'Examiner le dossier');

    return (
        <AdminLayout title={t('preinscriptions_admin.titre', 'Préinscriptions en attente')}>
            <div className="-mt-4 mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    icon={Inbox}
                    label={t('preinscriptions_admin.stat_total', 'Dossiers à traiter')}
                    value={preinscriptions.length}
                    tone="bg-admin-accent/10 text-admin-accent"
                />
                <StatCard
                    icon={Send}
                    label={t('preinscriptions_admin.stat_soumis', 'Soumis')}
                    value={countByStatus('en_attente')}
                    tone="bg-sky-500/10 text-sky-600"
                />
                <StatCard
                    icon={FileSearch}
                    label={t('preinscriptions_admin.stat_examen', "En cours d'examen")}
                    value={countByStatus('en_cours_examen')}
                    tone="bg-amber-500/10 text-amber-600"
                />
                <StatCard
                    icon={UserPlus}
                    label={t('preinscriptions_admin.stat_comptes', 'Comptes sans dossier')}
                    value={brouillons.length}
                    tone="bg-emerald-500/10 text-emerald-600"
                />
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-admin-text-secondary">
                    <span className="font-semibold text-admin-text">{filtered.length}</span>{' '}
                    {t('preinscriptions_admin.dossiers_a_traiter', 'dossier(s) à traiter.')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('preinscriptions_admin.search_placeholder', 'Rechercher par nom, e-mail, dossier...')}
                            className="rounded-full pl-10"
                        />
                    </div>
                    <ViewToggle view={view} onChange={setView} />
                    <a
                        href="/console/preinscriptions/export"
                        className={cn(buttonVariants(), 'rounded-full border border-admin-border bg-admin-card text-admin-text shadow-sm hover:bg-admin-hover')}
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {t('preinscriptions_admin.exporter', 'Exporter')}
                    </a>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title={t('preinscriptions_admin.aucune_preinscription', 'Aucune préinscription en attente.')}
                    hint={t('preinscriptions_admin.aucune_preinscription_hint', 'Les nouveaux dossiers déposés par les candidats apparaîtront ici.')}
                />
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((p) => (
                        <div
                            key={p.id}
                            className="group flex flex-col gap-4 rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg"
                        >
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-admin-accent/20">
                                    <AvatarImage src={p.photo_path ? `/storage/${p.photo_path}` : undefined} alt="" />
                                    <AvatarFallback className="bg-admin-accent/10 font-semibold text-admin-accent">{p.nom?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-admin-text">
                                        {p.nom} {p.prenoms}
                                    </p>
                                    <p className="flex items-center gap-1.5 truncate text-xs text-admin-muted">
                                        <Mail className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                        <span className="truncate">{p.email}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={p.status} />
                                {p.niveau && (
                                    <span className="rounded-full bg-admin-hover px-2.5 py-0.5 text-[11px] font-semibold text-admin-text-secondary">{p.niveau}</span>
                                )}
                            </div>

                            <div className="space-y-1.5 text-sm text-admin-text-secondary">
                                <p className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 flex-shrink-0 text-admin-muted" aria-hidden="true" />
                                    <span className="truncate">{p.filiere?.nom_fr ?? '—'}</span>
                                </p>
                                <p className="flex items-center gap-2 text-xs text-admin-muted">
                                    <CalendarDays className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    {t('preinscriptions_admin.deposee_le', 'Déposée le')} {formatDate(p.created_at)}
                                </p>
                            </div>

                            <Link
                                href={`/console/preinscriptions/${p.id}`}
                                className={cn(buttonVariants(), 'mt-auto w-full rounded-full bg-admin-text text-admin-bg hover:bg-admin-text/90')}
                            >
                                {examineLabel}
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((p) => (
                        <div
                            key={p.id}
                            className="group flex flex-col items-stretch gap-4 rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm transition hover:border-admin-accent/40 hover:shadow-lg sm:flex-row sm:items-center sm:gap-5 sm:p-5"
                        >
                            <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-admin-accent/20">
                                <AvatarImage src={p.photo_path ? `/storage/${p.photo_path}` : undefined} alt="" />
                                <AvatarFallback className="bg-admin-accent/10 font-semibold text-admin-accent">{p.nom?.[0]}</AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-admin-text">
                                        {p.nom} {p.prenoms}
                                    </p>
                                    <StatusBadge status={p.status} />
                                </div>

                                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-admin-text-secondary">
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="h-4 w-4 text-admin-muted" aria-hidden="true" />
                                        {p.filiere?.nom_fr ?? '—'}
                                        {p.niveau && <span className="font-semibold text-admin-text"> · {p.niveau}</span>}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-admin-muted" aria-hidden="true" />
                                        {p.email}
                                    </span>
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 text-xs text-admin-muted">
                                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                                    {t('preinscriptions_admin.deposee_le', 'Déposée le')} {formatDate(p.created_at)}
                                </p>
                            </div>

                            <Link
                                href={`/console/preinscriptions/${p.id}`}
                                className={cn(buttonVariants(), 'flex-shrink-0 rounded-full bg-admin-text text-admin-bg hover:bg-admin-text/90')}
                            >
                                {examineLabel}
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <section className="mt-12">
                <div className="mb-4 flex items-start gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                        <UserPlus className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-base font-semibold text-admin-text">
                            {t('preinscriptions_admin.comptes_ouverts', 'Comptes créés depuis le formulaire')}
                        </h2>
                        <p className="mt-0.5 text-sm text-admin-text-secondary">
                            {t(
                                'preinscriptions_admin.comptes_ouverts_texte',
                                'Candidats ayant ouvert un compte sans avoir envoyé leur dossier. Rien à traiter ici — la liste sert au suivi.',
                            )}
                        </p>
                    </div>
                </div>

                {brouillons.length === 0 ? (
                    <EmptyState compact icon={ClipboardCheck} title={t('preinscriptions_admin.aucun_compte_ouvert', 'Aucun compte en attente de dépôt.')} />
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-admin-hover/60 text-xs uppercase tracking-wide text-admin-muted">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">{t('preinscriptions_admin.col_candidat', 'Candidat')}</th>
                                    <th className="px-5 py-3 font-semibold">{t('preinscriptions_admin.col_email', 'E-mail')}</th>
                                    <th className="px-5 py-3 font-semibold">{t('preinscriptions_admin.col_telephone', 'Téléphone')}</th>
                                    <th className="px-5 py-3 font-semibold">{t('preinscriptions_admin.col_cree_le', 'Compte créé le')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brouillons.map((b) => (
                                    <tr key={b.id} className="border-t border-admin-border transition hover:bg-admin-hover/50">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-admin-accent/10 text-xs font-semibold text-admin-accent">{b.nom?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-admin-text">
                                                    {b.nom} {b.prenoms}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-admin-text-secondary">{b.email}</td>
                                        <td className="px-5 py-3.5 text-admin-text-secondary">
                                            {b.telephone ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                    {b.telephone}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-admin-muted">{formatDate(b.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
