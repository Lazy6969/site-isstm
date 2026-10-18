import { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Ban, CheckCircle2, Mail, Pencil, Search, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import UserProfilePanel from '../../../Components/Admin/UserProfilePanel';
import { Select } from '../../../Components/ui/select';
import { cn } from '../../../lib/utils';
import { useTranslations } from '../../../lib/useTranslations';
import { useConfirm } from '../../../lib/useConfirm';

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function roleLabels(t) {
    return {
        'super-admin': t('admin.roles.super_admin', 'Super Admin'),
        enseignant: t('admin.roles.enseignant', 'Enseignant'),
        scolarite: t('admin.roles.scolarite', 'Scolarité'),
        'responsable-materiel': t('admin.roles.materiel', 'Matériel'),
        etudiant: t('admin.roles.etudiant', 'Étudiant'),
    };
}

const ROLE_TONES = {
    'super-admin': 'bg-rose-500/10 text-rose-600 ring-rose-500/25',
    enseignant: 'bg-sky-500/10 text-sky-600 ring-sky-500/25',
    scolarite: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25',
    'responsable-materiel': 'bg-amber-500/10 text-amber-600 ring-amber-500/25',
    etudiant: 'bg-violet-500/10 text-violet-600 ring-violet-500/25',
};

function initials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function useCountUp(target, duration = 900) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || target === 0) {
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

function StatCard({ icon: Icon, label, value, tone, glow }) {
    const display = useCountUp(value);

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <span className={cn('pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl transition group-hover:scale-125', glow)} />
            <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-admin-text-secondary">{label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-admin-text">{display}</p>
                </div>
                <span className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition group-hover:rotate-6', tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
        </div>
    );
}

function UserAvatar({ user, size = 'h-11 w-11', online = false }) {
    return (
        <span className={cn('relative flex-shrink-0', size)}>
            {user.avatar_path ? (
                <img src={`/storage/${user.avatar_path}`} alt="" className={cn('rounded-full object-cover', size)} />
            ) : (
                <span className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-admin-accent to-sky-500 text-xs font-bold text-white', size)}>{initials(user.name)}</span>
            )}
            {online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-admin-card" title="En ligne" />}
        </span>
    );
}

function RolePill({ role, label }) {
    return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', ROLE_TONES[role] ?? 'bg-admin-hover text-admin-text-secondary ring-admin-border')}>{label}</span>;
}

function StatusPill({ active, t }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', active ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25' : 'bg-rose-500/10 text-rose-600 ring-rose-500/25')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-rose-500')} />
            {active ? t('admin.common.active', 'Actif') : t('admin.users.deactivated', 'Désactivé')}
        </span>
    );
}

