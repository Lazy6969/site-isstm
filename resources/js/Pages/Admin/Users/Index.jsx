import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Search, Ban, CheckCircle2, Pencil } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Badge } from '../../../Components/ui/badge';
import { Select } from '../../../Components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '../../../Components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { useTranslations } from '../../../lib/useTranslations';
import EditUserProfileDialog from '../../../Components/Admin/EditUserProfileDialog';

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

export default function Index({ users, roles }) {
    const { props } = usePage();
    const { t } = useTranslations();
    const ROLE_LABELS = roleLabels(t);
    const currentUserId = props.auth?.user?.id;
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
    }, [users, search]);

    function changeRole(user, role) {
        if (!role || role === user.role) return;
        router.put(`/console/users/${user.id}/role`, { role }, { preserveScroll: true });
    }

    function toggleActive(user) {
        const verb = user.is_active
            ? t('admin.users.deactivate_verb', 'désactiver')
            : t('admin.users.reactivate_verb', 'réactiver');
        if (
            !confirm(
                t('admin.users.confirm_toggle', 'Voulez-vous vraiment :verb le compte de « :name » ?')
                    .replace(':verb', verb)
                    .replace(':name', user.name),
            )
        )
            return;
        router.post(`/console/users/${user.id}/toggle-active`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.users.title', 'Utilisateurs')}>
            <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-admin-text-secondary">
                    {filtered.length} {t('admin.users.count_suffix', 'utilisateur(s)')}
                </p>
                <div className="relative w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.users.search_placeholder', 'Rechercher par nom ou email...')}
                        className="pl-9"
                    />
                </div>
            </div>

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
                                    {t('admin.users.empty', 'Aucun utilisateur trouvé.')}
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((user) => {
                            const isSelf = user.id === currentUserId;
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                {user.avatar_path && <AvatarImage src={`/storage/${user.avatar_path}`} alt="" />}
                                                <AvatarFallback>{initials(user.name)}</AvatarFallback>
                                            </Avatar>
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
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="inline-flex items-center gap-1.5 rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover"
                                                aria-label={`${t('admin.users.edit_profile', 'Modifier le profil de')} ${user.name}`}
                                            >
                                                <Pencil className="h-4 w-4" aria-hidden="true" />
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <EditUserProfileDialog open={editingUser !== null} onClose={() => setEditingUser(null)} user={editingUser} />
        </AdminLayout>
    );
}
