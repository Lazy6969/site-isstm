import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2, FileText } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = { title: '', category: 'public', file: null };

const categoryLabels = { public: 'Public', etudiant: 'Étudiants' };

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Index({ documents }) {
    const { flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(document) {
        setEditing(document);
        form.setData({ title: document.title, category: document.category, file: null });
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/documents/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/documents', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(document) {
        if (!confirm(`Supprimer le document « ${document.title} » ?`)) return;
        router.delete(`/console/documents/${document.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Documents">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{documents.length} document(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouveau document
                </Button>
            </div>

            {flash?.status && (
                <p className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {flash.status}
                </p>
            )}

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Ajouté le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-admin-muted">
                                    Aucun document pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {documents.map((document) => (
                            <TableRow key={document.id}>
                                <TableCell className="font-medium">
                                    <a
                                        href={`/${document.file_path}`}
                                        target="_blank"
                                        rel="noopener"
                                        className="flex items-center gap-2 hover:underline"
                                    >
                                        <FileText className="h-4 w-4 flex-shrink-0 text-admin-muted" aria-hidden="true" />
                                        {document.title}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <Badge>{categoryLabels[document.category] ?? document.category}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(document.created_at)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(document)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${document.title}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(document)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${document.title}`}
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Modifier le document' : 'Nouveau document'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Titre</Label>
                            <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" />
                            {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                        </div>

                        <div>
                            <Label htmlFor="category">Catégorie</Label>
                            <Select
                                id="category"
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="public">Public</option>
                                <option value="etudiant">Étudiants</option>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="file">Fichier{editing ? ' (laisser vide pour conserver le fichier actuel)' : ''}</Label>
                            {editing && (
                                <a
                                    href={`/${editing.file_path}`}
                                    target="_blank"
                                    rel="noopener"
                                    className="mt-1 block text-sm text-admin-text-secondary hover:underline"
                                >
                                    Fichier actuel
                                </a>
                            )}
                            <input
                                id="file"
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                                className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                            />
                            {form.errors.file && <p className="mt-1 text-sm text-red-500">{form.errors.file}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                {editing ? 'Enregistrer' : 'Créer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
