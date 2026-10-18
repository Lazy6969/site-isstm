import { useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Hammer, Search, Wallet, Wrench } from 'lucide-react';
import MaterielLayout from '../../../Components/Materiel/MaterielLayout';
import { FinishForm } from '../../../Components/Materiel/ActionForms';
import { CategoryIcon, EmptyState, PageHero, StatCard, Tabs } from '../../../Components/Materiel/kit';
import { formatDate, formatMoney } from '../../../lib/materiel';
import { cn } from '../../../lib/utils';

const TYPE_STYLES = {
    panne: { icon: AlertTriangle, tone: 'bg-rose-500/10 text-rose-500', bar: 'bg-rose-500' },
    maintenance: { icon: Wrench, tone: 'bg-amber-500/10 text-amber-500', bar: 'bg-amber-500' },
    reparation: { icon: Hammer, tone: 'bg-orange-500/10 text-orange-500', bar: 'bg-orange-500' },
};

export default function Index({ interventions, options, stats }) {
    const canMaintain = (usePage().props.auth?.permissions ?? []).includes('materiel.maintain');
    const [tab, setTab] = useState(stats.ouvertes > 0 ? 'ouvertes' : 'toutes');
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');
    const [finishing, setFinishing] = useState(null);

    const closed = interventions.filter((i) => !i.ouverte).length;
    const term = search.trim().toLowerCase();
    const filtered = useMemo(
        () =>
            interventions.filter((intervention) => {
                if (tab === 'ouvertes' && !intervention.ouverte) return false;
                if (tab === 'terminees' && intervention.ouverte) return false;
                if (type && intervention.type !== type) return false;
                if (!term) return true;

                return `${intervention.titre} ${intervention.materiel.nom} ${intervention.materiel.code} ${intervention.prestataire ?? ''}`.toLowerCase().includes(term);
            }),
        [interventions, tab, type, term],
    );

    return (
        <MaterielLayout title="Pannes & maintenance">
            <PageHero icon={Wrench} title="Pannes & maintenance" subtitle="Les pannes signalées, les maintenances planifiées et les réparations en cours, avec leur coût." />

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={Wrench} label="Ouvertes" value={stats.ouvertes} tone="bg-amber-500/15 text-amber-500" glow="from-amber-500/25" />
                <StatCard icon={CheckCircle2} label="Terminées" value={closed} tone="bg-emerald-500/15 text-emerald-500" glow="from-emerald-500/25" />
                <StatCard icon={AlertTriangle} label="Pannes" value={interventions.filter((i) => i.type === 'panne').length} tone="bg-rose-500/15 text-rose-500" glow="from-rose-500/25" />
                <StatCard icon={Wallet} label="Coût cumulé" value={stats.cout_total} suffix="Ar" tone="bg-admin-accent/15 text-admin-accent" glow="from-admin-accent/25" />
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs
                    tabs={[
                        ['ouvertes', 'Ouvertes', stats.ouvertes],
                        ['terminees', 'Terminées', closed],
                        ['toutes', 'Toutes', interventions.length],
                    ]}
                    value={tab}
                    onChange={setTab}
                />
                <div className="flex flex-wrap items-center gap-2">
                    <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type" className="h-10 rounded-full border border-admin-border bg-admin-card px-3.5 text-sm text-admin-text outline-none focus:border-admin-accent/60">
                        <option value="">Tous les types</option>
                        {Object.entries(options.intervention_types).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Matériel, intitulé, prestataire…" className="h-10 w-full rounded-full border border-admin-border bg-admin-card pl-10 pr-4 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10" />
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={Wrench} title="Aucune intervention dans cette vue" hint="Une panne se signale depuis la fiche d’un matériel." />
            ) : (
                <ul className="space-y-2.5">
                    {filtered.map((intervention) => {
                        const style = TYPE_STYLES[intervention.type] ?? TYPE_STYLES.maintenance;
                        const Icon = style.icon;

                        return (
                            <li key={intervention.id}>
                                <div className={cn('relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card py-3.5 pl-5 pr-3 shadow-sm transition hover:border-admin-accent/40 hover:shadow-lg lg:flex-row lg:items-center', finishing === intervention.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border')}>
                                    <span className={cn('absolute inset-y-0 left-0 w-1', intervention.ouverte ? style.bar : 'bg-emerald-500')} aria-hidden="true" />
                                    <span className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', style.tone)}>
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-admin-text">
                                            {intervention.titre} <span className="text-xs font-medium text-admin-text-secondary">· {options.intervention_types[intervention.type]}</span>
                                        </p>
                                        <p className="flex flex-wrap items-center gap-x-3 text-xs text-admin-text-secondary">
                                            <Link href={`/materiel/inventaire/${intervention.materiel.id}`} className="inline-flex items-center gap-1 font-semibold text-admin-accent hover:underline">
                                                <CategoryIcon categorie={intervention.materiel.categorie} className="h-3 w-3" />
                                                {intervention.materiel.nom} ({intervention.materiel.code})
                                            </Link>
                                            {intervention.prestataire && <span>{intervention.prestataire}</span>}
                                        </p>
                                        {intervention.description && <p className="mt-0.5 line-clamp-1 text-xs text-admin-muted">{intervention.description}</p>}
                                        {intervention.resolution && <p className="mt-0.5 line-clamp-1 text-xs text-emerald-600">Résolution : {intervention.resolution}</p>}
                                    </div>
                                    <div className="text-xs text-admin-text-secondary lg:w-48">
                                        <p>
                                            Début <span className="font-semibold text-admin-text">{formatDate(intervention.date_debut)}</span>
                                        </p>
                                        <p>{intervention.date_fin ? `Fin ${formatDate(intervention.date_fin)}` : 'En cours'}</p>
                                        {intervention.cout !== null && <p className="font-semibold text-admin-text">{formatMoney(intervention.cout)}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', intervention.ouverte ? 'bg-amber-500/10 text-amber-600 ring-amber-500/25' : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25')}>{intervention.ouverte ? 'Ouverte' : 'Terminée'}</span>
                                        {canMaintain && intervention.ouverte && (
                                            <button type="button" onClick={() => setFinishing(finishing === intervention.id ? null : intervention.id)} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition hover:brightness-110">
                                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                Terminer
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {finishing === intervention.id && (
                                    <div className="mt-2 max-w-2xl">
                                        <FinishForm intervention={intervention} onClose={() => setFinishing(null)} />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </MaterielLayout>
    );
}
