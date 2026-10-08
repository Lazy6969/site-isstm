import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowUpRight, Plus, Pencil, Search, Trash2, Users } from 'lucide-react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Badge } from '../../../../Components/ui/badge';
import { Button } from '../../../../Components/ui/button';
import { Input } from '../../../../Components/ui/input';
import { Label } from '../../../../Components/ui/label';
import { Select } from '../../../../Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../Components/ui/dialog';
import { useTranslations } from '../../../../lib/useTranslations';

const emptyForm = { nom: '', filiere_id: '', niveau: '', annee: '', effectif_max: '' };

const NIVEAU_ORDER = ['L1', 'L2', 'L3', 'M1', 'M2'];
const NONE = '__none__';

const preinscritStatutLabels = {
    en_attente: ['admin.classes.statut_soumis', 'Soumis'],
    en_cours_examen: ['admin.classes.statut_examen', "En cours d'examen"],
    a_completer: ['admin.classes.statut_completer', 'À compléter'],
};

function niveauSort(a, b) {
    const rank = (value) => (NIVEAU_ORDER.includes(value) ? NIVEAU_ORDER.indexOf(value) : NIVEAU_ORDER.length);
    return rank(a) - rank(b) || a.localeCompare(b);
}

/**
 * Everyone who belongs to a niveau — enrolled students and candidates whose
 * pré-inscription is still in progress — filterable by niveau and by kind, so
 * the two groups stay easy to tell apart.
 */
