import { useEffect, useRef, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Ban, Check, CheckCircle2, Download, Eye, PauseOctagon, Plus, Search, Trash2, UserPlus, X } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import ViewToggle from '../../../../Components/Admin/ViewToggle';
import { Button } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Badge } from '../../../../Components/ui/badge';
import { Avatar, AvatarFallback } from '../../../../Components/ui/avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { useTranslations } from '../../../../lib/useTranslations';

const statutVariants = {
    actif: 'success',
    suspendu: 'warning',
    diplome: 'outline',
    abandon: 'danger',
};

const statutLabels = {
    actif: 'Actif',
    suspendu: 'Suspendu',
    diplome: 'Diplômé',
    abandon: 'Abandon',
};

const statutI18nKeys = {
    actif: 'admin.common.active',
    suspendu: 'admin.etudiants.statut_suspendu',
    diplome: 'admin.etudiants.statut_diplome',
    abandon: 'admin.etudiants.statut_abandon',
};

const BASE_URL = '/console/scolarite/etudiants';

/** Pause (active student) or reactivate (paused student) — hidden for the other statuses. */
function PauseButton({ etudiant, onToggle }) {
    const { t } = useTranslations();

    if (etudiant.statut !== 'actif' && etudiant.statut !== 'suspendu') return null;

    const label =
        etudiant.statut === 'actif'
            ? `${t('admin.etudiants.mettre_en_pause', 'Mettre en pause')} — ${etudiant.user?.name}`
            : `${t('admin.etudiants.reprendre_compte', 'Réactiver le compte')} — ${etudiant.user?.name}`;

    return (
        <button
            type="button"
            onClick={() => onToggle(etudiant)}
            className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-amber-500/10 hover:text-amber-600"
            aria-label={label}
            title={label}
        >
            {etudiant.statut === 'actif' ? <Ban className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        </button>
    );
}

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

/**
 * "Nouveau dossier" as an inline side panel — no modal on top of the page, the
 * list stays visible and usable next to the form.
 */
function NewDossierPanel({ eligibleUsers, classes, onClose }) {
    const { t } = useTranslations();
    const form = useForm({ user_id: '', classe_id: '', matricule: '' });
    const panelRef = useRef(null);

    // On a narrow screen the panel opens below the list: bring it into view.
    useEffect(() => {
        if (window.matchMedia?.('(max-width: 1023px)').matches) {
            panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    function submit(e) {
        e.preventDefault();
        form.post('/console/scolarite/etudiants', { onSuccess: onClose, preserveScroll: true });
    }

    return (
        <form
            ref={panelRef}
            onSubmit={submit}
            className="admin-card animate-in fade-in-0 slide-in-from-right-4 scroll-mt-24 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-admin-accent/15 text-admin-accent">
                        <UserPlus className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-base font-semibold text-admin-text">{t('admin.etudiants.new_dossier_title', 'Nouveau dossier étudiant')}</h2>
                        <p className="text-xs text-admin-muted">{t('admin.etudiants.new_dossier_hint', 'Ouvre le dossier d’un compte étudiant existant.')}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('admin.common.cancel', 'Annuler')}
                    className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div>
                <Label htmlFor="user_id">{t('admin.etudiants.compte_etudiant', 'Compte étudiant')}</Label>
                <Select id="user_id" value={form.data.user_id} onChange={(e) => form.setData('user_id', e.target.value)} className="mt-1.5">
                    <option value="">{t('admin.etudiants.select_placeholder', 'Sélectionner...')}</option>
                    {eligibleUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                        </option>
                    ))}
                </Select>
                {eligibleUsers.length === 0 && (
                    <p className="mt-2 rounded-lg bg-admin-hover px-3 py-2 text-xs text-admin-text-secondary">
                        {t(
                            'admin.etudiants.hint_no_eligible',
                            "Tous les comptes étudiants ont déjà un dossier, ou aucun n'a encore été créé (via l'approbation d'une préinscription).",
                        )}
                    </p>
                )}
                {form.errors.user_id && <p className="mt-1 text-sm text-red-500">{form.errors.user_id}</p>}
            </div>

            <div>
                <Label htmlFor="matricule">{t('admin.etudiants.matricule', 'Matricule')}</Label>
                <Input id="matricule" value={form.data.matricule} onChange={(e) => form.setData('matricule', e.target.value)} className="mt-1.5" />
                {form.errors.matricule && <p className="mt-1 text-sm text-red-500">{form.errors.matricule}</p>}
            </div>

            <div>
                <Label htmlFor="classe_id">{t('admin.etudiants.classe_optionnelle', 'Niveau (optionnel)')}</Label>
                <Select id="classe_id" value={form.data.classe_id} onChange={(e) => form.setData('classe_id', e.target.value)} className="mt-1.5">
                    <option value="">{t('admin.etudiants.aucun', 'Aucun')}</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.niveau} — {c.nom} ({c.annee})
                        </option>
                    ))}
                </Select>
                {form.errors.classe_id && <p className="mt-1 text-sm text-red-500">{form.errors.classe_id}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                    {t('admin.common.cancel', 'Annuler')}
                </Button>
                <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t('admin.etudiants.creer_dossier', 'Créer le dossier')}
                </Button>
            </div>
        </form>
    );
}