function ActionIcons({ user, isSelf, onEdit, onToggle, t }) {
    return (
        <div className="flex items-center gap-0.5">
            <button
                type="button"
                onClick={onEdit}
                title={t('admin.users.edit_profile', 'Modifier le profil de')}
                aria-label={`${t('admin.users.edit_profile', 'Modifier le profil de')} ${user.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-admin-text-secondary transition hover:scale-110 hover:bg-admin-accent/10 hover:text-admin-accent"
            >
                <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={onToggle}
                disabled={isSelf}
                title={user.is_active ? t('admin.users.deactivate', 'Désactiver') : t('admin.users.reactivate', 'Réactiver')}
                aria-label={user.is_active ? `${t('admin.users.deactivate', 'Désactiver')} ${user.name}` : `${t('admin.users.reactivate', 'Réactiver')} ${user.name}`}
                className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-admin-text-secondary transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100',
                    user.is_active ? 'hover:bg-rose-500/10 hover:text-rose-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500',
                )}
            >
                {user.is_active ? <Ban className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            </button>
        </div>
    );
}

export default function Index({ users, roles }) {
    const confirmAction = useConfirm();
    const { props } = usePage();
    const { t } = useTranslations();
    const ROLE_LABELS = roleLabels(t);
    const currentUserId = props.auth?.user?.id;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);

    const now = Date.now();
    const isOnline = (user) => user.last_activity && now - new Date(user.last_activity).getTime() < ONLINE_WINDOW_MS;

    const stats = useMemo(
        () => ({
            total: users.length,
            active: users.filter((user) => user.is_active).length,
            inactive: users.filter((user) => !user.is_active).length,
            staff: users.filter((user) => user.role && user.role !== 'etudiant').length,
        }),
        [users],
    );

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return users.filter((user) => {
            if (roleFilter && user.role !== roleFilter) return false;
            if (statusFilter === 'active' && !user.is_active) return false;
            if (statusFilter === 'inactive' && user.is_active) return false;
            if (!term) return true;

            return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
        });
    }, [users, search, roleFilter, statusFilter]);

    const editing = users.find((user) => user.id === editingId) ?? null;

    function changeRole(user, role) {
        if (!role || role === user.role) return;
        router.put(`/console/users/${user.id}/role`, { role }, { preserveScroll: true });
    }

    async function toggleActive(user) {
        const verb = user.is_active
            ? t('admin.users.deactivate_verb', 'désactiver')
            : t('admin.users.reactivate_verb', 'réactiver');
        if (!(await confirmAction({ message: t('admin.users.confirm_toggle', 'Voulez-vous vraiment :verb le compte de « :name » ?')
                    .replace(':verb', verb)
                    .replace(':name', user.name), tone: 'warning', title: 'Confirmer cette action ?', confirmLabel: 'Confirmer' }))) return;
        router.post(`/console/users/${user.id}/toggle-active`, {}, { preserveScroll: true });
    }

    const roleSelect = (user, isSelf, className) => (
        <Select value={user.role ?? ''} disabled={isSelf} onChange={(e) => changeRole(user, e.target.value)} className={className}>
            <option value="" disabled>
                {t('admin.users.no_role', 'Aucun rôle')}
            </option>
            {roles.map((role) => (
                <option key={role} value={role}>
                    {ROLE_LABELS[role] ?? role}
                </option>
            ))}
        </Select>
    );

    const statusChips = [
        ['', t('admin.users.filter_all', 'Tous')],
        ['active', t('admin.common.active', 'Actifs')],
        ['inactive', t('admin.users.deactivated', 'Désactivés')],
    ];

    return (
        <AdminLayout title={t('admin.users.title', 'Utilisateurs')}>
            <div className="-mt-2 mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={Users} label={t('admin.users.stat_total', 'Utilisateurs')} value={stats.total} tone="bg-admin-accent/15 text-admin-accent" glow="from-admin-accent/25" />
                <StatCard icon={UserCheck} label={t('admin.users.stat_actifs', 'Comptes actifs')} value={stats.active} tone="bg-emerald-500/15 text-emerald-500" glow="from-emerald-500/25" />
                <StatCard icon={UserX} label={t('admin.users.stat_inactifs', 'Désactivés')} value={stats.inactive} tone="bg-rose-500/15 text-rose-500" glow="from-rose-500/25" />
                <StatCard icon={ShieldCheck} label={t('admin.users.stat_equipe', 'Équipe (hors étudiants)')} value={stats.staff} tone="bg-sky-500/15 text-sky-500" glow="from-sky-500/25" />
            </div>

            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-60 flex-1 sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.users.search_placeholder', 'Rechercher par nom ou email...')}
                            className="h-10 w-full rounded-full border border-admin-border bg-admin-card pl-10 pr-4 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                        />
                    </div>
                    <div className="flex rounded-full bg-admin-hover p-0.5" role="group">
                        {statusChips.map(([key, label]) => (
                            <button
                                key={key || 'all'}
                                type="button"
                                onClick={() => setStatusFilter(key)}
                                aria-pressed={statusFilter === key}
                                className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition', statusFilter === key ? 'bg-admin-card text-admin-text shadow-sm' : 'text-admin-text-secondary hover:text-admin-text')}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <p className="text-sm text-admin-text-secondary">
                            <span className="font-bold text-admin-text">{filtered.length}</span> {t('admin.users.count_suffix', 'utilisateur(s)')}
                        </p>
                        <ViewToggle view={view} onChange={setView} />
                    </div>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    <button type="button" onClick={() => setRoleFilter('')} aria-pressed={roleFilter === ''} className={cn('flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition', roleFilter === '' ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'border border-admin-border bg-admin-card text-admin-text-secondary hover:bg-admin-hover')}>
                        {t('admin.users.all_roles', 'Tous les rôles')}
                    </button>
                    {roles.map((role) => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                            aria-pressed={roleFilter === role}
                            className={cn('flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition', roleFilter === role ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'border border-admin-border bg-admin-card text-admin-text-secondary hover:bg-admin-hover')}
                        >
                            {ROLE_LABELS[role] ?? role}
                            <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', roleFilter === role ? 'bg-white/25' : 'bg-admin-hover')}>{users.filter((user) => user.role === role).length}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={cn('grid gap-5', editing && 'xl:grid-cols-[minmax(0,1fr)_420px]')}>
                <div className={cn('min-w-0', editing && 'hidden xl:block')}>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-admin-border bg-admin-card px-6 py-14 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-accent/10 text-admin-accent">
                                <Users className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <p className="mt-4 text-sm font-semibold text-admin-text">{t('admin.users.empty', 'Aucun utilisateur trouvé.')}</p>
                        </div>
                    ) : view === 'grid' ? (
                        <ul className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', !editing && '2xl:grid-cols-3')}>
                            {filtered.map((user) => {
                                const isSelf = user.id === currentUserId;

                                return (
                                    <li
                                        key={user.id}
                                        className={cn(
                                            'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card p-4 pt-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-admin-accent/40 hover:shadow-xl hover:shadow-admin-accent/5',
                                            editingId === user.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border',
                                        )}
                                    >
                                        <span className={cn('absolute inset-x-0 top-0 h-1', user.is_active ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-orange-400')} aria-hidden="true" />
                                        <div className="flex items-start gap-3">
                                            <UserAvatar user={user} size="h-12 w-12" online={isOnline(user)} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-admin-text">
                                                    {user.name} {isSelf && <span className="text-xs font-medium text-admin-muted">{t('admin.users.you', '(vous)')}</span>}
                                                </p>
                                                <p className="flex items-center gap-1 truncate text-xs text-admin-text-secondary">
                                                    <Mail className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                                    <span className="truncate">{user.email}</span>
                                                </p>
                                            </div>
                                            <StatusPill active={user.is_active} t={t} />
                                        </div>
                                        {roleSelect(user, isSelf, 'w-full')}
                                        <p className="flex justify-between text-[11px] text-admin-muted">
                                            <span>
                                                {t('admin.users.last_login', 'Dernière connexion')} : <span className="font-semibold text-admin-text-secondary">{formatDate(user.last_activity)}</span>
                                            </span>
                                            <span>
                                                {t('admin.users.created_at', 'Créé le')} {formatDate(user.created_at)}
                                            </span>
                                        </p>
                                        <div className="mt-auto flex items-center justify-between border-t border-admin-border pt-2.5">
                                            <RolePill role={user.role} label={user.role ? (ROLE_LABELS[user.role] ?? user.role) : t('admin.users.no_role', 'Aucun rôle')} />
                                            <ActionIcons user={user} isSelf={isSelf} onEdit={() => setEditingId(user.id)} onToggle={() => toggleActive(user)} t={t} />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <ul className="space-y-2.5">
                            {filtered.map((user) => {
                                const isSelf = user.id === currentUserId;

                                return (
                                    <li
                                        key={user.id}
                                        className={cn(
                                            'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card py-3 pl-5 pr-3 shadow-sm transition hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg lg:flex-row lg:items-center',
                                            editingId === user.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border',
                                        )}
                                    >
                                        <span className={cn('absolute inset-y-0 left-0 w-1', user.is_active ? 'bg-emerald-500' : 'bg-rose-500')} aria-hidden="true" />
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <UserAvatar user={user} online={isOnline(user)} />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-admin-text">
                                                    {user.name} {isSelf && <span className="text-xs font-medium text-admin-muted">{t('admin.users.you', '(vous)')}</span>}
                                                </p>
                                                <p className="truncate text-xs text-admin-text-secondary">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="lg:w-44">{roleSelect(user, isSelf, 'w-full')}</div>
                                        <div className="lg:w-24">
                                            <StatusPill active={user.is_active} t={t} />
                                        </div>
                                        <div className="text-xs text-admin-text-secondary lg:w-32">
                                            <p>{formatDate(user.last_activity)}</p>
                                            <p className="text-[11px] text-admin-muted">
                                                {t('admin.users.created_at', 'Créé le')} {formatDate(user.created_at)}
                                            </p>
                                        </div>
                                        <ActionIcons user={user} isSelf={isSelf} onEdit={() => setEditingId(user.id)} onToggle={() => toggleActive(user)} t={t} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {editing && (
                    <div className="min-w-0 xl:sticky xl:top-20 xl:self-start">
                        <UserProfilePanel
                            key={editing.id}
                            user={editing}
                            roleLabel={editing.role ? (ROLE_LABELS[editing.role] ?? editing.role) : t('admin.users.no_role', 'Aucun rôle')}
                            isSelf={editing.id === currentUserId}
                            onClose={() => setEditingId(null)}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
