import { useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, History, RotateCcw, Search, Type, Image as ImageIcon, Shapes } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';

const typeMeta = {
    text: { label: 'Texte', icon: Type, variant: 'default' },
    icon: { label: 'Icône', icon: Shapes, variant: 'gold' },
    image: { label: 'Image', icon: ImageIcon, variant: 'success' },
};

function truncate(value, max = 70) {
    if (!value) return '—';
    return value.length > max ? `${value.slice(0, max)}…` : value;
}

function formatDateTime(value) {
    return new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function previewFor(revision) {
    if (revision.type === 'image') return revision.content_value_fr ? `/${revision.content_value_fr}` : null;
    return truncate(revision.content_value_fr);
}

export default function Historique({ revisions }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return revisions;
        return revisions.filter((revision) => revision.content_key.toLowerCase().includes(term));
    }, [revisions, search]);

    function restore(revision) {
        if (!confirm(`Restaurer « ${revision.content_key} » à son état du ${formatDateTime(revision.created_at)} ?`)) return;
        router.post(`/console/content/${revision.id}/restore`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout
            title="Historique des modifications"
            actions={
                <Link
                    href="/console/contenu"
                    className="flex items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm font-medium text-admin-text-secondary shadow-sm transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Retour au contenu
                </Link>
            }
        >
            <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-admin-text-secondary">
                    {filtered.length} version(s) — {revisions.length >= 200 ? '200 dernières modifications' : 'historique complet'}
                </p>
                <div className="relative w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une clé..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Clé</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Valeur (avant modification)</TableHead>
                            <TableHead>Modifié par</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-admin-muted">
                                        <History className="h-6 w-6" aria-hidden="true" />
                                        <p className="text-sm">Aucune modification enregistrée pour le moment.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((revision) => {
                            const meta = typeMeta[revision.type];
                            const TypeIcon = meta.icon;
                            const preview = previewFor(revision);

                            return (
                                <TableRow key={revision.id}>
                                    <TableCell className="whitespace-nowrap text-sm text-admin-text-secondary">
                                        {formatDateTime(revision.created_at)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-admin-text">{revision.content_key}</TableCell>
                                    <TableCell>
                                        <Badge variant={meta.variant}>
                                            <TypeIcon className="h-3 w-3" aria-hidden="true" />
                                            {meta.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        {revision.type === 'image' && preview ? (
                                            <img src={preview} alt="" className="h-10 w-16 rounded border border-admin-border object-cover" />
                                        ) : (
                                            <span className="text-sm text-admin-text-secondary">{preview ?? '—'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-admin-text-secondary">{revision.user?.name ?? 'Système'}</TableCell>
                                    <TableCell className="text-right">
                                        <button
                                            onClick={() => restore(revision)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-text-secondary transition hover:border-admin-accent/40 hover:bg-admin-accent/10 hover:text-admin-accent"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                            Restaurer
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