function MembresPanel({ membres }) {
    const { t } = useTranslations();
    const [niveau, setNiveau] = useState('');
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');

    const niveaux = [...new Set(membres.map((membre) => membre.niveau).filter(Boolean))].sort(niveauSort);
    const hasUndefined = membres.some((membre) => !membre.niveau);
    const countFor = (value) => membres.filter((membre) => (value === NONE ? !membre.niveau : membre.niveau === value)).length;

    const term = search.trim().toLowerCase();
    const rows = membres.filter((membre) => {
        if (niveau === NONE ? membre.niveau : niveau && membre.niveau !== niveau) return false;
        if (type && membre.type !== type) return false;
        if (!term) return true;
        return [membre.nom, membre.email, membre.reference, membre.filiere].some((field) => (field ?? '').toLowerCase().includes(term));
    });

    const niveauChips = [['', t('admin.classes.tous', 'Tous'), membres.length], ...niveaux.map((value) => [value, value, countFor(value)]), ...(hasUndefined ? [[NONE, t('admin.classes.niveau_indefini', 'Non défini'), countFor(NONE)]] : [])];
    const typeOptions = [
        ['', t('admin.classes.tous', 'Tous')],
        ['etudiant', t('admin.classes.type_etudiants', 'Étudiants')],
        ['preinscrit', t('admin.classes.type_preinscrits', 'Préinscrits')],
    ];

    return (
        <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-admin-text">
                        <Users className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                        {t('admin.classes.membres_title', 'Inscrits par niveau')}
                    </h2>
                    <p className="text-sm text-admin-text-secondary">
                        {t('admin.classes.membres_subtitle', 'Étudiants validés et candidats préinscrits, filtrables par niveau.')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.classes.rechercher', 'Rechercher...')}
                            className="h-10 w-56 rounded-lg border border-admin-border bg-admin-card pl-9 pr-3 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                        />
                    </div>
                    <div className="flex h-10 items-center gap-1 rounded-lg border border-admin-border bg-admin-card p-1" role="group" aria-label={t('admin.classes.filtre_type', 'Filtrer par type')}>
                        {typeOptions.map(([value, label]) => (
                            <button
                                key={value || 'all'}
                                type="button"
                                onClick={() => setType(value)}
                                aria-pressed={type === value}
                                className={`h-8 rounded-md px-2.5 text-xs font-medium transition ${
                                    type === value ? 'bg-admin-accent text-admin-accent-foreground shadow-sm' : 'text-admin-text-secondary hover:bg-admin-hover'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('admin.classes.niveau', 'Niveau')}>
                {niveauChips.map(([value, label, count]) => (
                    <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setNiveau(value)}
                        aria-pressed={niveau === value}
                        className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                            niveau === value
                                ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                        }`}
                    >
                        {label}
                        <span className={`rounded-full px-1.5 text-xs ${niveau === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{count}</span>
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.common.name', 'Nom')}</TableHead>
                            <TableHead>{t('admin.classes.filiere', 'Filière')}</TableHead>
                            <TableHead>{t('admin.classes.niveau', 'Niveau')}</TableHead>
                            <TableHead>{t('admin.classes.col_type', 'Type')}</TableHead>
                            <TableHead>{t('admin.classes.col_reference', 'Matricule / dossier')}</TableHead>
                            <TableHead className="text-right">
                                <span className="sr-only">{t('admin.common.actions', 'Actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    {t('admin.classes.membres_empty', 'Personne dans ce niveau pour le moment.')}
                                </TableCell>
                            </TableRow>
                        )}
                        {rows.map((membre) => (
                            <TableRow key={membre.key}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-admin-hover text-xs font-semibold text-admin-text">
                                            {membre.nom?.[0]?.toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-admin-text">{membre.nom}</p>
                                            {membre.email && <p className="truncate text-xs text-admin-muted">{membre.email}</p>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{membre.filiere ?? '—'}</TableCell>
                                <TableCell>{membre.niveau ? <Badge variant="outline">{membre.niveau}</Badge> : '—'}</TableCell>
                                <TableCell>
                                    {membre.type === 'etudiant' ? (
                                        <Badge variant="success">{t('admin.classes.type_etudiant', 'Étudiant')}</Badge>
                                    ) : (
                                        <div className="flex flex-col items-start gap-0.5">
                                            <Badge variant="warning">{t('admin.classes.type_preinscrit', 'Préinscrit')}</Badge>
                                            {preinscritStatutLabels[membre.statut] && (
                                                <span className="text-xs text-admin-muted">{t(...preinscritStatutLabels[membre.statut])}</span>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="tabular-nums text-admin-text-secondary">{membre.reference ?? '—'}</TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={membre.href}
                                        className="inline-flex rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-accent"
                                        aria-label={`${t('admin.classes.voir_dossier', 'Voir le dossier')} ${membre.nom}`}
                                    >
                                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}

export default function Index({ classes, filieres, membres = [] }) {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm(emptyForm);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(classe) {
        setEditing(classe);
        form.setData({
            nom: classe.nom,
            filiere_id: String(classe.filiere_id),
            niveau: classe.niveau,
            annee: classe.annee,
            effectif_max: classe.effectif_max ?? '',
        });
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);

        if (editing) {
            form.put(`/console/scolarite/classes/${editing.id}`, { onSuccess, preserveScroll: true });
        } else {
            form.post('/console/scolarite/classes', { onSuccess, preserveScroll: true });
        }
    }

    function destroy(classe) {
        if (!confirm(`${t('admin.classes.confirm_delete', 'Supprimer la classe')} « ${classe.nom} » ?`)) return;
        router.delete(`/console/scolarite/classes/${classe.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.classes.title', 'Niveaux')}>
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">
                    {classes.length} {t('admin.classes.count_suffix', 'classe(s)')}
                </p>
                <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.classes.nouvelle', 'Nouvelle classe')}
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.common.name', 'Nom')}</TableHead>
                            <TableHead>{t('admin.classes.filiere', 'Filière')}</TableHead>
                            <TableHead>{t('admin.classes.niveau', 'Niveau')}</TableHead>
                            <TableHead>{t('admin.classes.annee', 'Année')}</TableHead>
                            <TableHead>{t('admin.classes.etudiants', 'Étudiants')}</TableHead>
                            <TableHead className="text-right">{t('admin.common.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-admin-muted">
                                    {t('admin.classes.empty', 'Aucune classe pour le moment.')}
                                </TableCell>
                            </TableRow>
                        )}
                        {classes.map((classe) => (
                            <TableRow key={classe.id}>
                                <TableCell className="font-medium">{classe.nom}</TableCell>
                                <TableCell>{classe.filiere?.nom_fr ?? '—'}</TableCell>
                                <TableCell>{classe.niveau}</TableCell>
                                <TableCell>{classe.annee}</TableCell>
                                <TableCell>
                                    {classe.etudiants_count}
                                    {classe.effectif_max ? ` / ${classe.effectif_max}` : ''}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(classe)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                            aria-label={`${t('admin.common.edit', 'Modifier')} ${classe.nom}`}
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => destroy(classe)}
                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500"
                                            aria-label={`${t('admin.common.delete', 'Supprimer')} ${classe.nom}`}
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

            <MembresPanel membres={membres} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? t('admin.classes.modifier_titre', 'Modifier la classe')
                                : t('admin.classes.nouvelle', 'Nouvelle classe')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="nom">{t('admin.common.name', 'Nom')}</Label>
                            <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                            {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                        </div>

                        <div>
                            <Label htmlFor="filiere_id">{t('admin.classes.filiere', 'Filière')}</Label>
                            <Select
                                id="filiere_id"
                                value={form.data.filiere_id}
                                onChange={(e) => form.setData('filiere_id', e.target.value)}
                                className="mt-1.5"
                            >
                                <option value="">{t('admin.classes.select_placeholder', 'Sélectionner...')}</option>
                                {filieres.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nom_fr}
                                    </option>
                                ))}
                            </Select>
                            {form.errors.filiere_id && <p className="mt-1 text-sm text-red-500">{form.errors.filiere_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="niveau">{t('admin.classes.niveau', 'Niveau')}</Label>
                                <Input
                                    id="niveau"
                                    value={form.data.niveau}
                                    onChange={(e) => form.setData('niveau', e.target.value)}
                                    placeholder="L1"
                                    className="mt-1.5"
                                />
                                {form.errors.niveau && <p className="mt-1 text-sm text-red-500">{form.errors.niveau}</p>}
                            </div>
                            <div>
                                <Label htmlFor="annee">{t('admin.classes.annee', 'Année')}</Label>
                                <Input
                                    id="annee"
                                    value={form.data.annee}
                                    onChange={(e) => form.setData('annee', e.target.value)}
                                    placeholder="2025"
                                    className="mt-1.5"
                                />
                                {form.errors.annee && <p className="mt-1 text-sm text-red-500">{form.errors.annee}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="effectif_max">{t('admin.classes.effectif_max', 'Effectif maximum (optionnel)')}</Label>
                            <Input
                                id="effectif_max"
                                type="number"
                                min="1"
                                value={form.data.effectif_max}
                                onChange={(e) => form.setData('effectif_max', e.target.value)}
                                className="mt-1.5"
                            />
                            {form.errors.effectif_max && <p className="mt-1 text-sm text-red-500">{form.errors.effectif_max}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                {t('admin.common.cancel', 'Annuler')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                            >
                                {editing ? t('admin.common.save', 'Enregistrer') : t('admin.common.create', 'Créer')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
