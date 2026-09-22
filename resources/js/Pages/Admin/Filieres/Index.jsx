import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Textarea } from '../../../Components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';

const emptyForm = {
    code: '',
    mention: '',
    niveaux: '',
    nom_fr: '',
    nom_en: '',
    nom_mg: '',
    description_fr: '',
    description_en: '',
    description_mg: '',
    debouches_fr: '',
    debouches_en: '',
    debouches_mg: '',
    historique_fr: '',
    historique_en: '',
    historique_mg: '',
    avantages_fr: '',
    avantages_en: '',
    avantages_mg: '',
    display_order: '',
    image: null,
};

const locales = [
    { key: 'fr', label: 'Français' },
    { key: 'en', label: 'Anglais (optionnel)' },
    { key: 'mg', label: 'Malagasy (optionnel)' },
];

function LocalizedGroup({ title, field, form, multiline = false }) {
    const Field = multiline ? Textarea : Input;

    return (
        <div className="space-y-3 rounded-lg border border-admin-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{title}</p>
            {locales.map(({ key, label }) => {
                const name = `${field}_${key}`;
                return (
                    <div key={name}>
                        <Label htmlFor={name}>{label}</Label>
                        <Field
                            id={name}
                            value={form.data[name]}
                            onChange={(e) => form.setData(name, e.target.value)}
                            rows={multiline ? 3 : undefined}
                            className="mt-1.5"
                        />
                        {form.errors[name] && <p className="mt-1 text-sm text-red-500">{form.errors[name]}</p>}
                    </div>
                );
            })}
        </div>
    );
}

export default function Index({ filieres }) {
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

    function openEdit(filiere) {
        setEditing(filiere);
        form.setData({
            code: filiere.code,
            mention: filiere.mention ?? '',
            niveaux: filiere.niveaux ?? '',
            nom_fr: filiere.nom_fr,
            nom_en: filiere.nom_en ?? '',
            nom_mg: filiere.nom_mg ?? '',
            description_fr: filiere.description_fr ?? '',
            description_en: filiere.description_en ?? '',
            description_mg: filiere.description_mg ?? '',
            debouches_fr: filiere.debouches_fr ?? '',
            debouches_en: filiere.debouches_en ?? '',
            debouches_mg: filiere.debouches_mg ?? '',
            historique_fr: filiere.historique_fr ?? '',
            historique_en: filiere.historique_en ?? '',
            historique_mg: filiere.historique_mg ?? '',
            avantages_fr: filiere.avantages_fr ?? '',
            avantages_en: filiere.avantages_en ?? '',
            avantages_mg: filiere.avantages_mg ?? '',
            display_order: filiere.display_order ?? '',
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
            form.put(`/console/filieres/${editing.id}`, { onSuccess, preserveScroll: true, forceFormData: true });
        } else {
            form.post('/console/filieres', { onSuccess, preserveScroll: true, forceFormData: true });
        }
    }

    function destroy(filiere) {
        if (!confirm(`Supprimer la filière « ${filiere.nom_fr} » ? Les classes associées seront aussi supprimées.`)) return;
        router.delete(`/console/filieres/${filiere.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Filières">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{filieres.length} filière(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouvelle filière
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
                            <TableHead>Code</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Mention</TableHead>
                            <TableHead>Niveaux</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filieres.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    Aucune filière pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {filieres.map((filiere) => (
                            <TableRow key={filiere.id}>
                                <TableCell className="font-medium">{filiere.code}</TableCell>
                                <TableCell>{filiere.nom_fr}</TableCell>
                                <TableCell>{filiere.mention ?? '—'}</TableCell>
                                <TableCell>{filiere.niveaux ?? '—'}</TableCell>
                                <TableCell>{filiere.display_order}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(filiere)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${filiere.nom_fr}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(filiere)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${filiere.nom_fr}`}
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
                        <DialogTitle>{editing ? 'Modifier la filière' : 'Nouvelle filière'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" value={form.data.code} onChange={(e) => form.setData('code', e.target.value)} className="mt-1.5" />
                                {form.errors.code && <p className="mt-1 text-sm text-red-500">{form.errors.code}</p>}
                            </div>
                            <div>
                                <Label htmlFor="mention">Mention (optionnel)</Label>
                                <Input
                                    id="mention"
                                    value={form.data.mention}
                                    onChange={(e) => form.setData('mention', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="niveaux">Niveaux (optionnel)</Label>
                                <Input
                                    id="niveaux"
                                    value={form.data.niveaux}
                                    onChange={(e) => form.setData('niveaux', e.target.value)}
                                    placeholder="L1,L2,L3"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="display_order">Ordre d'affichage</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min="0"
                                value={form.data.display_order}
                                onChange={(e) => form.setData('display_order', e.target.value)}
                                className="mt-1.5 max-w-[160px]"
                            />
                        </div>

                        <LocalizedGroup title="Nom" field="nom" form={form} />
                        <LocalizedGroup title="Description" field="description" form={form} multiline />
                        <LocalizedGroup title="Débouchés" field="debouches" form={form} multiline />
                        <LocalizedGroup title="Historique" field="historique" form={form} multiline />
                        <LocalizedGroup title="Avantages" field="avantages" form={form} multiline />

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
