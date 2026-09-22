import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Images } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Textarea } from '../../../Components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';
import PhotosDialog from './PhotosDialog';

const emptyForm = {
    bloc_key: '',
    nom: '',
    signification: '',
    fondation: '',
    fondateurs: '',
    slogan: '',
    objectifs: '',
    activites: '',
    danse: '',
    mampiavaka: '',
};

export default function Index({ blocs }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [photosBloc, setPhotosBloc] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(bloc) {
        setEditing(bloc);
        form.setData({
            bloc_key: bloc.bloc_key,
            nom: bloc.nom,
            signification: bloc.signification ?? '',
            fondation: bloc.fondation ?? '',
            fondateurs: bloc.fondateurs ?? '',
            slogan: bloc.slogan ?? '',
            objectifs: bloc.objectifs ?? '',
            activites: bloc.activites ?? '',
            danse: bloc.danse ?? '',
            mampiavaka: bloc.mampiavaka ?? '',
        });
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/campus/${editing.id}`, { onSuccess, preserveScroll: true });
        } else {
            form.post('/console/campus', { onSuccess, preserveScroll: true });
        }
    }

    function destroy(bloc) {
        if (!confirm(`Supprimer le bloc « ${bloc.nom} » ?`)) return;
        router.delete(`/console/campus/${bloc.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Campus">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">{blocs.length} bloc(s)</p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Nouveau bloc
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bloc</TableHead>
                            <TableHead>Clé</TableHead>
                            <TableHead>Fondation</TableHead>
                            <TableHead>Photos</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blocs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-admin-muted">
                                    Aucun bloc pour le moment.
                                </TableCell>
                            </TableRow>
                        )}
                        {blocs.map((bloc) => (
                            <TableRow key={bloc.id}>
                                <TableCell className="font-medium">{bloc.nom}</TableCell>
                                <TableCell className="text-admin-text-secondary">{bloc.bloc_key}</TableCell>
                                <TableCell>{bloc.fondation ?? '—'}</TableCell>
                                <TableCell>{(bloc.images ?? []).length}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => setPhotosBloc(bloc)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Photos de ${bloc.nom}`}
                                        >
                                            <Images className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => openEdit(bloc)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`Modifier ${bloc.nom}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(bloc)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`Supprimer ${bloc.nom}`}
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
                        <DialogTitle>{editing ? 'Modifier le bloc' : 'Nouveau bloc'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="bloc_key">Clé (identifiant d'URL)</Label>
                                <Input
                                    id="bloc_key"
                                    value={form.data.bloc_key}
                                    onChange={(e) => form.setData('bloc_key', e.target.value)}
                                    placeholder="bloc-a"
                                    className="mt-1.5"
                                />
                                {form.errors.bloc_key && <p className="mt-1 text-sm text-red-500">{form.errors.bloc_key}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nom">Nom</Label>
                                <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                                {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="signification">Signification (optionnel)</Label>
                            <Textarea
                                id="signification"
                                value={form.data.signification}
                                onChange={(e) => form.setData('signification', e.target.value)}
                                rows={2}
                                className="mt-1.5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="fondation">Fondation (optionnel)</Label>
                                <Input
                                    id="fondation"
                                    value={form.data.fondation}
                                    onChange={(e) => form.setData('fondation', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="fondateurs">Fondateurs (optionnel)</Label>
                                <Input
                                    id="fondateurs"
                                    value={form.data.fondateurs}
                                    onChange={(e) => form.setData('fondateurs', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="slogan">Slogan (optionnel)</Label>
                            <Input id="slogan" value={form.data.slogan} onChange={(e) => form.setData('slogan', e.target.value)} className="mt-1.5" />
                        </div>

                        <div>
                            <Label htmlFor="objectifs">Objectifs (optionnel)</Label>
                            <Textarea
                                id="objectifs"
                                value={form.data.objectifs}
                                onChange={(e) => form.setData('objectifs', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="activites">Activités (optionnel)</Label>
                            <Textarea
                                id="activites"
                                value={form.data.activites}
                                onChange={(e) => form.setData('activites', e.target.value)}
                                rows={3}
                                className="mt-1.5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="danse">Danse (optionnel)</Label>
                                <Input id="danse" value={form.data.danse} onChange={(e) => form.setData('danse', e.target.value)} className="mt-1.5" />
                            </div>
                            <div>
                                <Label htmlFor="mampiavaka">Ce qui les distingue (optionnel)</Label>
                                <Input
                                    id="mampiavaka"
                                    value={form.data.mampiavaka}
                                    onChange={(e) => form.setData('mampiavaka', e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
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

            {photosBloc && <PhotosDialog bloc={photosBloc} onClose={() => setPhotosBloc(null)} />}
        </AdminLayout>
    );
}
