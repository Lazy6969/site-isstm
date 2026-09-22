import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = {
    nom: '',
    site_url: '',
    display_order: '',
    logo: null,
};

export default function Index({ partenaires }) {
    const { flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function openEdit(partenaire) {
        setEditing(partenaire);
        form.setData({
            nom: partenaire.nom,
            site_url: partenaire.site_url ?? '',
            display_order: partenaire.display_order ?? '',
            logo: null,
        });
        form.clearErrors();
        setPreview(null);
        setOpen(true);
    }

    function onLogoChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('logo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/partenaires/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/partenaires', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(partenaire) {
        if (!confirm(`Supprimer le partenaire « ${partenaire.nom} » ?`)) return;
        router.delete(`/console/partenaires/${partenaire.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Partenaires">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{partenaires.length} partenaire(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouveau partenaire
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
                            <TableHead>Logo</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partenaires.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-admin-muted">
                                    Aucun partenaire pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {partenaires.map((partenaire) => (
                            <TableRow key={partenaire.id}>
                                <TableCell>
                                    {partenaire.logo_path ? (
                                        <img
                                            src={`/${partenaire.logo_path}`}
                                            alt=""
                                            className="h-10 w-10 rounded-lg border border-admin-border object-contain bg-white"
                                        />
                                    ) : (
                                        <span className="text-admin-muted">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{partenaire.nom}</TableCell>
                                <TableCell>
                                    {partenaire.site_url ? (
                                        <a
                                            href={partenaire.site_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-admin-text underline underline-offset-2 hover:text-admin-text-secondary"
                                        >
                                            {partenaire.site_url}
                                        </a>
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>
                                <TableCell>{partenaire.display_order ?? '—'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(partenaire)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${partenaire.nom}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(partenaire)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${partenaire.nom}`}
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
                        <DialogTitle>{editing ? 'Modifier le partenaire' : 'Nouveau partenaire'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="nom">Nom</Label>
                            <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                            {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                        </div>

                        <div>
                            <Label htmlFor="site_url">Site web (optionnel)</Label>
                            <Input
                                id="site_url"
                                type="url"
                                value={form.data.site_url}
                                onChange={(e) => form.setData('site_url', e.target.value)}
                                className="mt-1.5"
                                placeholder="https://..."
                            />
                            {form.errors.site_url && <p className="mt-1 text-sm text-red-500">{form.errors.site_url}</p>}
                        </div>

                        <div>
                            <Label htmlFor="logo">Logo (optionnel)</Label>
                            {(preview || (editing && editing.logo_path)) && (
                                <img
                                    src={preview ?? `/${editing.logo_path}`}
                                    alt=""
                                    className="mt-1.5 h-24 w-24 rounded-lg border border-admin-border bg-white object-contain"
                                />
                            )}
                            <input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={onLogoChange}
                                className="mt-1.5 block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                            />
                            {form.errors.logo && <p className="mt-1 text-sm text-red-500">{form.errors.logo}</p>}
                        </div>

                        <div>
                            <Label htmlFor="display_order">Ordre d'affichage (optionnel)</Label>
                            <Input
                                id="display_order"
                                type="number"
                                value={form.data.display_order}
                                onChange={(e) => form.setData('display_order', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.display_order && <p className="mt-1 text-sm text-red-500">{form.errors.display_order}</p>}
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