export default function Index({ etudiants, classes, eligibleUsers, filieres = [], niveaux = [], filters = {} }) {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(filters.q ?? '');
    const [view, setView] = useState('list');
    const searchTimer = useRef(null);

    const current = { filiere_id: filters.filiere_id ?? '', niveau: filters.niveau ?? '', statut: filters.statut ?? '', q: filters.q ?? '' };
    const hasFilters = Object.values(current).some((value) => value !== '');

    function applyFilters(next) {
        router.get(`${BASE_URL}${queryString(next)}`, {}, { preserveState: true, preserveScroll: true, replace: true });
    }

    function setFilter(key, value) {
        applyFilters({ ...current, [key]: value });
    }

    // The search box waits for a pause in typing before asking the server.
    useEffect(() => {
        if (search === current.q) return undefined;
        searchTimer.current = setTimeout(() => setFilter('q', search), 350);
        return () => clearTimeout(searchTimer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function resetFilters() {
        setSearch('');
        applyFilters({});
    }

    function openCreate() {
        setOpen(true);
    }

    function togglePause(etudiant) {
        const suspending = etudiant.statut === 'actif';
        const verb = suspending ? 'mettre en pause' : 'réactiver';
        if (!confirm(`Voulez-vous vraiment ${verb} le compte de ${etudiant.user?.name} ?`)) return;
        router.post(`${BASE_URL}/${etudiant.id}/pause`, {}, { preserveScroll: true });
    }

    const activeCount = etudiants.filter((etudiant) => etudiant.statut === 'actif').length;

    function pauseAll() {
        if (
            !confirm(
                `Mettre en pause les ${activeCount} compte(s) étudiant(s) actif(s) ? Ils ne pourront plus se connecter et devront faire une demande de réinscription pour récupérer l'accès.`,
            )
        )
            return;
        router.post(`${BASE_URL}/pause-tous`, {}, { preserveScroll: true });
    }

    function destroy(etudiant) {
        if (
            !confirm(
                `Supprimer définitivement le compte de ${etudiant.user?.name} ? Il ne pourra plus se connecter et toutes ses données (dossier, inscriptions, publications, messages...) seront effacées. Cette action est irréversible.`,
            )
        )
            return;
        router.delete(`/console/scolarite/etudiants/${etudiant.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.etudiants.title', 'Étudiants')}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.etudiants.search_placeholder', 'Rechercher un nom, un matricule, un e-mail...')}
                        className={`${selectClass} w-full pl-10 pr-3 placeholder:text-admin-muted`}
                    />
                </div>
                <select value={current.filiere_id} onChange={(e) => setFilter('filiere_id', e.target.value)} aria-label={t('admin.etudiants.filiere', 'Filière')} className={selectClass}>
                    <option value="">{t('admin.etudiants.toutes_filieres', 'Toutes les filières')}</option>
                    {filieres.map((filiere) => (
                        <option key={filiere.id} value={filiere.id}>
                            {filiere.nom_fr}
                        </option>
                    ))}
                </select>
                <select value={current.niveau} onChange={(e) => setFilter('niveau', e.target.value)} aria-label={t('admin.etudiants.niveau', 'Niveau')} className={selectClass}>
                    <option value="">{t('admin.etudiants.tous_niveaux', 'Tous les niveaux')}</option>
                    {niveaux.map((niveau) => (
                        <option key={niveau} value={niveau}>
                            {niveau}
                        </option>
                    ))}
                </select>
                <select value={current.statut} onChange={(e) => setFilter('statut', e.target.value)} aria-label={t('admin.common.status', 'Statut')} className={selectClass}>
                    <option value="">{t('admin.etudiants.tous_statuts', 'Tous les statuts')}</option>
                    {Object.entries(statutLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {t(statutI18nKeys[value], label)}
                        </option>
                    ))}
                </select>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex h-10 items-center gap-1.5 rounded-lg border border-admin-border px-3 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                        {t('admin.etudiants.reinitialiser', 'Réinitialiser')}
                    </button>
                )}
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-admin-text-secondary">
                    {etudiants.length} {t('admin.etudiants.count_suffix', 'étudiant(s)')}
                    {hasFilters && <span className="text-admin-muted"> · {t('admin.etudiants.filtre_actif', 'liste filtrée')}</span>}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <ViewToggle view={view} onChange={setView} />
                    {activeCount > 0 && (
                        <Button onClick={pauseAll} className="h-10 bg-transparent text-amber-600 hover:bg-amber-500/10">
                            <PauseOctagon className="h-4 w-4" aria-hidden="true" />
                            {t('admin.etudiants.pause_tous', 'Mettre tous en pause')}
                        </Button>
                    )}
                    <a
                        href={`${BASE_URL}/export${queryString(current)}`}
                        className="flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3.5 text-sm font-medium text-admin-text transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600"
                        title={t('admin.etudiants.export_hint', 'Télécharge la liste affichée (filtres appliqués) au format Excel')}
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {t('admin.etudiants.export_excel', 'Exporter en Excel')}
                    </a>
                    <Button onClick={openCreate} className="h-10 bg-admin-text text-admin-bg hover:bg-admin-text/90">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('admin.etudiants.new_dossier', 'Nouveau dossier')}
                    </Button>
                </div>
            </div>

            <div className={`grid grid-cols-1 gap-5 ${open ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''}`}>
                {view === 'grid' ? (
                    <div className={`grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 ${open ? '' : 'lg:grid-cols-3'}`}>
                        {etudiants.length === 0 && (
                            <div className="col-span-full rounded-xl border border-admin-border bg-admin-card py-8 text-center text-sm text-admin-muted">
                                {hasFilters
                                    ? t('admin.etudiants.empty_filtre', 'Aucun étudiant ne correspond à ces filtres.')
                                    : t('admin.etudiants.empty', 'Aucun dossier étudiant pour le moment.')}
                            </div>
                        )}
                        {etudiants.map((etudiant) => (
                            <div key={etudiant.id} className="flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-card p-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarFallback className="bg-admin-hover text-admin-text">{etudiant.user?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-admin-text">{etudiant.user?.name}</p>
                                        <p className="truncate text-xs text-admin-muted">{etudiant.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-admin-text-secondary">
                                    <span>{etudiant.matricule}</span>
                                    <Badge variant={statutVariants[etudiant.statut]}>{t(statutI18nKeys[etudiant.statut], statutLabels[etudiant.statut])}</Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-admin-text-secondary">
                                    <span className="min-w-0 truncate">{etudiant.filiere_nom ?? '—'}</span>
                                    {etudiant.niveau_code && <Badge variant="outline">{etudiant.niveau_code}</Badge>}
                                </div>
                                <div className="mt-auto flex items-center justify-end gap-1 border-t border-admin-border pt-3">
                                    <Link
                                        href={`/console/scolarite/etudiants/${etudiant.id}`}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                        aria-label={`${t('admin.etudiants.view_dossier_aria', 'Voir le dossier de')} ${etudiant.user?.name}`}
                                    >
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <PauseButton etudiant={etudiant} onToggle={togglePause} />
                                    <button
                                        type="button"
                                        onClick={() => destroy(etudiant)}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600"
                                        aria-label={`Supprimer le compte de ${etudiant.user?.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                <div className="min-w-0 overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('admin.etudiants.col_etudiant', 'Étudiant')}</TableHead>
                                <TableHead>{t('admin.etudiants.matricule', 'Matricule')}</TableHead>
                                <TableHead>{t('admin.etudiants.filiere', 'Filière')}</TableHead>
                                <TableHead>{t('admin.etudiants.niveau', 'Niveau')}</TableHead>
                                <TableHead>{t('admin.common.status', 'Statut')}</TableHead>
                                <TableHead className="text-right">{t('admin.common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {etudiants.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                        {hasFilters
                                            ? t('admin.etudiants.empty_filtre', 'Aucun étudiant ne correspond à ces filtres.')
                                            : t('admin.etudiants.empty', 'Aucun dossier étudiant pour le moment.')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {etudiants.map((etudiant) => (
                                <TableRow key={etudiant.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-admin-hover text-admin-text">
                                                    {etudiant.user?.name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-admin-text">{etudiant.user?.name}</p>
                                                <p className="text-xs text-admin-muted">{etudiant.user?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{etudiant.matricule}</TableCell>
                                    <TableCell>{etudiant.filiere_nom ?? '—'}</TableCell>
                                    <TableCell>{etudiant.niveau_code ? <Badge variant="outline">{etudiant.niveau_code}</Badge> : '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={statutVariants[etudiant.statut]}>
                                            {t(statutI18nKeys[etudiant.statut], statutLabels[etudiant.statut])}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/console/scolarite/etudiants/${etudiant.id}`}
                                            className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`${t('admin.etudiants.view_dossier_aria', 'Voir le dossier de')} ${etudiant.user?.name}`}
                                        >
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                        <PauseButton etudiant={etudiant} onToggle={togglePause} />
                                        <button
                                            type="button"
                                            onClick={() => destroy(etudiant)}
                                            className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-600"
                                            aria-label={`Supprimer le compte de ${etudiant.user?.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                )}

                {open && <NewDossierPanel eligibleUsers={eligibleUsers} classes={classes} onClose={() => setOpen(false)} />}
            </div>
        </AdminLayout>
    );
}
