import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';

const ROLE_LABELS = {
    'super-admin': 'Super Admin',
    enseignant: 'Enseignant',
    scolarite: 'Scolarité',
    'responsable-materiel': 'Matériel',
    etudiant: 'Étudiant',
};

const ACTION_VARIANTS = {
    role_changed: 'default',
    role_permissions_updated: 'default',
    user_activated: 'success',
    user_deactivated: 'danger',
    preinscription_approved: 'success',
};

function formatDateTime(value) {
    return new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ logs }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return logs;
        return logs.filter(
            (log) => log.description.toLowerCase().includes(term) || (log.user_name ?? '').toLowerCase().includes(term),
        );
    }, [logs, search]);

    return (
        <AdminLayout title="Journal d'activité">
            <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-admin-text-secondary">
                    {filtered.length} entrée(s) — {logs.length >= 200 ? '200 dernières actions' : 'historique complet'}
                </p>
                <div className="relative w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par utilisateur ou action..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>IP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-admin-muted">
                                    Aucune activité pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-sm text-admin-text-secondary">
                                    {formatDateTime(log.created_at)}
                                </TableCell>
                                <TableCell className="font-medium">{log.user_name ?? 'Système'}</TableCell>
                                <TableCell>
                                    {log.user_role && <Badge variant="outline">{ROLE_LABELS[log.user_role] ?? log.user_role}</Badge>}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={ACTION_VARIANTS[log.action] ?? 'default'}>{log.action}</Badge>
                                        <span className="text-sm text-admin-text">{log.description}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-admin-muted">{log.ip_address ?? '—'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
