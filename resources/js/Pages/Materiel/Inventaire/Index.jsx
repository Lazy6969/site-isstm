import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, Download, Eye, MapPin, Package, PackagePlus, Pencil, Search, Wrench } from 'lucide-react';
import MaterielLayout from '../../../Components/Materiel/MaterielLayout';
import MaterielForm from '../../../Components/Materiel/MaterielForm';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import { CategoryIcon, EmptyState, PageHero, HeroButton, StatusBadge, Thumb } from '../../../Components/Materiel/kit';
import { STATUT_STYLES, formatDate } from '../../../lib/materiel';
import { cn } from '../../../lib/utils';

const PAGE_SIZE = 24;

function LoanLine({ materiel }) {
    if (materiel.emprunt) {
        return (
            <p className={cn('flex items-center gap-1.5 text-[11px] font-semibold', materiel.emprunt.en_retard ? 'text-rose-600' : 'text-sky-600')}>
                <CalendarClock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">
                    {materiel.emprunt.emprunteur_nom} · retour {formatDate(materiel.emprunt.date_retour_prevue)}
                    {materiel.emprunt.en_retard && ' (en retard)'}
                </span>
            </p>
        );
    }
    if (materiel.intervention) {
        return (
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                <Wrench className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{materiel.intervention.titre}</span>
            </p>
        );
    }

    return null;
}

