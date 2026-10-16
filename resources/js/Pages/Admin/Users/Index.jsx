import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Search, Ban, CheckCircle2, Pencil, Key, Mail, Phone, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Badge } from '../../../Components/ui/badge';
import { Select } from '../../../Components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '../../../Components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { useTranslations } from '../../../lib/useTranslations';
import EditUserProfileDialog from '../../../Components/Admin/EditUserProfileDialog';
import ResetPasswordDialog from '../../../Components/Admin/ResetPasswordDialog';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import { useConfirm } from '../../../lib/useConfirm';

function roleLabels(t) {
    return {
        'super-admin': t('admin.roles.super_admin', 'Super Admin'),
        enseignant: t('admin.roles.enseignant', 'Enseignant'),
        scolarite: t('admin.roles.scolarite', 'Scolarité'),
        'responsable-materiel': t('admin.roles.materiel', 'Matériel'),
        etudiant: t('admin.roles.etudiant', 'Étudiant'),
    };
}

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OnlineDot({ online, t }) {
    return (
        <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-admin-card ${online ? 'bg-emerald-500' : 'bg-admin-muted'}`}
            title={online ? t('admin.users.online', 'En ligne') : t('admin.users.offline', 'Hors ligne')}
            aria-label={online ? t('admin.users.online', 'En ligne') : t('admin.users.offline', 'Hors ligne')}
        />
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
    const [view, setView] = useState('list');
    const [editingUser, setEditingUser] = useState(null);
    const [resettingUser, setResettingUser] = useState(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesTerm =
                !term ||
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.phone ?? '').toLowerCase().includes(term);
            const matchesRole = !roleFilter || user.role === roleFilter;
            return matchesTerm && matchesRole;
        });
    }, [users, search, roleFilter]);

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

    async function destroyUser(user) {
        if (!(await confirmAction({
            message: t(
                'admin.users.confirm_delete',
                'Supprimer définitivement le compte de « :name » ? Toutes ses données (dossier, messages, publications, demandes...) seront effacées.',
            ).replace(':name', user.name),
            details: user.email,
            tone: 'danger',
            title: t('admin.users.confirm_delete_title', 'Action irréversible'),
            confirmLabel: t('admin.common.delete', 'Supprimer'),
        }))) return;
        router.delete(`/console/users/${user.id}`, { preserveScroll: true });
    }

    function telHref(phone) {
        return `tel:${phone.replace(/[^0-9+]/g, '')}`;
    }

    function RowActions({ user, isSelf }) {
        return (
            <div className="flex items-center justify-end gap-1">
                <a
                    href={`mailto:${user.email}`}
                    className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover"
                    aria-label={`${t('admin.users.send_email', 'Envoyer un e-mail à')} ${user.name}`}
                >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                </a>
                {user.phone && (
                    <a
                        href={telHref(user.phone)}
                        className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover"
                        aria-label={`${t('admin.users.call', 'Appeler')} ${user.name}`}
                    >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                    </a>
                )}
                <button
                    onClick={() => setEditingUser(user)}
                    className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover"
                    aria-label={`${t('admin.users.edit_profile', 'Modifier le profil de')} ${user.name}`}
                >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                    onClick={() => setResettingUser(user)}
                    className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover"
                    aria-label={`${t('admin.users.reset_password', 'Réinitialiser le mot de passe de')} ${user.name}`}
                >
                    <Key className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                    onClick={() => toggleActive(user)}
                    disabled={isSelf}
                    className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={
                        user.is_active
                            ? `${t('admin.users.deactivate', 'Désactiver')} ${user.name}`
                            : `${t('admin.users.reactivate', 'Réactiver')} ${user.name}`
                    }
                >
                    {user.is_active ? (
                        <Ban className="h-4 w-4 hover:text-red-500" aria-hidden="true" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 hover:text-emerald-500" aria-hidden="true" />
                    )}
                </button>
                <button
                    onClick={() => destroyUser(user)}
                    disabled={isSelf}
                    className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`${t('admin.users.delete', 'Supprimer le compte de')} ${user.name}`}
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        );
    }

    return (
        <AdminLayout title={t('admin.users.title', 'Comptes')}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-admin-text-secondary">
                    {filtered.length} {t('admin.users.count_suffix', 'compte(s)')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.users.search_placeholder', 'Rechercher par nom, email ou téléphone...')}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-44">
                        <option value="">{t('admin.users.all_roles', 'Tous les rôles')}</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>
                                {ROLE_LABELS[role] ?? role}
                            </option>
                        ))}
                    </Select>
                    <ViewToggle view={view} onChange={setView} />
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.length === 0 && (
                        <div className="col-span-full rounded-xl border border-admin-border bg-admin-card py-8 text-center text-sm text-admin-muted">
                            {t('admin.users.empty', 'Aucun compte trouvé.')}
                        </div>
                    )}
                    {filtered.map((user) => {
                        const isSelf = user.id === currentUserId;
                        return (
                            <div key={user.id} className="flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-card p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <Avatar>
                                            {user.avatar_path && <AvatarImage src={`/storage/${user.avatar_path}`} alt="" />}
                                            <AvatarFallback>{initials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <OnlineDot online={user.is_online} t={t} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-admin-text">
                                            {user.name} {isSelf && <span className="text-admin-muted">{t('admin.users.you', '(vous)')}</span>}
                                        </p>
                                        <p className="truncate text-xs text-admin-text-secondary">{user.email}</p>
                                        {user.phone && <p className="truncate text-xs text-admin-muted">{user.phone}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <Select
                                        value={user.role ?? ''}
                                        disabled={isSelf}
                                        onChange={(e) => changeRole(user, e.target.value)}
                                        className="w-full"
                                    >
                                        <option value="" disabled>
                                            {t('admin.users.no_role', 'Aucun rôle')}
                                        </option>
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_LABELS[role] ?? role}
                                            </option>
                                        ))}
                                    </Select>
                                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                                        {user.is_active ? t('admin.common.active', 'Actif') : t('admin.users.deactivated', 'Désactivé')}
                                    </Badge>
                                </div>
                                <p className="text-xs text-admin-muted">
                                    {t('admin.users.last_login', 'Dernière connexion')} : {formatDate(user.last_activity)}
                                </p>
                                <div className="mt-auto flex items-center justify-end gap-1 border-t border-admin-border pt-3">
                                    <RowActions user={user} isSelf={isSelf} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('admin.users.user', 'Utilisateur')}</TableHead>
                                <TableHead>{t('admin.users.role', 'Rôle')}</TableHead>
                                <TableHead>{t('admin.common.status', 'Statut')}</TableHead>
                                <TableHead>{t('admin.users.last_login', 'Dernière connexion')}</TableHead>
                                <TableHead>{t('admin.users.created_at', 'Créé le')}</TableHead>
                                <TableHead className="text-right">{t('admin.common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                        {t('admin.users.empty', 'Aucun compte trouvé.')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((user) => {
                                const isSelf = user.id === currentUserId;
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <Avatar>
                                                        {user.avatar_path && <AvatarImage src={`/storage/${user.avatar_path}`} alt="" />}
                                                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <OnlineDot online={user.is_online} t={t} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-admin-text">
                                                        {user.name} {isSelf && <span className="text-admin-muted">{t('admin.users.you', '(vous)')}</span>}
                                                    </p>
                                                    <p className="text-xs text-admin-text-secondary">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role ?? ''}
                                                disabled={isSelf}
                                                onChange={(e) => changeRole(user, e.target.value)}
                                                className="w-44"
                                            >
                                                <option value="" disabled>
                                                    {t('admin.users.no_role', 'Aucun rôle')}
                                                </option>
                                                {roles.map((role) => (
                                                    <option key={role} value={role}>
                                                        {ROLE_LABELS[role] ?? role}
                                                    </option>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? 'success' : 'danger'}>
                                                {user.is_active ? t('admin.common.active', 'Actif') : t('admin.users.deactivated', 'Désactivé')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-admin-text-secondary">{formatDate(user.last_activity)}</TableCell>
                                        <TableCell className="text-sm text-admin-text-secondary">{formatDate(user.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <RowActions user={user} isSelf={isSelf} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            <EditUserProfileDialog open={editingUser !== null} onClose={() => setEditingUser(null)} user={editingUser} />
            <ResetPasswordDialog open={resettingUser !== null} onClose={() => setResettingUser(null)} user={resettingUser} />
        </AdminLayout>
    );
}
