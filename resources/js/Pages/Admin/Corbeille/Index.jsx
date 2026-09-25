import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { RotateCcw, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Select } from '../../../Components/ui/select';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';

function formatDate(value) {
    if (!value) return '—';

    return new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Index({ items }) {
    const [typeFilter, setTypeFilter] = useState('');

    const types = useMemo(() => {
        const seen = new Map();
        items.forEach((item) => seen.set(item.type, item.label));

        return Array.from(seen, ([type, label]) => ({ type, label }));
    }, [items]);

    const visibleItems = typeFilter ? items.filter((item) => item.type === typeFilter) : items;

    function restore(item) {
        router.post(`/console/corbeille/${item.type}/${item.id}/restaurer`, {}, { preserveScroll: true });
    }

    function forceDelete(item) {
        if (!confirm(`Supprimer définitivement « ${item.title} » ? Cette action est irréversible et efface aussi le fichier associé.`)) return;
        router.delete(`/console/corbeille/${item.type}/${item.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Corbeille">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-admin-text-secondary">
                    {items.length} élément(s) supprimé(s) — restaurables ou effaçables définitivement.
                </p>
                {types.length > 1 && (
                    <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-56">
                        <option value="">Tous les types</option>
                        {types.map((t) => (
                            <option key={t.type} value={t.type}>
                                {t.label}
                            </option>
                        ))}
                    </Select>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Élément</TableHead>
                            <TableHead>Supprimé le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-admin-muted">
                                    La corbeille est vide.
                                </TableCell>
                            </TableRow>
                        )}
                        {visibleItems.map((item) => (
                            <TableRow key={`${item.type}-${item.id}`}>
                                <TableCell>
                                    <Badge variant="outline">{item.label}</Badge>
                                </TableCell>
                                <TableCell className="text-admin-text">{item.title}</TableCell>
                                <TableCell className="text-admin-muted">{formatDate(item.deleted_at)}</TableCell>
                                <TableCell className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => restore(item)}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-600"
                                        aria-label={`Restaurer ${item.title}`}
                                    >
                                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => forceDelete(item)}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600"
                                        aria-label={`Supprimer définitivement ${item.title}`}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
