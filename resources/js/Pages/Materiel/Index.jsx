import { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    AlertTriangle,
    BarChart3,
    Boxes,
    History,
    Layers,
    LayoutGrid,
    List,
    MapPin,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    StickyNote,
    Trash2,
    Truck,
    Wrench,
} from 'lucide-react';
import AdminLayout from '../../Components/Layout/AdminLayout';
import MaterielLayout from '../../Components/Layout/MaterielLayout';
import StatCard from '../../Components/Admin/StatCard';
import { Badge } from '../../Components/ui/badge';
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
import { Label } from '../../Components/ui/label';
import { Select } from '../../Components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../Components/ui/dialog';
import { useTranslations } from '../../lib/useTranslations';
import { useConfirm } from '../../lib/useConfirm';

const ETAT_VARIANT = {
    bon_etat: 'success',
    en_marche: 'default',
    mauvais_etat: 'warning',
    en_panne: 'danger',
};

const ETAT_COLOR = {
    bon_etat: '#10b981',
    en_marche: '#1e3a5f',
    mauvais_etat: '#f59e0b',
    en_panne: '#ef4444',
};

const emptyForm = { lieu: '', nom: '', quantite: 1, etat: 'bon_etat', observation: '' };

const VIEW_MODE_KEY = 'materiel-view-mode';

function readViewMode() {
    try {
        return localStorage.getItem(VIEW_MODE_KEY) === 'list' ? 'list' : 'grid';
    } catch {
        return 'grid';
    }
}

