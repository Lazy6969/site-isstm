import { useEffect, useRef, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArchiveRestore, FileSpreadsheet, FileText, Folder, FolderOpen, Pencil, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import { Button } from '../../../Components/ui/button';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';
import { useTranslations } from '../../../lib/useTranslations';
import { useConfirm } from '../../../lib/useConfirm';

const BASE_URL = '/console/scolarite/resultats';
const ARCHIVES_URL = `${BASE_URL}/archives`;
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

/** Only the year is ever shown or edited here — the server still stores a
 * full date (1 January of that year) and sends it back as a full ISO
 * timestamp, so these pull just the year out in both directions. */
function formatYear(value) {
    return value ? String(new Date(value).getFullYear()) : '—';
}

function toYearInputValue(value) {
    return value ? String(new Date(value).getFullYear()) : '';
}

function yearToDate(year) {
    return year ? `${year}-01-01` : null;
}

/** Nom + année for an existing dossier — distinct from the member-edit
 * dialog below, which edits one of its résultats instead. */
function EditDossierDialog({ open, onClose, dossier }) {
    const { t } = useTranslations();
    const form = useForm({ nom: '', date: '' });

    useEffect(() => {
        if (open && dossier) {
            form.setData({ nom: dossier.nom, date: toYearInputValue(dossier.date) });
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, dossier]);

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, date: yearToDate(data.date) }));
        form.put(`${ARCHIVES_URL}/${dossier.id}`, { preserveScroll: true, onSuccess: onClose });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('admin.resultats.modifier_dossier_titre', 'Modifier ce dossier')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="dossier-nom">{t('admin.resultats.nom_dossier', 'Nom du dossier')}</Label>
                        <Input id="dossier-nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" autoFocus />
                        {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                    </div>
                    <div>
                        <Label htmlFor="dossier-annee">{t('admin.resultats.annee', 'Année')}</Label>
                        <Input
                            id="dossier-annee"
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
                        <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            {t('admin.common.save', 'Enregistrer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/** Edits one résultat filed under a dossier — same fields as the active
 * list's own dialog, reusing the same PUT /resultats/{id} endpoint. */
function EditResultatDialog({ open, onClose, resultat, filieres }) {
    const { t } = useTranslations();
    const form = useForm({ nom: '', prenoms: '', niveau: '', filiere_id: '', date: '' });

    useEffect(() => {
        if (open && resultat) {
            form.setData({
                nom: resultat.nom,
                prenoms: resultat.prenoms ?? '',
                niveau: resultat.niveau ?? '',
                filiere_id: resultat.filiere_id ? String(resultat.filiere_id) : '',
                date: toYearInputValue(resultat.date),
            });
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, resultat]);

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, date: yearToDate(data.date) }));
        form.put(`${BASE_URL}/${resultat.id}`, { preserveScroll: true, onSuccess: onClose });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('admin.resultats.modifier_titre', 'Modifier ce résultat')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="r-nom">{t('admin.common.name', 'Nom')}</Label>
                        <Input id="r-nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                        {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                    </div>
                    <div>
                        <Label htmlFor="r-prenoms">{t('admin.resultats.prenoms', 'Prénom(s)')}</Label>
                        <Input id="r-prenoms" value={form.data.prenoms} onChange={(e) => form.setData('prenoms', e.target.value)} className="mt-1.5" />
                        {form.errors.prenoms && <p className="mt-1 text-sm text-red-500">{form.errors.prenoms}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="r-niveau">{t('admin.resultats.niveau', 'Niveau')}</Label>
                            <Input id="r-niveau" value={form.data.niveau} onChange={(e) => form.setData('niveau', e.target.value)} placeholder="L1" className="mt-1.5" />
                            {form.errors.niveau && <p className="mt-1 text-sm text-red-500">{form.errors.niveau}</p>}
                        </div>
                        <div>
                            <Label htmlFor="r-annee">{t('admin.resultats.annee', 'Année')}</Label>
                            <Input
                                id="r-annee"
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
                        <Label htmlFor="r-filiere">{t('admin.resultats.filiere', 'Filière')}</Label>
                        <Select id="r-filiere" value={form.data.filiere_id} onChange={(e) => form.setData('filiere_id', e.target.value)} className="mt-1.5">
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
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            {t('admin.common.cancel', 'Annuler')}
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            {t('admin.common.save', 'Enregistrer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function MemberActions({ resultat, onEdit, onDestroy, t }) {
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
                onClick={() => onDestroy(resultat)}
                className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                aria-label={`${t('admin.common.delete', 'Supprimer')} ${resultat.nom}`}
            >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}

/** One archived dossier — a folder card: name, year and member count in its
 * header, Voir/Modifier/Restaurer/Supprimer plus the two export links
 * alongside, and (once opened) its member résultats — as a table or as
 * cards depending on `view` — each still editable or removable individually. */
function DossierCard({ dossier, view, onEdit, onRestore, onDestroy, onEditResultat, onDestroyResultat, t }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState({ q: '', annee: '', niveau: '', filiere: '' });

    const members = dossier.resultats;
    const options = {
        annees: [...new Set(members.map((r) => formatYear(r.date)).filter((y) => y !== '—'))].sort().reverse(),
        niveaux: [...new Set(members.map((r) => r.niveau).filter(Boolean))].sort(),
        filieres: [...new Set(members.map((r) => r.filiere?.nom_fr).filter(Boolean))].sort(),
    };
    const term = filter.q.trim().toLowerCase();
    const visible = members.filter(
        (r) =>
            (!term || `${r.nom} ${r.prenoms ?? ''}`.toLowerCase().includes(term)) &&
            (!filter.annee || formatYear(r.date) === filter.annee) &&
            (!filter.niveau || r.niveau === filter.niveau) &&
            (!filter.filiere || r.filiere?.nom_fr === filter.filiere),
    );
    const isFiltering = Object.values(filter).some((v) => v !== '');

    function patchFilter(patch) {
        setFilter((current) => ({ ...current, ...patch }));
        setOpen(true);
    }

    const miniSelect =
        'h-8 rounded-lg border border-admin-border bg-admin-card px-2 text-xs text-admin-text outline-none focus:border-admin-accent/60';

    return (
        <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border bg-admin-hover/40 px-4 py-3">
                <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 items-center gap-2 text-left">
                    {open ? (
                        <FolderOpen className="h-5 w-5 flex-shrink-0 text-admin-accent" aria-hidden="true" />
                    ) : (
                        <Folder className="h-5 w-5 flex-shrink-0 text-admin-accent" aria-hidden="true" />
                    )}
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-admin-text">{dossier.nom}</span>
                        <span className="block text-xs text-admin-muted">
                            {formatYear(dossier.date)} · {isFiltering ? `${visible.length} / ${dossier.resultats_count}` : dossier.resultats_count} résultat(s)
                        </span>
                    </span>
                </button>

                <div className="flex min-w-[260px] flex-1 flex-wrap items-center justify-end gap-1.5">
                    <input
                        value={filter.q}
                        onChange={(e) => patchFilter({ q: e.target.value })}
                        placeholder={t('admin.resultats.filtrer_nom', 'Nom ou prénom...')}
                        aria-label={t('admin.resultats.filtrer_nom', 'Nom ou prénom...')}
                        className={`${miniSelect} w-36`}
                    />
                    <select value={filter.annee} onChange={(e) => patchFilter({ annee: e.target.value })} className={miniSelect} aria-label={t('admin.resultats.annee', 'Année')}>
                        <option value="">{t('admin.resultats.toutes_annees', 'Toutes les années')}</option>
                        {options.annees.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <select value={filter.niveau} onChange={(e) => patchFilter({ niveau: e.target.value })} className={miniSelect} aria-label={t('admin.resultats.niveau', 'Niveau')}>
                        <option value="">{t('admin.resultats.tous_niveaux', 'Tous les niveaux')}</option>
                        {options.niveaux.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <select value={filter.filiere} onChange={(e) => patchFilter({ filiere: e.target.value })} className={`${miniSelect} max-w-44`} aria-label={t('admin.resultats.filiere', 'Filière')}>
                        <option value="">{t('admin.resultats.toutes_filieres', 'Toutes les filières')}</option>
                        {options.filieres.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    {isFiltering && (
                        <button type="button" onClick={() => setFilter({ q: '', annee: '', niveau: '', filiere: '' })} className="h-8 rounded-lg px-2 text-xs font-medium text-admin-accent hover:bg-admin-hover">
                            {t('admin.resultats.reinitialiser', 'Réinitialiser')}
                        </button>
                    )}
                    <span className="mx-0.5 hidden h-5 w-px bg-admin-border sm:block" aria-hidden="true" />
                    <a
                        href={`${ARCHIVES_URL}/${dossier.id}/export/excel`}
                        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                        title={t('admin.resultats.exporter_excel', 'Excel')}
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('admin.resultats.exporter_excel', 'Excel')}
                    </a>
                    <a
                        href={`${ARCHIVES_URL}/${dossier.id}/export/pdf`}
                        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                        title={t('admin.resultats.exporter_pdf', 'PDF')}
                    >
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('admin.resultats.exporter_pdf', 'PDF')}
                    </a>
                    <span className="mx-0.5 h-5 w-px bg-admin-border" aria-hidden="true" />
                    <button
                        type="button"
                        onClick={() => onEdit(dossier)}
                        className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                        aria-label={`${t('admin.common.edit', 'Modifier')} ${dossier.nom}`}
                    >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRestore(dossier)}
                        className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                        aria-label={`${t('admin.resultats.restaurer', 'Restaurer')} ${dossier.nom}`}
                    >
                        <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDestroy(dossier)}
                        className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                        aria-label={`${t('admin.common.delete', 'Supprimer')} ${dossier.nom}`}
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {open && (view === 'grid' ? (
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((resultat) => (
                        <div key={resultat.id} className="flex flex-col gap-2 rounded-lg border border-admin-border p-3">
                            <div>
                                <p className="truncate text-sm font-medium text-admin-text">
                                    {resultat.nom} {resultat.prenoms}
                                </p>
                                <p className="truncate text-xs text-admin-muted">{resultat.filiere?.nom_fr ?? '—'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-admin-text-secondary">
                                {resultat.niveau && <span className="rounded-full border border-admin-border px-2 py-0.5">{resultat.niveau}</span>}
                                <span className="text-admin-muted">{formatYear(resultat.date)}</span>
                            </div>
                            <div className="mt-auto flex items-center justify-end border-t border-admin-border pt-2">
                                <MemberActions resultat={resultat} onEdit={onEditResultat} onDestroy={onDestroyResultat} t={t} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
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
                        {visible.map((resultat) => (
                            <TableRow key={resultat.id}>
                                <TableCell className="font-medium">{resultat.nom}</TableCell>
                                <TableCell>{resultat.prenoms ?? '—'}</TableCell>
                                <TableCell>{resultat.niveau ?? '—'}</TableCell>
                                <TableCell>{resultat.filiere?.nom_fr ?? '—'}</TableCell>
                                <TableCell>{formatYear(resultat.date)}</TableCell>
                                <TableCell className="text-right">
                                    <MemberActions resultat={resultat} onEdit={onEditResultat} onDestroy={onDestroyResultat} t={t} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ))}
        </div>
    );
}

/**
 * The Archives page: every dossier an admin has created from the active
 * Résultats list's "Archiver" dialog (see ArchiveDossier's docblock) — a
 * folder per named, dated batch, searchable by name and filterable by year,
 * individually viewable, renameable, restorable back to the public list,
 * deletable, and exportable to Excel or PDF.
 */
export default function Archives({ dossiers, filieres, annees = [], filters = {} }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const [editingDossier, setEditingDossier] = useState(null);
    const [editingResultat, setEditingResultat] = useState(null);
    const [search, setSearch] = useState(filters.q ?? '');
    const [view, setView] = useState('list');
    const searchTimer = useRef(null);

    const current = { annee: filters.annee ?? '', q: filters.q ?? '' };

    function applyFilters(next) {
        router.get(`${ARCHIVES_URL}${queryString(next)}`, {}, { preserveState: true, preserveScroll: true, replace: true });
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

    async function restoreDossier(dossier) {
        if (
            !(await confirmAction({
                message: `Les ${dossier.resultats_count} résultat(s) de ce dossier seront remis dans la liste active et redeviendront visibles publiquement. Le dossier sera ensuite supprimé.`,
                title: t('admin.auto.restaurer_ce_dossier_a375', 'Restaurer ce dossier ?'),
                details: dossier.nom,
                confirmLabel: t('admin.auto.restaurer_1f76', 'Restaurer'),
            }))
        ) {
            return;
        }
        router.post(`${ARCHIVES_URL}/${dossier.id}/restaurer`, {}, { preserveScroll: true });
    }

    async function destroyDossier(dossier) {
        if (
            !(await confirmAction({
                message: `Ce dossier et ses ${dossier.resultats_count} résultat(s) seront placés dans la corbeille.`,
                title: t('admin.auto.supprimer_ce_dossier_ffca', 'Supprimer ce dossier ?'),
                details: dossier.nom,
                confirmLabel: t('admin.auto.supprimer_ccfd', 'Supprimer'),
            }))
        ) {
            return;
        }
        router.delete(`${ARCHIVES_URL}/${dossier.id}`, { preserveScroll: true });
    }

    async function destroyResultat(resultat) {
        if (
            !(await confirmAction({
                message: t('admin.auto.ce_resultat_sera_place_dans_la_corbeille_0ae7', 'Ce résultat sera placé dans la corbeille.'),
                title: t('admin.auto.supprimer_ce_resultat_d3a6', 'Supprimer ce résultat ?'),
                details: `${resultat.nom} ${resultat.prenoms ?? ''}`,
                confirmLabel: t('admin.auto.supprimer_ccfd', 'Supprimer'),
            }))
        ) {
            return;
        }
        router.delete(`${BASE_URL}/${resultat.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.resultats.archives_title', 'Archives des résultats')}>
            <Link href={BASE_URL} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-secondary hover:text-admin-text">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t('admin.resultats.retour', 'Retour aux résultats')}
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.resultats.rechercher_archives', 'Rechercher un dossier...')}
                        className={`${selectClass} w-full pr-3 pl-10 placeholder:text-admin-muted`}
                    />
                </div>

                <Select value={current.annee} onChange={(e) => setFilter('annee', e.target.value)} className={selectClass}>
                    <option value="">{t('admin.resultats.toutes_annees', 'Toutes les années')}</option>
                    {annees.map((annee) => (
                        <option key={annee} value={annee}>
                            {annee}
                        </option>
                    ))}
                </Select>

                <ViewToggle view={view} onChange={setView} />
            </div>

            {dossiers.length === 0 ? (
                <div className="rounded-xl border border-admin-border bg-admin-card py-8 text-center text-admin-muted">
                    {t('admin.resultats.empty_archives', 'Aucun résultat archivé.')}
                </div>
            ) : (
                <div className="space-y-4">
                    {dossiers.map((dossier) => (
                        <DossierCard
                            key={dossier.id}
                            dossier={dossier}
                            view={view}
                            onEdit={setEditingDossier}
                            onRestore={restoreDossier}
                            onDestroy={destroyDossier}
                            onEditResultat={setEditingResultat}
                            onDestroyResultat={destroyResultat}
                            t={t}
                        />
                    ))}
                </div>
            )}

            <EditDossierDialog open={editingDossier !== null} onClose={() => setEditingDossier(null)} dossier={editingDossier} />
            <EditResultatDialog open={editingResultat !== null} onClose={() => setEditingResultat(null)} resultat={editingResultat} filieres={filieres} />
        </AdminLayout>
    );
}
