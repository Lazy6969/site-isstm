import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Lock, Pencil, Users } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Badge } from '../../../Components/ui/badge';
import { Checkbox } from '../../../Components/ui/checkbox';
import { Label } from '../../../Components/ui/label';
import { Button } from '../../../Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const ROLE_LABELS = {
    'super-admin': 'Super Admin',
    enseignant: 'Enseignant',
    scolarite: 'Scolarité',
    'responsable-materiel': 'Matériel',
    etudiant: 'Étudiant',
};

function moduleLabel(module) {
    return module
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function groupPermissions(permissions) {
    const groups = {};
    permissions.forEach((permission) => {
        const [module] = permission.split('.');
        groups[module] = groups[module] ?? [];
        groups[module].push(permission);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function Index({ roles, permissions }) {
    const [editing, setEditing] = useState(null);
    const form = useForm({ permissions: [] });
    const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

    function openEdit(role) {
        setEditing(role);
        form.setData('permissions', [...role.permissions]);
        form.clearErrors();
    }

    function togglePermission(permission) {
        const current = form.data.permissions;
        form.setData('permissions', current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]);
    }

    function submit(e) {
        e.preventDefault();
        form.put(`/console/roles/${editing.id}`, { preserveScroll: true, onSuccess: () => setEditing(null) });
    }

    return (
        <AdminLayout title="Rôles">
            <p className="mb-5 text-sm text-admin-text-secondary">{roles.length} rôle(s)</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => {
                    const isSuperAdmin = role.name === 'super-admin';
                    return (
                        <div key={role.id} className="rounded-xl border border-admin-border bg-admin-card p-5">
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-admin-text">{ROLE_LABELS[role.name] ?? role.name}</h3>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-admin-text-secondary">
                                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                        {role.users_count} utilisateur(s)
                                    </p>
                                </div>
                                {isSuperAdmin ? (
                                    <span className="rounded-lg p-2 text-admin-muted" title="Toujours toutes les permissions">
                                        <Lock className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => openEdit(role)}
                                        className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                        aria-label={`Modifier les permissions de ${role.name}`}
                                    >
                                        <Pencil className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {isSuperAdmin ? (
                                    <Badge variant="gold">Toutes les permissions</Badge>
                                ) : role.permissions.length === 0 ? (
                                    <span className="text-xs text-admin-muted">Aucune permission</span>
                                ) : (
                                    <Badge variant="outline">{role.permissions.length} permission(s)</Badge>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Permissions — {editing ? (ROLE_LABELS[editing.name] ?? editing.name) : ''}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-5">
                        {groupedPermissions.map(([module, perms]) => (
                            <div key={module}>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-admin-muted">{moduleLabel(module)}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {perms.map((permission) => (
                                        <Label key={permission} className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                                            <Checkbox
                                                checked={form.data.permissions.includes(permission)}
                                                onChange={() => togglePermission(permission)}
                                            />
                                            {permission.split('.')[1]}
                                        </Label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