export default function Index({ materiels, options, localisations }) {
    const permissions = usePage().props.auth?.permissions ?? [];
    const can = (permission) => permissions.includes(permission);

    const [search, setSearch] = useState('');
    const [statut, setStatut] = useState('');
    const [categorie, setCategorie] = useState('');
    const [localisation, setLocalisation] = useState('');
    const [view, setView] = useState('grid');
    const [page, setPage] = useState(1);
    const [panel, setPanel] = useState(() => (typeof window !== 'undefined' && window.location.hash === '#nouveau' && can('materiel.create') ? { materiel: null } : null));

    useEffect(() => setPage(1), [search, statut, categorie, localisation]);

    const counts = useMemo(() => {
        const result = { '': materiels.length };
        materiels.forEach((item) => (result[item.statut] = (result[item.statut] ?? 0) + 1));

        return result;
    }, [materiels]);

    const term = search.trim().toLowerCase();
    const filtered = useMemo(
        () =>
            materiels.filter((item) => {
                if (statut && item.statut !== statut) return false;
                if (categorie && item.categorie !== categorie) return false;
                if (localisation && item.localisation !== localisation) return false;
                if (!term) return true;

                return `${item.nom} ${item.code} ${item.marque ?? ''} ${item.modele ?? ''} ${item.numero_serie ?? ''} ${item.localisation ?? ''} ${item.emprunt?.emprunteur_nom ?? ''}`.toLowerCase().includes(term);
            }),
        [materiels, statut, categorie, localisation, term],
    );

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const editing = panel !== null;

    const chips = [['', 'Tous'], ...Object.entries(options.statuts)];
    const selectClass = 'h-10 rounded-full border border-admin-border bg-admin-card px-3.5 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

    return (
        <MaterielLayout title="Inventaire">
            <PageHero icon={Package} title="Inventaire du matériel" subtitle="Tout le matériel de l’ISSTM : où il se trouve, dans quel état, et qui l’utilise.">
                {can('materiel.export') && (
                    <HeroButton icon={Download} href="/materiel/inventaire/export">
                        Exporter
                    </HeroButton>
                )}
                {can('materiel.create') && (
                    <HeroButton icon={PackagePlus} onClick={() => setPanel({ materiel: null })}>
                        Ajouter un matériel
                    </HeroButton>
                )}
            </PageHero>

            <div className="mb-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-60 flex-1 sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, code, série, localisation, emprunteur…" className={cn(selectClass, 'w-full pl-10')} />
                    </div>
                    <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={selectClass} aria-label="Catégorie">
                        <option value="">Toutes les catégories</option>
                        {Object.entries(options.categories).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <select value={localisation} onChange={(e) => setLocalisation(e.target.value)} className={selectClass} aria-label="Localisation">
                        <option value="">Toutes les localisations</option>
                        {localisations.map((place) => (
                            <option key={place} value={place}>
                                {place}
                            </option>
                        ))}
                    </select>
                    <div className="ml-auto">
                        <ViewToggle view={view} onChange={setView} />
                    </div>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    {chips.map(([key, label]) => (
                        <button
                            key={key || 'all'}
                            type="button"
                            onClick={() => setStatut(key)}
                            aria-pressed={statut === key}
                            className={cn(
                                'flex flex-shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition',
                                statut === key ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'border border-admin-border bg-admin-card text-admin-text-secondary hover:bg-admin-hover',
                            )}
                        >
                            {key && <span className={cn('h-2 w-2 rounded-full', STATUT_STYLES[key].dot)} />}
                            {label}
                            <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', statut === key ? 'bg-white/25' : 'bg-admin-hover')}>{counts[key] ?? 0}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={cn('grid gap-5', editing && 'xl:grid-cols-[minmax(0,1fr)_430px]')}>
                <div className={cn('min-w-0', editing && 'hidden xl:block')}>
                    {filtered.length === 0 ? (
                        <EmptyState icon={Package} title={materiels.length === 0 ? 'Aucun matériel enregistré' : 'Aucun matériel ne correspond'} hint={materiels.length === 0 ? 'Ajoutez le premier matériel de l’inventaire.' : 'Modifiez la recherche ou les filtres.'} />
                    ) : view === 'grid' ? (
                        <ul className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', !editing && 'xl:grid-cols-3 2xl:grid-cols-4')}>
                            {visible.map((item) => (
                                <li key={item.id} className={cn('group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card p-4 pt-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-admin-accent/40 hover:shadow-xl hover:shadow-admin-accent/5', panel?.materiel?.id === item.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border')}>
                                    <span className={cn('absolute inset-x-0 top-0 h-1', STATUT_STYLES[item.statut].bar)} aria-hidden="true" />
                                    <div className="flex items-start gap-3">
                                        <Thumb materiel={item} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-admin-text">{item.nom}</p>
                                            <p className="truncate font-mono text-[11px] font-semibold text-admin-accent">{item.code}</p>
                                            <p className="truncate text-xs text-admin-text-secondary">{[item.marque, item.modele].filter(Boolean).join(' ') || options.categories[item.categorie]}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <StatusBadge statut={item.statut} />
                                        <span className="flex min-w-0 items-center gap-1 text-[11px] text-admin-text-secondary">
                                            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                            <span className="truncate">{item.localisation ?? 'Non localisé'}</span>
                                        </span>
                                    </div>
                                    <LoanLine materiel={item} />
                                    <div className="mt-auto flex items-center justify-between border-t border-admin-border pt-2.5">
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-admin-muted">
                                            <CategoryIcon categorie={item.categorie} className="h-3.5 w-3.5" />
                                            {options.categories[item.categorie]}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                            <Link href={`/materiel/inventaire/${item.id}`} title="Ouvrir la fiche" aria-label={`Ouvrir la fiche de ${item.nom}`} className="flex h-8 w-8 items-center justify-center rounded-full text-admin-text-secondary transition hover:scale-110 hover:bg-admin-accent/10 hover:text-admin-accent">
                                                <Eye className="h-4 w-4" aria-hidden="true" />
                                            </Link>
                                            {can('materiel.edit') && (
                                                <button type="button" onClick={() => setPanel({ materiel: item })} title="Modifier" aria-label={`Modifier ${item.nom}`} className="flex h-8 w-8 items-center justify-center rounded-full text-admin-text-secondary transition hover:scale-110 hover:bg-admin-accent/10 hover:text-admin-accent">
                                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-2.5">
                            {visible.map((item) => (
                                <li key={item.id} className={cn('group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card py-3 pl-5 pr-3 shadow-sm transition hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg lg:flex-row lg:items-center', panel?.materiel?.id === item.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border')}>
                                    <span className={cn('absolute inset-y-0 left-0 w-1', STATUT_STYLES[item.statut].bar)} aria-hidden="true" />
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <Thumb materiel={item} className="h-11 w-11" iconClass="h-5 w-5" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-admin-text">{item.nom}</p>
                                            <p className="truncate text-xs text-admin-text-secondary">
                                                <span className="font-mono font-semibold text-admin-accent">{item.code}</span> · {[item.marque, item.modele].filter(Boolean).join(' ') || options.categories[item.categorie]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="lg:w-44">
                                        <p className="flex items-center gap-1 truncate text-xs text-admin-text-secondary">
                                            <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                            {item.localisation ?? 'Non localisé'}
                                        </p>
                                        <LoanLine materiel={item} />
                                    </div>
                                    <div className="lg:w-36">
                                        <StatusBadge statut={item.statut} />
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        <Link href={`/materiel/inventaire/${item.id}`} title="Ouvrir la fiche" aria-label={`Ouvrir la fiche de ${item.nom}`} className="flex h-8 w-8 items-center justify-center rounded-full text-admin-text-secondary transition hover:scale-110 hover:bg-admin-accent/10 hover:text-admin-accent">
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                        {can('materiel.edit') && (
                                            <button type="button" onClick={() => setPanel({ materiel: item })} title="Modifier" aria-label={`Modifier ${item.nom}`} className="flex h-8 w-8 items-center justify-center rounded-full text-admin-text-secondary transition hover:scale-110 hover:bg-admin-accent/10 hover:text-admin-accent">
                                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {pageCount > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-admin-text-secondary">
                            <span>
                                Page {currentPage} / {pageCount} · {filtered.length} matériel(s)
                            </span>
                            <div className="flex gap-2">
                                <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-full border border-admin-border bg-admin-card px-4 py-2 font-medium shadow-sm transition hover:bg-admin-hover disabled:opacity-40">
                                    Précédent
                                </button>
                                <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-full border border-admin-border bg-admin-card px-4 py-2 font-medium shadow-sm transition hover:bg-admin-hover disabled:opacity-40">
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {editing && (
                    <div className="min-w-0 xl:sticky xl:top-20 xl:self-start">
                        <MaterielForm key={panel.materiel?.id ?? 'new'} materiel={panel.materiel} options={options} localisations={localisations} onClose={() => setPanel(null)} />
                    </div>
                )}
            </div>
        </MaterielLayout>
    );
}