function formatDateTime(value) {
    return new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * One équipement card: name/état/lieu, inline quick-edit for quantité,
 * observation and état (saved on blur/change, no dialog), plus two
 * collapsible panels (maintenance log, déplacements/emprunts) each with
 * their own small add-form.
 */
function MaterielCard({ item, lieux, etats, can, onEdit, onDelete, compact = false }) {
    const { t } = useTranslations();
    const [quantite, setQuantite] = useState(item.quantite);
    const [observation, setObservation] = useState(item.observation ?? '');
    const [panel, setPanel] = useState(null); // null | 'maintenance' | 'emprunt'
    const [maintDesc, setMaintDesc] = useState('');
    const [maintEtat, setMaintEtat] = useState('');
    const [empEmprunteur, setEmpEmprunteur] = useState('');
    const [empLieu, setEmpLieu] = useState('');
    const [empQuantite, setEmpQuantite] = useState(item.quantite);
    const [empMotif, setEmpMotif] = useState('');

    useEffect(() => setQuantite(item.quantite), [item.quantite]);
    useEffect(() => setObservation(item.observation ?? ''), [item.observation]);
    useEffect(() => setEmpQuantite(item.quantite), [item.quantite]);

    const activeLoans = item.deplacements.filter((d) => d.statut === 'en_cours');

    function saveField(field, value) {
        router.put(`/materiel/${item.id}`, { [field]: value }, { preserveScroll: true, preserveState: true });
    }

    function submitMaintenance(e) {
        e.preventDefault();
        router.post(
            `/materiel/${item.id}/maintenance`,
            { description: maintDesc, etat_apres: maintEtat || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMaintDesc('');
                    setMaintEtat('');
                },
            },
        );
    }

    function submitEmprunt(e) {
        e.preventDefault();
        router.post(
            `/materiel/${item.id}/emprunter`,
            { emprunteur: empEmprunteur, lieu_destination: empLieu, quantite_emprunt: empQuantite, motif: empMotif || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEmpEmprunteur('');
                    setEmpLieu('');
                    setEmpMotif('');
                },
            },
        );
    }

    async function retourner(deplacementId) {
        router.post(`/materiel/deplacements/${deplacementId}/retourner`, {}, { preserveScroll: true });
    }

    return (
        <div className={compact ? 'admin-card flex flex-wrap items-center gap-x-4 gap-y-2 p-3' : 'admin-card flex flex-col gap-3 p-4'}>
            <div className={compact ? 'flex min-w-[160px] flex-1 items-center gap-2' : 'flex items-start justify-between gap-2'}>
                <h3 className={compact ? 'truncate font-medium text-admin-text' : 'font-semibold text-admin-text'}>{item.nom}</h3>
                {can.edit ? (
                    <Select value={item.etat} onChange={(e) => saveField('etat', e.target.value)} className="h-7 w-auto text-xs">
                        {etats.map((e) => (
                            <option key={e.value} value={e.value}>
                                {e.label}
                            </option>
                        ))}
                    </Select>
                ) : (
                    <Badge variant={ETAT_VARIANT[item.etat]}>{item.etat_label}</Badge>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-admin-text-secondary">
                <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.lieu}
                </span>
                <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    {can.edit ? (
                        <input
                            type="number"
                            min="1"
                            value={quantite}
                            onChange={(e) => setQuantite(e.target.value)}
                            onBlur={() => Number(quantite) !== item.quantite && Number(quantite) >= 1 && saveField('quantite', Number(quantite))}
                            className="h-7 w-16 rounded-md border border-admin-border bg-admin-surface px-1.5 text-sm tabular-nums text-admin-text"
                        />
                    ) : (
                        <span className="tabular-nums">{item.quantite}</span>
                    )}
                </span>
            </div>

            {can.edit ? (
                <input
                    type="text"
                    value={observation}
                    placeholder={t('materiel.observation_placeholder', 'Observation...')}
                    onChange={(e) => setObservation(e.target.value)}
                    onBlur={() => observation !== (item.observation ?? '') && saveField('observation', observation)}
                    className={compact ? 'h-8 w-48 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text placeholder:text-admin-muted' : 'h-8 w-full rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text placeholder:text-admin-muted'}
                />
            ) : (
                item.observation && (
                    <p className={compact ? 'flex max-w-xs items-center gap-1.5 truncate text-xs text-admin-muted' : 'flex items-center gap-1.5 text-xs text-admin-muted'}>
                        <StickyNote className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        {item.observation}
                    </p>
                )
            )}

            {activeLoans.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {activeLoans.map((loan) => (
                        <Badge key={loan.id} variant="warning">
                            {t('materiel.emprunte_vers', 'Emprunté à')} {loan.lieu_destination} ({loan.quantite})
                        </Badge>
                    ))}
                </div>
            )}

            <div className={compact ? 'ml-auto flex items-center gap-1' : 'flex items-center gap-1 border-t border-admin-border pt-2'}>
                {can.edit && (
                    <button onClick={() => onEdit(item)} className="rounded-lg p-1.5 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text" title={t('admin.common.edit', 'Modifier')}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
                <button
                    onClick={() => setPanel(panel === 'maintenance' ? null : 'maintenance')}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition ${panel === 'maintenance' ? 'bg-admin-accent text-admin-accent-foreground' : 'text-admin-text-secondary hover:bg-admin-hover'}`}
                    title={t('materiel.maintenance_titre', 'Maintenance')}
                >
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.maintenances.length}
                </button>
                <button
                    onClick={() => setPanel(panel === 'emprunt' ? null : 'emprunt')}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition ${panel === 'emprunt' ? 'bg-admin-accent text-admin-accent-foreground' : 'text-admin-text-secondary hover:bg-admin-hover'}`}
                    title={t('materiel.deplacement_titre', 'Déplacements')}
                >
                    <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.deplacements.length}
                </button>
                {can.delete && (
                    <button onClick={() => onDelete(item)} className="ml-auto rounded-lg p-1.5 text-admin-text-secondary transition hover:bg-admin-hover hover:text-red-500" title={t('admin.common.delete', 'Supprimer')}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            {panel === 'maintenance' && (
                <div className="w-full rounded-lg bg-admin-hover/40 p-3">
                    {item.maintenances.length === 0 ? (
                        <p className="text-xs text-admin-muted">{t('materiel.maintenance_vide', 'Aucune intervention pour le moment.')}</p>
                    ) : (
                        <ul className="mb-2 space-y-1.5">
                            {item.maintenances.map((m) => (
                                <li key={m.id} className="text-xs text-admin-text-secondary">
                                    <span className="text-admin-muted">{formatDateTime(m.created_at)}</span> — {m.description}
                                    {m.etat_apres_label && (
                                        <Badge variant={ETAT_VARIANT[m.etat_apres]} className="ml-1.5">
                                            {m.etat_apres_label}
                                        </Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {can.edit && (
                        <form onSubmit={submitMaintenance} className="flex flex-wrap gap-1.5">
                            <input
                                type="text"
                                required
                                value={maintDesc}
                                onChange={(e) => setMaintDesc(e.target.value)}
                                placeholder={t('materiel.maintenance_placeholder', "Description de l'intervention")}
                                className="h-8 flex-1 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text placeholder:text-admin-muted"
                            />
                            <Select value={maintEtat} onChange={(e) => setMaintEtat(e.target.value)} className="h-8 w-auto text-xs">
                                <option value="">{t('materiel.maintenance_etat_inchange', 'État inchangé')}</option>
                                {etats.map((e) => (
                                    <option key={e.value} value={e.value}>
                                        {e.label}
                                    </option>
                                ))}
                            </Select>
                            <Button type="submit" className="h-8 bg-admin-text px-2 text-xs text-admin-bg hover:bg-admin-text/90">
                                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                        </form>
                    )}
                </div>
            )}

            {panel === 'emprunt' && (
                <div className="w-full rounded-lg bg-admin-hover/40 p-3">
                    {item.deplacements.length === 0 ? (
                        <p className="text-xs text-admin-muted">{t('materiel.deplacement_vide', 'Aucun déplacement pour le moment.')}</p>
                    ) : (
                        <ul className="mb-2 space-y-1.5">
                            {item.deplacements.map((d) => (
                                <li key={d.id} className="flex items-center justify-between gap-2 text-xs text-admin-text-secondary">
                                    <span>
                                        <span className="text-admin-muted">{formatDateTime(d.created_at)}</span> — {d.emprunteur} : {d.lieu_origine} → {d.lieu_destination} ({d.quantite})
                                    </span>
                                    {d.statut === 'en_cours' ? (
                                        <button onClick={() => retourner(d.id)} className="flex items-center gap-1 rounded-md border border-admin-border px-1.5 py-0.5 text-admin-text-secondary hover:bg-admin-hover">
                                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                            {t('materiel.retourner_btn', 'Retourner')}
                                        </button>
                                    ) : (
                                        <Badge variant="success">{t('materiel.statut_retourne', 'Retourné')}</Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {can.edit && item.quantite >= 1 ? (
                        <form onSubmit={submitEmprunt} className="flex flex-wrap gap-1.5">
                            <input
                                type="text"
                                required
                                value={empEmprunteur}
                                onChange={(e) => setEmpEmprunteur(e.target.value)}
                                placeholder={t('materiel.emprunteur_placeholder', 'Nom de la personne')}
                                className="h-8 flex-1 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text placeholder:text-admin-muted"
                            />
                            <input
                                type="text"
                                required
                                list="materiel-lieux-datalist"
                                value={empLieu}
                                onChange={(e) => setEmpLieu(e.target.value)}
                                placeholder={t('materiel.destination_placeholder', 'Lieu de destination')}
                                className="h-8 w-40 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text placeholder:text-admin-muted"
                            />
                            <input
                                type="number"
                                min="1"
                                max={item.quantite}
                                value={empQuantite}
                                onChange={(e) => setEmpQuantite(e.target.value)}
                                className="h-8 w-16 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text"
                            />
                            <input
                                type="text"
                                value={empMotif}
                                onChange={(e) => setEmpMotif(e.target.value)}
                                placeholder={t('materiel.motif_placeholder', 'Motif (optionnel)')}
                                className="h-8 w-32 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-text placeholder:text-admin-muted"
                            />
                            <Button type="submit" className="h-8 bg-admin-text px-2 text-xs text-admin-bg hover:bg-admin-text/90">
                                <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                        </form>
                    ) : (
                        panel === 'emprunt' && item.quantite < 1 && <p className="text-xs text-admin-muted">{t('materiel.quantite_epuisee', 'Quantité disponible épuisée.')}</p>
                    )}
                </div>
            )}
        </div>
    );
}

/** A loan currently sitting in this lieu, but owned by another lieu's fiche. */
function IncomingLoanCard({ loan, onRetourner, onGoToOrigine }) {
    const { t } = useTranslations();
    return (
        <div className="admin-card flex flex-col gap-2 border-amber-300/60 p-4 dark:border-amber-500/30">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-admin-text">{loan.materiel_nom}</h3>
                <Badge variant="warning">{t('materiel.stamp_emprunte', 'Emprunté')}</Badge>
            </div>
            <p className="text-sm text-admin-text-secondary">
                {t('materiel.carte_provenance', 'Depuis')} <strong>{loan.lieu_origine}</strong> · {loan.quantite}x · {loan.emprunteur}
            </p>
            {loan.motif && <p className="text-xs text-admin-muted">{loan.motif}</p>}
            <p className="text-xs text-admin-muted">{formatDateTime(loan.created_at)}</p>
            <div className="flex items-center gap-2 border-t border-admin-border pt-2">
                <button onClick={() => onGoToOrigine(loan.lieu_origine)} className="text-xs text-admin-text-secondary hover:underline">
                    {t('materiel.voir_lieu_origine', "Voir le lieu d'origine")}
                </button>
                <Button onClick={() => onRetourner(loan.id)} className="ml-auto h-7 bg-admin-text px-2 text-xs text-admin-bg hover:bg-admin-text/90">
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    {t('materiel.retourner_btn', 'Retourner')}
                </Button>
            </div>
        </div>
    );
}

function StatsTab({ materiels, etats }) {
    const { t } = useTranslations();

    const repartition = useMemo(
        () =>
            etats
                .map((e) => ({ etat: e.value, label: e.label, total: materiels.filter((m) => m.etat === e.value).length }))
                .filter((row) => row.total > 0),
        [materiels, etats],
    );

    const parLieu = useMemo(() => {
        const lieux = [...new Set(materiels.map((m) => m.lieu))].sort();
        return lieux.map((lieu) => {
            const row = { lieu };
            etats.forEach((e) => {
                row[e.value] = materiels.filter((m) => m.lieu === lieu && m.etat === e.value).length;
            });
            return row;
        });
    }, [materiels, etats]);

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="admin-card p-5">
                <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('materiel.stats_repartition', 'Répartition par état')}</h2>
                {repartition.length === 0 ? (
                    <p className="py-10 text-center text-sm text-admin-muted">{t('materiel.aucun', 'Aucun matériel pour le moment.')}</p>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Tooltip />
                                <Pie data={repartition} dataKey="total" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                    {repartition.map((row) => (
                                        <Cell key={row.etat} fill={ETAT_COLOR[row.etat]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <ul className="mt-2 space-y-1.5">
                            {repartition.map((row) => (
                                <li key={row.etat} className="flex items-center gap-2 text-xs">
                                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: ETAT_COLOR[row.etat] }} />
                                    <span className="flex-1">{row.label}</span>
                                    <span className="font-medium text-admin-text">{row.total}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            <div className="admin-card p-5">
                <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('materiel.stats_etat_par_lieu', 'État par lieu')}</h2>
                <ResponsiveContainer width="100%" height={Math.max(220, parLieu.length * 40)}>
                    <BarChart data={parLieu} layout="vertical" margin={{ left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="lieu" width={160} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        {etats.map((e) => (
                            <Bar key={e.value} dataKey={e.value} name={e.label} fill={ETAT_COLOR[e.value]} stackId="etat" />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function HistoriqueTab({ materiels, can }) {
    const { t } = useTranslations();
    const confirmAction = useConfirm();
    const [search, setSearch] = useState('');
    const [statutFiltre, setStatutFiltre] = useState('tous');
    const [sort, setSort] = useState('date_desc');

    const historique = useMemo(() => {
        const rows = [];
        materiels.forEach((m) => {
            m.deplacements.forEach((d) => rows.push({ ...d, materiel_nom: m.nom, materiel_lieu_actuel: m.lieu }));
        });
        return rows;
    }, [materiels]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        let rows = historique.filter((d) => {
            if (statutFiltre !== 'tous' && d.statut !== statutFiltre) return false;
            if (!term) return true;
            return [d.materiel_nom, d.emprunteur, d.lieu_destination, d.lieu_origine, d.motif].some((f) => (f ?? '').toLowerCase().includes(term));
        });

        rows = [...rows].sort((a, b) => {
            switch (sort) {
                case 'date_asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'nom':
                    return a.materiel_nom.localeCompare(b.materiel_nom);
                case 'lieu':
                    return a.materiel_lieu_actuel.localeCompare(b.materiel_lieu_actuel);
                case 'emprunteur':
                    return a.emprunteur.localeCompare(b.emprunteur);
                case 'statut':
                    return a.statut.localeCompare(b.statut);
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        return rows;
    }, [historique, search, statutFiltre, sort]);

    function retourner(id) {
        router.post(`/materiel/deplacements/${id}/retourner`, {}, { preserveScroll: true });
    }

    async function destroyOne(id) {
        if (!(await confirmAction({ message: t('materiel.historique_supprimer_confirm', 'Supprimer cette entrée de l’historique ?'), title: t('admin.common.delete', 'Supprimer') }))) return;
        router.delete(`/materiel/deplacements/${id}`, { preserveScroll: true });
    }

    async function destroyAll() {
        if (!(await confirmAction({ message: t('materiel.historique_tout_supprimer_confirm', 'Vider tout l’historique des emprunts ? Cette action est irréversible.'), title: t('materiel.historique_tout_supprimer', "Vider l'historique") }))) return;
        router.delete('/materiel/historique', { preserveScroll: true });
    }

    return (
        <div className="admin-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Select value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)} className="w-auto">
                    <option value="tous">{t('materiel.historique_filtre_tous', 'Tous')}</option>
                    <option value="en_cours">{t('materiel.statut_en_cours', 'En cours')}</option>
                    <option value="retourne">{t('materiel.statut_retourne', 'Retourné')}</option>
                </Select>
                {can.delete && historique.length > 0 && (
                    <Button onClick={destroyAll} className="h-8 bg-red-600 px-3 text-xs text-white hover:bg-red-600/90">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('materiel.historique_tout_supprimer', "Vider l'historique")}
                    </Button>
                )}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('materiel.historique_recherche_placeholder', 'Rechercher...')} className="pl-9" />
                </div>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto">
                    <option value="date_desc">{t('materiel.historique_tri_date_desc', 'Plus récent')}</option>
                    <option value="date_asc">{t('materiel.historique_tri_date_asc', 'Plus ancien')}</option>
                    <option value="nom">{t('materiel.historique_tri_nom', 'Nom')}</option>
                    <option value="lieu">{t('materiel.historique_tri_lieu', 'Lieu')}</option>
                    <option value="emprunteur">{t('materiel.historique_tri_emprunteur', 'Emprunteur')}</option>
                    <option value="statut">{t('materiel.historique_tri_statut', 'Statut')}</option>
                </Select>
            </div>

            {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-admin-muted">{t('materiel.deplacement_vide', 'Aucun déplacement pour le moment.')}</p>
            ) : (
                <ul className="space-y-2">
                    {filtered.map((d) => (
                        <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-admin-border p-3 text-sm">
                            <div>
                                <Badge variant={d.statut === 'en_cours' ? 'default' : 'success'} className="mr-2">
                                    {d.statut_label}
                                </Badge>
                                <strong>{d.materiel_nom}</strong> — {d.emprunteur} : {d.lieu_origine} → {d.lieu_destination} ({d.quantite})
                                {d.motif && <span className="text-admin-muted"> — {d.motif}</span>}
                                <p className="mt-0.5 text-xs text-admin-muted">{formatDateTime(d.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {d.statut === 'en_cours' && can.edit && (
                                    <button onClick={() => retourner(d.id)} className="flex items-center gap-1 rounded-md border border-admin-border px-2 py-1 text-xs text-admin-text-secondary hover:bg-admin-hover">
                                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                        {t('materiel.retourner_btn', 'Retourner')}
                                    </button>
                                )}
                                {can.delete && (
                                    <button onClick={() => destroyOne(d.id)} className="rounded-md p-1.5 text-admin-text-secondary hover:bg-admin-hover hover:text-red-500">
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Index({ materiels, etats, stats, can, embedded = false }) {
    const { t } = useTranslations();
    const confirmAction = useConfirm();
    const [tab, setTab] = useState('liste');
    const [search, setSearch] = useState('');
    const [currentLieu, setCurrentLieu] = useState(null);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [statFiltre, setStatFiltre] = useState(null);
    const [viewMode, setViewMode] = useState(readViewMode);
    const form = useForm(emptyForm);

    useEffect(() => {
        try {
            localStorage.setItem(VIEW_MODE_KEY, viewMode);
        } catch {
            // storage unavailable — the choice just won't persist.
        }
    }, [viewMode]);

    const lieux = useMemo(() => {
        const map = new Map();
        materiels.forEach((m) => {
            const row = map.get(m.lieu) ?? { lieu: m.lieu, nb: 0, pannes: 0 };
            row.nb += 1;
            if (m.etat === 'en_panne') row.pannes += 1;
            map.set(m.lieu, row);
        });
        return [...map.values()].sort((a, b) => a.lieu.localeCompare(b.lieu));
    }, [materiels]);

    useEffect(() => {
        if (currentLieu === null && lieux.length > 0) setCurrentLieu(lieux[0].lieu);
    }, [lieux, currentLieu]);

    const term = search.trim().toLowerCase();
    const visibleItems = useMemo(() => {
        let rows = materiels;
        if (statFiltre) rows = rows.filter((m) => m.etat === statFiltre);
        if (term) {
            return rows.filter((m) => [m.nom, m.lieu, m.observation].some((f) => (f ?? '').toLowerCase().includes(term)));
        }
        return rows.filter((m) => m.lieu === currentLieu);
    }, [materiels, term, currentLieu, statFiltre]);

    const incomingLoans = useMemo(() => {
        if (term || !currentLieu) return [];
        const rows = [];
        materiels.forEach((m) => {
            m.deplacements
                .filter((d) => d.statut === 'en_cours' && d.lieu_destination === currentLieu)
                .forEach((d) => rows.push({ ...d, materiel_nom: m.nom }));
        });
        return rows;
    }, [materiels, currentLieu, term]);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.setData({ ...emptyForm, lieu: currentLieu ?? '' });
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(item) {
        setEditing(item);
        form.setData({ lieu: item.lieu, nom: item.nom, quantite: item.quantite, etat: item.etat, observation: item.observation ?? '' });
        form.clearErrors();
        setOpen(true);
    }

    function submit(e) {
        e.preventDefault();
        const onSuccess = () => setOpen(false);
        if (editing) {
            form.put(`/materiel/${editing.id}`, { onSuccess, preserveScroll: true });
        } else {
            form.post('/materiel', { onSuccess, preserveScroll: true });
        }
    }

    async function destroy(item) {
        if (!(await confirmAction({ message: t('materiel.confirm_suppr', 'Supprimer ce matériel ? Son historique sera supprimé avec lui.'), title: t('admin.common.delete', 'Supprimer'), details: item.nom }))) return;
        router.delete(`/materiel/${item.id}`, { preserveScroll: true });
    }

    function retournerIncoming(id) {
        router.post(`/materiel/deplacements/${id}/retourner`, {}, { preserveScroll: true });
    }

    const actions = can.create && (
        <Button onClick={openCreate} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('materiel.ajouter_btn', 'Ajouter un matériel')}
        </Button>
    );

    const content = (
        <>
            <datalist id="materiel-lieux-datalist">
                {lieux.map((l) => (
                    <option key={l.lieu} value={l.lieu} />
                ))}
            </datalist>

            <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label={t('materiel.stat_references', 'Références')} value={stats.total_references} icon={Boxes} />
                <StatCard label={t('materiel.stat_quantite', 'Quantité totale')} value={stats.total_quantite} icon={Layers} />
                <StatCard label={t('materiel.stat_lieux', 'Lieux')} value={stats.total_lieux} icon={MapPin} />
                <StatCard
                    label={t('materiel.stat_pannes', 'En panne')}
                    value={stats.total_en_panne}
                    icon={AlertTriangle}
                    onClick={() => {
                        setTab('liste');
                        setSearch('');
                        setStatFiltre(statFiltre === 'en_panne' ? null : 'en_panne');
                    }}
                    active={statFiltre === 'en_panne'}
                />
            </div>

            <div className="mb-5 flex gap-1.5 border-b border-admin-border">
                {[
                    ['liste', t('materiel.onglet_liste', 'Liste'), List],
                    ['stats', t('materiel.onglet_stats', 'Statistiques'), BarChart3],
                    ['historique', t('materiel.onglet_historique', 'Historique'), History],
                ].map(([key, label, Icon]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                            tab === key
                                ? 'border-admin-accent text-admin-text'
                                : 'border-transparent text-admin-text-secondary hover:border-admin-border hover:text-admin-text'
                        }`}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'liste' && (
                <>
                    <div className="mb-5 flex flex-wrap items-end gap-3">
                        {embedded && (
                            <div className="min-w-[220px] flex-1">
                                <Label htmlFor="materiel-recherche-embedded">{t('materiel.recherche_label', 'Rechercher')}</Label>
                                <div className="relative mt-1.5">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                                    <Input
                                        id="materiel-recherche-embedded"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('materiel.recherche_placeholder', 'Rechercher un matériel, un lieu...')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="min-w-[220px] flex-1 sm:flex-none sm:w-72">
                            <Label htmlFor="lieu-filtre">{t('materiel.champ_lieu', 'Lieu')}</Label>
                            <Select
                                id="lieu-filtre"
                                value={term ? '' : (currentLieu ?? '')}
                                onChange={(e) => {
                                    setSearch('');
                                    setCurrentLieu(e.target.value);
                                }}
                                className="mt-1.5"
                                disabled={lieux.length === 0}
                            >
                                {lieux.length === 0 && <option value="">{t('materiel.aucun_lieu', 'Aucun lieu')}</option>}
                                {lieux.map((l) => (
                                    <option key={l.lieu} value={l.lieu}>
                                        {l.lieu} ({l.nb}){l.pannes > 0 ? ` — ${l.pannes} ${t('materiel.en_panne_abbr', 'en panne')}` : ''}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        {currentLieu && lieux.find((l) => l.lieu === currentLieu)?.pannes > 0 && !term && (
                            <span className="mb-2.5 flex items-center gap-1.5 text-sm text-red-500">
                                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                                {lieux.find((l) => l.lieu === currentLieu)?.pannes} {t('materiel.en_panne_dans_lieu', 'en panne dans ce lieu')}
                            </span>
                        )}

                        <div className="mb-2.5 ml-auto flex items-center gap-1 rounded-lg border border-admin-border bg-admin-card p-1" role="group" aria-label={t('materiel.affichage', "Mode d'affichage")}>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                aria-pressed={viewMode === 'grid'}
                                title={t('materiel.affichage_grille', 'Grille')}
                                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${viewMode === 'grid' ? 'bg-admin-accent text-admin-accent-foreground' : 'text-admin-text-secondary hover:bg-admin-hover'}`}
                            >
                                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                aria-pressed={viewMode === 'list'}
                                title={t('materiel.affichage_liste', 'Liste')}
                                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${viewMode === 'list' ? 'bg-admin-accent text-admin-accent-foreground' : 'text-admin-text-secondary hover:bg-admin-hover'}`}
                            >
                                <List className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {visibleItems.length === 0 && incomingLoans.length === 0 ? (
                        <p className="admin-card py-10 text-center text-sm text-admin-muted">{t('materiel.aucun', 'Aucun matériel pour le moment.')}</p>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
                            {incomingLoans.map((loan) => (
                                <IncomingLoanCard key={`incoming-${loan.id}`} loan={loan} onRetourner={retournerIncoming} onGoToOrigine={setCurrentLieu} />
                            ))}
                            {visibleItems.map((item) => (
                                <MaterielCard key={item.id} item={item} lieux={lieux} etats={etats} can={can} onEdit={openEdit} onDelete={destroy} compact={viewMode === 'list'} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'stats' && <StatsTab materiels={materiels} etats={etats} />}
            {tab === 'historique' && <HistoriqueTab materiels={materiels} can={can} />}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? t('materiel.modifier_titre', 'Modifier le matériel') : t('materiel.ajouter_titre', 'Ajouter un matériel')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="lieu">{t('materiel.champ_lieu', 'Lieu')}</Label>
                            <Input id="lieu" list="materiel-lieux-datalist" value={form.data.lieu} onChange={(e) => form.setData('lieu', e.target.value)} className="mt-1.5" />
                            {form.errors.lieu && <p className="mt-1 text-sm text-red-500">{form.errors.lieu}</p>}
                        </div>
                        <div>
                            <Label htmlFor="nom">{t('materiel.champ_nom', 'Nom')}</Label>
                            <Input id="nom" value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} className="mt-1.5" />
                            {form.errors.nom && <p className="mt-1 text-sm text-red-500">{form.errors.nom}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="quantite">{t('materiel.champ_quantite', 'Quantité')}</Label>
                                <Input id="quantite" type="number" min="1" value={form.data.quantite} onChange={(e) => form.setData('quantite', e.target.value)} className="mt-1.5" />
                                {form.errors.quantite && <p className="mt-1 text-sm text-red-500">{form.errors.quantite}</p>}
                            </div>
                            <div>
                                <Label htmlFor="etat">{t('materiel.champ_etat', 'État')}</Label>
                                <Select id="etat" value={form.data.etat} onChange={(e) => form.setData('etat', e.target.value)} className="mt-1.5">
                                    {etats.map((e) => (
                                        <option key={e.value} value={e.value}>
                                            {e.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="observation">{t('materiel.champ_observation', 'Observation')}</Label>
                            <Input id="observation" value={form.data.observation} onChange={(e) => form.setData('observation', e.target.value)} className="mt-1.5" />
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
        </>
    );

    if (embedded) {
        return (
            <AdminLayout title={t('materiel.titre', 'Matériel')} actions={actions}>
                {content}
            </AdminLayout>
        );
    }

    return (
        <MaterielLayout
            title={t('materiel.titre', 'Matériel')}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('materiel.recherche_placeholder', 'Rechercher un matériel, un lieu...')}
            actions={actions}
        >
            {content}
        </MaterielLayout>
    );
}
