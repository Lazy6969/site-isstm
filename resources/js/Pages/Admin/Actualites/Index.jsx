import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { Checkbox } from '../../../Components/ui/checkbox';
import { Badge } from '../../../Components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = {
    news_category_id: '',
    title: '',
    excerpt: '',
    content: '',
    author: '',
    status: 'brouillon',
    is_featured: false,
    image: null,
};

const statutVariants = { brouillon: 'default', en_attente: 'warning', publie: 'success', rejete: 'danger', archive: 'outline' };
const statutLabels = { brouillon: 'Brouillon', en_attente: 'En attente', publie: 'Publié', rejete: 'Rejeté', archive: 'Archivé' };

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Index({ articles, categories }) {
    const { props } = usePage();
    const canPublish = (props.auth?.permissions ?? []).includes('news.publish');
    const statusOptions = canPublish
        ? [
              { value: 'brouillon', label: 'Brouillon' },
              { value: 'publie', label: 'Publié' },
              { value: 'archive', label: 'Archivé' },
          ]
        : [
              { value: 'brouillon', label: 'Brouillon' },
              { value: 'en_attente', label: 'Soumettre pour validation' },
          ];

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [rejecting, setRejecting] = useState(null);
    const form = useForm(emptyForm);
    const rejectForm = useForm({ rejection_reason: '' });

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function openEdit(article) {
        setEditing(article);
        form.setData({
            news_category_id: article.news_category_id ? String(article.news_category_id) : '',
            title: article.title,
            excerpt: article.excerpt ?? '',
            content: article.content ?? '',
            author: article.author ?? '',
            status: article.status,
            is_featured: article.is_featured,
            image: null,
        });
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function onImageChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/actualites/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/actualites', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(article) {
        if (!confirm(`Supprimer l'article « ${article.title} » ?`)) return;
        router.delete(`/console/actualites/${article.id}`, { preserveScroll: true });
    }

    function approve(article) {
        if (!confirm(`Valider et publier l'article « ${article.title} » ?`)) return;
        router.post(`/console/actualites/${article.id}/approve`, {}, { preserveScroll: true });
    }

    function submitRejection(e) {
        e.preventDefault();
        rejectForm.post(`/console/actualites/${rejecting.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setRejecting(null);
                rejectForm.reset();
            },
        });
    }

    return (
        <AdminLayout title="Actualités">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{articles.length} article(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvel article
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Auteur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Publié le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucun article pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {articles.map((article) => (
                            <TableRow key={article.id}>
                                <TableCell className="font-medium">{article.title}</TableCell>
                                <TableCell>{article.category?.name_fr ?? '—'}</TableCell>
                                <TableCell>{article.author ?? '—'}</TableCell>
                                <TableCell>
                                    <Badge variant={statutVariants[article.status]}>{statutLabels[article.status]}</Badge>
                                    {article.status === 'rejete' && article.rejection_reason && (
                                        <p className="mt-1 max-w-xs text-xs text-admin-muted">{article.rejection_reason}</p>
                                    )}
                                </TableCell>
                                <TableCell>{formatDate(article.published_at)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {canPublish && article.status === 'en_attente' && (
                                            <>
                                                <button
                                                    onClick={() => approve(article)}
                                                    className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-500"
                                                    aria-label={`Valider ${article.title}`}
                                                >
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                                <button
                                                    onClick={() => setRejecting(article)}
                                                    className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-500"
                                                    aria-label={`Rejeter ${article.title}`}
                                                >
                                                    <X className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => openEdit(article)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${article.title}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(article)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${article.title}`}
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
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Modifier l'article" : 'Nouvel article'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Titre</Label>
                            <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" />
                            {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="news_category_id">Catégorie</Label>
                                <Select
                                    id="news_category_id"
                                    value={form.data.news_category_id}
                                    onChange={(e) => form.setData('news_category_id', e.target.value)}
                                    className="mt-1.5"
                                >
                                    <option value="">Aucune</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name_fr}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status">Statut</Label>
                                <Select id="status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className="mt-1.5">
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="author">Auteur (optionnel)</Label>
                            <Input id="author" value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} className="mt-1.5" />
                        </div>

                        <div>
                            <Label htmlFor="excerpt">Résumé (optionnel)</Label>
                            <Textarea
                                id="excerpt"
                                value={form.data.excerpt}
                                onChange={(e) => form.setData('excerpt', e.target.value)}
                                rows={2}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="content">Contenu (optionnel)</Label>
                            <Textarea
                                id="content"
                                value={form.data.content}
                                onChange={(e) => form.setData('content', e.target.value)}
                                rows={6}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="image">Image (optionnel)</Label>
                            {(preview || (editing && editing.image_path)) && (
                                <img
                                    src={preview ?? `/${editing.image_path}`}
                                    alt=""
                                    className="mt-1.5 h-32 w-full rounded-lg border border-admin-border object-cover"
                                />
                            )}
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                            />
                            {form.errors.image && <p className="mt-1 text-sm text-red-500">{form.errors.image}</p>}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-admin-text-secondary">
                            <Checkbox checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} />
                            Mettre en avant
                        </label>

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

            <Dialog open={rejecting !== null} onOpenChange={(isOpen) => !isOpen && setRejecting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeter « {rejecting?.title} »</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitRejection} className="space-y-4">
                        <div>
                            <Label htmlFor="rejection_reason">Raison du rejet</Label>
                            <Textarea
                                id="rejection_reason"
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                            {rejectForm.errors.rejection_reason && (
                                <p className="mt-1 text-sm text-red-500">{rejectForm.errors.rejection_reason}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setRejecting(null)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={rejectForm.processing} className="bg-red-600 text-white hover:bg-red-600/90">
                                Rejeter
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
