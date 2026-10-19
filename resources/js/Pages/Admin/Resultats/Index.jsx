import { useEffect, useRef, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Archive, Download, FileUp, FolderArchive, Pencil, Plus, Search, Trash2, Upload, XOctagon } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../Components/ui/dialog';
import { useTranslations } from '../../../lib/useTranslations';
import { useConfirm } from '../../../lib/useConfirm';

const BASE_URL = '/console/scolarite/resultats';
const emptyForm = { nom: '', prenoms: '', niveau: '', filiere_id: '', date: '' };
const CURRENT_YEAR = new Date().getFullYear();

const selectClass =
    'h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

/** Only the filters that are actually set, as a query string ("" when none). */
function queryString(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') params.set(key, value);
    });
    const query = params.toString();
    return query ? `?${query}` : '';
}

/** Only the year is ever shown or edited for a résultat — the server still
 * stores a full date (1 January of that year) and sends it back as a full
 * ISO timestamp, so these pull just the year out in both directions. */
function formatYear(value) {
    return value ? String(new Date(value).getFullYear()) : '—';
}

function toYearInputValue(value) {
    return value ? String(new Date(value).getFullYear()) : '';
}

function yearToDate(year) {
    return year ? `${year}-01-01` : null;
}

function ImportDialog({ open, onClose }) {
    const { t } = useTranslations();
    const form = useForm({ file: null });

    useEffect(() => {
        if (open) {
            form.setData('file', null);
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        form.post(`${BASE_URL}/import`, { preserveScroll: true, forceFormData: true, onSuccess: onClose });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('admin.resultats.importer_titre', 'Importer des résultats')}</DialogTitle>
                    <DialogDescription>
                        {t(
                            'admin.resultats.importer_aide',
                            'Fichier Excel (.xlsx) ou CSV avec les colonnes, dans cet ordre : Nom, Prénom(s), Niveau, Filière (optionnelle), Année (optionnelle). La première ligne (en-tête) est ignorée.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <a
                        href={`${BASE_URL}/modele`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-accent hover:underline"
                    >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('admin.resultats.telecharger_modele', 'Télécharger le modèle Excel')}
                    </a>

                    <input
                        type="file"
                        accept=".xlsx,.csv,.txt"
                        onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}

                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            {t('admin.common.cancel', 'Annuler')}
                        </Button>
                        <Button type="submit" disabled={form.processing || !form.data.file} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            <Upload className="h-4 w-4" aria-hidden="true" />
                            {t('admin.resultats.importer', 'Importer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/** Names and dates the dossier that "Archiver" files the active list's
 * currently displayed ids under — see ArchiveDossier's docblock. */
function ArchiveDialog({ open, onClose, ids }) {
    const { t } = useTranslations();
    const form = useForm({ nom: '', date: String(CURRENT_YEAR), ids: [] });

    useEffect(() => {
        if (open) {
            form.setData({ nom: '', date: String(CURRENT_YEAR), ids });
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, date: yearToDate(data.date) }));
        form.post(`${BASE_URL}/archives`, { preserveScroll: true, onSuccess: onClose });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('admin.resultats.archiver_titre', 'Archiver ces résultats')}</DialogTitle>
                    <DialogDescription>
                        {`Les ${ids.length} résultat(s) actuellement affichés (selon les filtres en cours) seront rangés dans ce dossier et ne seront plus visibles publiquement sur le site.`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="archive-nom">{t('admin.resultats.nom_dossier', 'Nom du dossier')}</Label>
                        <Input
                            id="archive-nom"
                            value={form.data.nom}
                            onChange={(e) => form.setData('nom', e.target.value)}
                            placeholder={t('admin.resultats.nom_dossier_exemple', 'ex. Promotion L1 - Juillet 2026')}
                            className="mt-1.5"
                            autoFocus
                        />
                        {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                    </div>

                    <div>
                        <Label htmlFor="archive-annee">{t('admin.resultats.annee', 'Année')}</Label>
                        <Input
                            id="archive-annee"
                            type="number"
                            min="2000"
                            max="2100"
                            value={form.data.date}
                            onChange={(e) => form.setData('date', e.target.value)}
                            className="mt-1.5"
                        />
                        {form.errors.date && <p className="mt-1 text-sm text-red-500">{form.errors.date}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            {t('admin.common.cancel', 'Annuler')}
                        </Button>
                        <Button type="submit" disabled={form.processing || !form.data.nom} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            <Archive className="h-4 w-4" aria-hidden="true" />
                            {t('admin.resultats.archiver', 'Archiver')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RowActions({ resultat, onEdit, onDelete, t }) {
    return (
        <div className="flex justify-end gap-1">
            <button
                onClick={() => onEdit(resultat)}
                className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                aria-label={`${t('admin.common.edit', 'Modifier')} ${resultat.nom}`}
            >
                <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                onClick={() => onDelete(resultat)}
                className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                aria-label={`${t('admin.common.delete', 'Supprimer')} ${resultat.nom}`}
            >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}

export default function Index({ resultats, filieres, niveaux = [], filters = {} }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState(filters.q ?? '');
    const [view, setView] = useState('list');
    const form = useForm(emptyForm);
    const searchTimer = useRef(null);

    const current = { filiere_id: filters.filiere_id ?? '', niveau: filters.niveau ?? '', q: filters.q ?? '' };

    function applyFilters(next) {
        router.get(`${BASE_URL}${queryString(next)}`, {}, { preserveState: true, preserveScroll: true, replace: true });
    }

    function setFilter(key, value) {
        applyFilters({ ...current, [key]: value });
    }

    useEffect(() => {
        if (search === current.q) return undefined;
        searchTimer.current = setTimeout(() => setFilter('q', search), 350);
        return () => clearTimeout(searchTimer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(resultat) {
        setEditing(resultat);
        form.setData({
            nom: resultat.nom,
            prenoms: resultat.prenoms ?? '',
            niveau: resultat.niveau ?? '',
            filiere_id: resultat.filiere_id ? String(resultat.filiere_id) : '',
            date: toYearInputValue(resultat.date),
        });
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);
        form.transform((data) => ({ ...data, date: yearToDate(data.date) }));

        if (editing) {
            form.put(`${BASE_URL}/${editing.id}`, { onSuccess, preserveScroll: true });
        } else {
            form.post(BASE_URL, { onSuccess, preserveScroll: true });
        }
    }

    async function destroy(resultat) {
        if (
            !(await confirmAction({
                message: 'Ce résultat sera placé dans la corbeille.',
                title: 'Supprimer ce résultat ?',
                details: `${resultat.nom} ${resultat.prenoms ?? ''}`,
                confirmLabel: 'Supprimer',
            }))
        ) {
            return;
        }
        router.delete(`${BASE_URL}/${resultat.id}`, { preserveScroll: true });
    }

    async function destroyAll() {
        if (
            !(await confirmAction({
                message: 'Tous les résultats (actifs et archivés, pas seulement ceux affichés par les filtres) seront placés dans la corbeille.',
                title: 'Supprimer tous les résultats ?',
                confirmLabel: 'Tout supprimer',
            }))
        ) {
            return;
        }
        router.delete(BASE_URL, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.resultats.title', 'Résultats')}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.resultats.rechercher', 'Rechercher un nom...')}
                        className={`${selectClass} w-full pr-3 pl-10 placeholder:text-admin-muted`}
                    />
                </div>

                <Select value={current.niveau} onChange={(e) => setFilter('niveau', e.target.value)} className={selectClass}>
                    <option value="">{t('admin.resultats.tous_niveaux', 'Tous les niveaux')}</option>
                    {niveaux.map((niveau) => (
                        <option key={niveau} value={niveau}>
                            {niveau}
                        </option>
                    ))}
                </Select>

                <Select value={current.filiere_id} onChange={(e) => setFilter('filiere_id', e.target.value)} className={selectClass}>
                    <option value="">{t('admin.resultats.toutes_filieres', 'Toutes les filières')}</option>
                    {filieres.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.nom_fr}
                        </option>
                    ))}
                </Select>

                <ViewToggle view={view} onChange={setView} />

                {/* Two distinct, always-visible buttons rather than one view
                    toggle: this one acts on the active list shown above
                    (archives it, a bulk write), the Link beside it only
                    navigates to a separate read page — different icons and
                    verbs so the two are never confused for each other. */}
                <Button onClick={() => setArchiving(true)} disabled={resultats.length === 0} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    {t('admin.resultats.archiver', 'Archiver')}
                </Button>
                <Link
                    href={`${BASE_URL}/archives`}
                    className="flex h-10 items-center gap-1.5 rounded-lg border border-admin-border bg-admin-card px-3 text-sm font-medium text-admin-text-secondary transition hover:text-admin-text"
                >
                    <FolderArchive className="h-4 w-4" aria-hidden="true" />
                    {t('admin.resultats.voir_archives', 'Voir les archives')}
                </Link>

                <div className="ml-auto flex items-center gap-2">
                    <Button onClick={() => setImporting(true)} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                        <FileUp className="h-4 w-4" aria-hidden="true" />
                        {t('admin.resultats.importer', 'Importer')}
                    </Button>
                    <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('admin.resultats.ajouter', 'Ajouter')}
                    </Button>
                    {resultats.length > 0 && (
                        <Button onClick={destroyAll} className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                            <XOctagon className="h-4 w-4" aria-hidden="true" />
                            {t('admin.resultats.supprimer_tout', 'Supprimer tout')}
                        </Button>
                    )}
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resultats.length === 0 && (
                        <div className="col-span-full rounded-xl border border-admin-border bg-admin-card py-8 text-center text-sm text-admin-muted">
                            {t('admin.resultats.empty', 'Aucun résultat pour le moment.')}
                        </div>
                    )}
                    {resultats.map((resultat) => (
                        <div key={resultat.id} className="flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-card p-4">
                            <div>
                                <p className="truncate font-medium text-admin-text">
                                    {resultat.nom} {resultat.prenoms}
                                </p>
                                <p className="truncate text-xs text-admin-muted">{resultat.filiere?.nom_fr ?? '—'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-admin-text-secondary">
                                {resultat.niveau && (
                                    <span className="rounded-full border border-admin-border px-2 py-0.5 text-xs">{resultat.niveau}</span>
                                )}
                                <span className="text-xs text-admin-muted">{formatYear(resultat.date)}</span>
                            </div>
                            <div className="mt-auto flex items-center justify-end border-t border-admin-border pt-3">
                                <RowActions resultat={resultat} onEdit={openEdit} onDelete={destroy} t={t} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('admin.common.name', 'Nom')}</TableHead>
                                <TableHead>{t('admin.resultats.prenoms', 'Prénom(s)')}</TableHead>
                                <TableHead>{t('admin.resultats.niveau', 'Niveau')}</TableHead>
                                <TableHead>{t('admin.resultats.filiere', 'Filière')}</TableHead>
                                <TableHead>{t('admin.resultats.annee', 'Année')}</TableHead>
                                <TableHead className="text-right">{t('admin.common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resultats.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                        {t('admin.resultats.empty', 'Aucun résultat pour le moment.')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {resultats.map((resultat) => (
                                <TableRow key={resultat.id}>
                                    <TableCell className="font-medium">{resultat.nom}</TableCell>
                                    <TableCell>{resultat.prenoms ?? '—'}</TableCell>
                                    <TableCell>{resultat.niveau ?? '—'}</TableCell>
                                    <TableCell>{resultat.filiere?.nom_fr ?? '—'}</TableCell>
                                    <TableCell>{formatYear(resultat.date)}</TableCell>
                                    <TableCell className="text-right">
                                        <RowActions resultat={resultat} onEdit={openEdit} onDelete={destroy} t={t} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? t('admin.resultats.modifier_titre', 'Modifier ce résultat') : t('admin.resultats.ajouter', 'Ajouter')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="nom">{t('admin.common.name', 'Nom')}</Label>
                            <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                            {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                        </div>

                        <div>
                            <Label htmlFor="prenoms">{t('admin.resultats.prenoms', 'Prénom(s)')}</Label>
                            <Input id="prenoms" value={form.data.prenoms} onChange={(e) => form.setData('prenoms', e.target.value)} className="mt-1.5" />
                            {form.errors.prenoms && <p className="mt-1 text-sm text-red-500">{form.errors.prenoms}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="niveau">{t('admin.resultats.niveau', 'Niveau')}</Label>
                                <Input id="niveau" value={form.data.niveau} onChange={(e) => form.setData('niveau', e.target.value)} placeholder="L1" className="mt-1.5" />
                                {form.errors.niveau && <p className="mt-1 text-sm text-red-500">{form.errors.niveau}</p>}
                            </div>
                            <div>
                                <Label htmlFor="annee">{t('admin.resultats.annee', 'Année')}</Label>
                                <Input
                                    id="annee"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={form.data.date}
                                    onChange={(e) => form.setData('date', e.target.value)}
                                    placeholder={String(CURRENT_YEAR)}
                                    className="mt-1.5"
                                />
                                {form.errors.date && <p className="mt-1 text-sm text-red-500">{form.errors.date}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="filiere_id">{t('admin.resultats.filiere', 'Filière')}</Label>
                            <Select id="filiere_id" value={form.data.filiere_id} onChange={(e) => form.setData('filiere_id', e.target.value)} className="mt-1.5">
                                <option value="">{t('admin.classes.select_placeholder', 'Sélectionner...')}</option>
                                {filieres.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nom_fr}
                                    </option>
                                ))}
                            </Select>
                            {form.errors.filiere_id && <p className="mt-1 text-sm text-red-500">{form.errors.filiere_id}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" onClick={() => setOpen(false)} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                                {t('admin.common.cancel', 'Annuler')}
                            </Button>
                            <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                {editing ? t('admin.common.save', 'Enregistrer') : t('admin.common.create', 'Créer')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ImportDialog open={importing} onClose={() => setImporting(false)} />
            <ArchiveDialog open={archiving} onClose={() => setArchiving(false)} ids={resultats.map((r) => r.id)} />
        </AdminLayout>
    );
}
