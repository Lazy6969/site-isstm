import { useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, CalendarPlus, CheckCircle2, ClipboardList, CornerDownLeft, Search, User } from 'lucide-react';
import MaterielLayout from '../../../Components/Materiel/MaterielLayout';
import { ProlongForm, ReturnForm } from '../../../Components/Materiel/ActionForms';
import { CategoryIcon, EmptyState, PageHero, StatCard, Tabs } from '../../../Components/Materiel/kit';
import { formatDate } from '../../../lib/materiel';
import { cn } from '../../../lib/utils';

function statusOf(emprunt) {
    if (emprunt.date_retour_effective) return 'rendu';

    return emprunt.en_retard ? 'retard' : 'cours';
}

const PILLS = {
    rendu: ['Rendu', 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25'],
    retard: ['En retard', 'bg-rose-500/10 text-rose-600 ring-rose-500/25'],
    cours: ['En cours', 'bg-sky-500/10 text-sky-600 ring-sky-500/25'],
};

export default function Index({ emprunts, options }) {
    const permissions = usePage().props.auth?.permissions ?? [];
    const canLoan = permissions.includes('materiel.loan');
    const [tab, setTab] = useState(emprunts.some((e) => statusOf(e) === 'retard') ? 'retard' : 'cours');
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(null);

    const month = new Date().toISOString().slice(0, 7);
    const counts = useMemo(
        () => ({
            cours: emprunts.filter((e) => statusOf(e) !== 'rendu').length,
            retard: emprunts.filter((e) => statusOf(e) === 'retard').length,
            rendu: emprunts.filter((e) => statusOf(e) === 'rendu').length,
            renduMois: emprunts.filter((e) => e.date_retour_effective?.startsWith(month)).length,
        }),
        [emprunts, month],
    );

    const term = search.trim().toLowerCase();
    const filtered = useMemo(
        () =>
            emprunts.filter((emprunt) => {
                const status = statusOf(emprunt);
                if (tab === 'cours' && status === 'rendu') return false;
                if (tab === 'retard' && status !== 'retard') return false;
                if (tab === 'rendu' && status !== 'rendu') return false;
                if (!term) return true;

                return `${emprunt.emprunteur_nom} ${emprunt.emprunteur_reference ?? ''} ${emprunt.materiel.nom} ${emprunt.materiel.code}`.toLowerCase().includes(term);
            }),
        [emprunts, tab, term],
    );

    return (
        <MaterielLayout title="Prêts & retours">
            <PageHero icon={ClipboardList} title="Prêts & retours" subtitle="Qui a emprunté quel matériel, depuis quand, et quand il doit être rendu." />

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={ClipboardList} label="Prêts en cours" value={counts.cours} tone="bg-sky-500/15 text-sky-500" glow="from-sky-500/25" />
                <StatCard icon={AlertTriangle} label="En retard" value={counts.retard} tone="bg-rose-500/15 text-rose-500" glow="from-rose-500/25" />
                <StatCard icon={CheckCircle2} label="Rendus ce mois" value={counts.renduMois} tone="bg-emerald-500/15 text-emerald-500" glow="from-emerald-500/25" />
                <StatCard icon={CalendarClock} label="Prêts enregistrés" value={emprunts.length} tone="bg-admin-accent/15 text-admin-accent" glow="from-admin-accent/25" />
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Tabs
                    tabs={[
                        ['cours', 'En cours', counts.cours],
                        ['retard', 'En retard', counts.retard],
                        ['rendu', 'Rendus', counts.rendu],
                        ['tous', 'Tous', emprunts.length],
                    ]}
                    value={tab}
                    onChange={setTab}
                />
                <div className="relative w-full lg:w-80">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Emprunteur, matériel, code…" className="h-10 w-full rounded-full border border-admin-border bg-admin-card pl-10 pr-4 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10" />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={ClipboardList} title="Aucun prêt dans cette vue" hint="Les prêts se créent depuis la fiche d’un matériel disponible." />
            ) : (
                <ul className="space-y-2.5">
                    {filtered.map((emprunt) => {
                        const status = statusOf(emprunt);
                        const [pillLabel, pillTone] = PILLS[status];
                        const expanded = open?.id === emprunt.id ? open.kind : null;

                        return (
                            <li key={emprunt.id}>
                                <div className={cn('relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card py-3.5 pl-5 pr-3 shadow-sm transition hover:border-admin-accent/40 hover:shadow-lg lg:flex-row lg:items-center', expanded ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border')}>
                                    <span className={cn('absolute inset-y-0 left-0 w-1', status === 'rendu' ? 'bg-emerald-500' : status === 'retard' ? 'bg-rose-500' : 'bg-sky-500')} aria-hidden="true" />
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-admin-accent/10 text-admin-accent">
                                            <CategoryIcon categorie={emprunt.materiel.categorie} />
                                        </span>
                                        <div className="min-w-0">
                                            <Link href={`/materiel/inventaire/${emprunt.materiel.id}`} className="block truncate text-sm font-bold text-admin-text hover:text-admin-accent">
                                                {emprunt.materiel.nom}
                                            </Link>
                                            <p className="truncate font-mono text-[11px] font-semibold text-admin-accent">{emprunt.materiel.code}</p>
                                        </div>
                                    </div>
                                    <div className="min-w-0 lg:w-56">
                                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-admin-text">
                                            <User className="h-3.5 w-3.5 flex-shrink-0 text-admin-muted" aria-hidden="true" />
                                            {emprunt.emprunteur_nom}
                                        </p>
                                        <p className="truncate text-[11px] text-admin-text-secondary">
                                            {options.emprunteur_types[emprunt.emprunteur_type]}
                                            {emprunt.emprunteur_reference ? ` · ${emprunt.emprunteur_reference}` : ''}
                                        </p>
                                    </div>
                                    <div className="text-xs text-admin-text-secondary lg:w-52">
                                        <p>
                                            Sorti le <span className="font-semibold text-admin-text">{formatDate(emprunt.date_sortie)}</span>
                                        </p>
                                        <p>
                                            {emprunt.date_retour_effective ? 'Rendu le ' : 'Retour prévu le '}
                                            <span className={cn('font-semibold', status === 'retard' ? 'text-rose-600' : 'text-admin-text')}>{formatDate(emprunt.date_retour_effective ?? emprunt.date_retour_prevue)}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 lg:w-44 lg:justify-end">
                                        <span className={cn('whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', pillTone)}>
                                            {pillLabel}
                                            {status === 'retard' && ` · ${emprunt.jours_retard} j`}
                                        </span>
                                    </div>
                                    {canLoan && status !== 'rendu' && (
                                        <div className="flex items-center gap-1.5">
                                            <button type="button" onClick={() => setOpen(expanded === 'retour' ? null : { id: emprunt.id, kind: 'retour' })} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-admin-accent to-sky-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-admin-accent/25 transition hover:brightness-110">
                                                <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                                Retour
                                            </button>
                                            <button type="button" onClick={() => setOpen(expanded === 'prolonger' ? null : { id: emprunt.id, kind: 'prolonger' })} title="Prolonger" aria-label="Prolonger le prêt" className="flex h-8 w-8 items-center justify-center rounded-full border border-admin-border text-admin-text-secondary transition hover:bg-admin-hover">
                                                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {expanded && (
                                    <div className="mt-2 max-w-2xl">
                                        {expanded === 'retour' ? <ReturnForm emprunt={emprunt} options={options} onClose={() => setOpen(null)} /> : <ProlongForm emprunt={emprunt} onClose={() => setOpen(null)} />}
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
