import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Boxes, CalendarClock, CheckCircle2, ClipboardList, Hammer, PackagePlus, Plus, TrendingUp, Wallet, Wrench } from 'lucide-react';
import MaterielLayout from '../../Components/Materiel/MaterielLayout';
import { CategoryIcon, EmptyState, HeroButton, StatCard, useCountUp } from '../../Components/Materiel/kit';
import { MOUVEMENT_STYLES, STATUT_STYLES, formatDate, formatDateTime, formatMoney } from '../../lib/materiel';
import { cn } from '../../lib/utils';

function greeting(hour) {
    if (hour >= 5 && hour < 12) return 'Bonjour';
    if (hour >= 12 && hour < 18) return 'Bonne après-midi';

    return 'Bonsoir';
}

function Card({ title, icon: Icon, action, children, className }) {
    return (
        <section className={cn('rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm', className)}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-admin-text">
                    <Icon className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function StatusBar({ parStatut, total }) {
    return (
        <div>
            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-admin-hover">
                {parStatut.map((entry) =>
                    entry.total > 0 ? (
                        <span key={entry.statut} className={cn('h-full first:rounded-l-full last:rounded-r-full', STATUT_STYLES[entry.statut].bar)} style={{ width: `${(entry.total / Math.max(1, total)) * 100}%` }} title={`${entry.label} : ${entry.total}`} />
                    ) : null,
                )}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                {parStatut.map((entry) => (
                    <li key={entry.statut} className="flex items-center gap-2 text-xs text-admin-text-secondary">
                        <span className={cn('h-2.5 w-2.5 rounded-full', STATUT_STYLES[entry.statut].dot)} />
                        {entry.label}
                        <span className="ml-auto font-bold tabular-nums text-admin-text">{entry.total}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MonthBars({ data }) {
    const max = Math.max(1, ...data.map((month) => month.total));

    return (
        <div className="flex h-32 items-end gap-2">
            {data.map((month) => (
                <div key={month.mois} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] font-bold tabular-nums text-admin-text-secondary opacity-0 transition group-hover:opacity-100">{month.total}</span>
                    <div className={cn('w-full rounded-t-lg transition-all duration-700', month.total === 0 ? 'bg-admin-hover' : 'bg-gradient-to-t from-admin-accent to-sky-400')} style={{ height: `${month.total === 0 ? 4 : Math.max(12, (month.total / max) * 100)}%` }} />
                    <span className="text-[10px] capitalize text-admin-muted">{month.label}</span>
                </div>
            ))}
        </div>
    );
}

function LoanRow({ loan, late }) {
    return (
        <li>
            <Link href={`/materiel/inventaire/${loan.materiel.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-admin-hover/60">
                <span className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl', late ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500')}>
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-admin-text">{loan.materiel.nom}</p>
                    <p className="truncate text-xs text-admin-text-secondary">
                        {loan.emprunteur_nom} · retour prévu {formatDate(loan.date_retour_prevue)}
                    </p>
                </div>
                {late ? <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-600">+{loan.jours_retard} j</span> : null}
                <ArrowRight className="h-4 w-4 text-admin-muted transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
        </li>
    );
}

export default function Dashboard({ stats, parStatut, parCategorie, empruntsParMois, retards, aRendreBientot, interventionsOuvertes, recent }) {
    const { auth } = usePage().props;
    const permissions = auth?.permissions ?? [];
    const can = (permission) => permissions.includes(permission);
    const rate = stats.total - stats.reforme > 0 ? Math.round((stats.disponible / (stats.total - stats.reforme)) * 100) : 0;
    const animatedRate = useCountUp(rate);
    const maxCategory = Math.max(1, ...parCategorie.map((entry) => entry.total));

    return (
        <MaterielLayout title="Tableau de bord">
            <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-admin-accent via-admin-accent/90 to-sky-500 p-5 text-white shadow-lg shadow-admin-accent/20 sm:p-6">
                <span className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
                <span className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                            <Boxes className="h-7 w-7" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-white/80">
                                {greeting(new Date().getHours())}, {auth?.user?.name?.split(' ')[0]}
                            </p>
                            <h1 className="text-xl font-bold sm:text-2xl">Gestion du matériel de l’ISSTM</h1>
                            <p className="mt-0.5 text-sm text-white/85">
                                {stats.disponible} disponible(s) sur {stats.total - stats.reforme} en service · valeur du parc {formatMoney(stats.valeur)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {can('materiel.create') && (
                            <HeroButton icon={PackagePlus} href="/materiel/inventaire#nouveau">
                                Ajouter un matériel
                            </HeroButton>
                        )}
                        <HeroButton icon={ClipboardList} href="/materiel/emprunts">
                            Prêts en cours
                        </HeroButton>
                        <HeroButton icon={Wrench} href="/materiel/interventions">
                            Pannes
                        </HeroButton>
                    </div>
                </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard icon={Boxes} label="Total" value={stats.total} tone="bg-admin-accent/15 text-admin-accent" glow="from-admin-accent/25" />
                <StatCard icon={CheckCircle2} label="Disponible" value={stats.disponible} tone="bg-emerald-500/15 text-emerald-500" glow="from-emerald-500/25" />
                <StatCard icon={ClipboardList} label="Emprunté" value={stats.emprunte} tone="bg-sky-500/15 text-sky-500" glow="from-sky-500/25" />
                <StatCard icon={Hammer} label="En maintenance" value={stats.en_maintenance} tone="bg-amber-500/15 text-amber-500" glow="from-amber-500/25" />
                <StatCard icon={AlertTriangle} label="En panne" value={stats.en_panne} tone="bg-rose-500/15 text-rose-500" glow="from-rose-500/25" />
                <StatCard icon={CalendarClock} label="Prêts en retard" value={stats.retards} tone="bg-orange-500/15 text-orange-500" glow="from-orange-500/25" />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
                <Card title="État du parc" icon={TrendingUp} className="xl:col-span-2" action={<span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">{animatedRate} % disponible</span>}>
                    <StatusBar parStatut={parStatut} total={stats.total} />
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">Prêts par mois</p>
                            <MonthBars data={empruntsParMois} />
                        </div>
                        <div>
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">Par catégorie</p>
                            {parCategorie.length === 0 ? (
                                <p className="text-xs text-admin-muted">Aucun matériel enregistré.</p>
                            ) : (
                                <ul className="space-y-2.5">
                                    {parCategorie.map((entry) => (
                                        <li key={entry.categorie}>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5 font-medium text-admin-text">
                                                    <CategoryIcon categorie={entry.categorie} className="h-3.5 w-3.5 text-admin-accent" />
                                                    {entry.label}
                                                </span>
                                                <span className="font-bold tabular-nums text-admin-text-secondary">{entry.total}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-admin-hover">
                                                <div className="h-full rounded-full bg-gradient-to-r from-admin-accent to-sky-400" style={{ width: `${(entry.total / maxCategory) * 100}%` }} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Valeur du parc" icon={Wallet}>
                    <p className="text-3xl font-extrabold tabular-nums tracking-tight text-admin-text">{formatMoney(stats.valeur)}</p>
                    <p className="mt-1 text-xs text-admin-text-secondary">Matériel réformé exclu</p>
                    <dl className="mt-5 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-admin-text-secondary">Réformé</dt>
                            <dd className="font-bold tabular-nums text-admin-text">{stats.reforme}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-admin-text-secondary">Interventions ouvertes</dt>
                            <dd className="font-bold tabular-nums text-admin-text">{stats.en_panne + stats.en_maintenance}</dd>
                        </div>
                    </dl>
                    {can('materiel.export') && (
                        <a href="/materiel/inventaire/export" className="mt-5 flex items-center justify-center gap-2 rounded-full border border-admin-border px-4 py-2 text-sm font-semibold text-admin-text-secondary transition hover:bg-admin-hover">
                            Exporter l’inventaire
                        </a>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <Card title="Prêts en retard" icon={CalendarClock} action={<Link href="/materiel/emprunts" className="text-xs font-semibold text-admin-accent hover:underline">Tout voir</Link>}>
                    {retards.length === 0 ? <EmptyState icon={CheckCircle2} title="Aucun retard" hint="Tous les prêts sont dans les délais." /> : <ul className="space-y-1">{retards.map((loan) => <LoanRow key={loan.id} loan={loan} late />)}</ul>}
                    {aRendreBientot.length > 0 && (
                        <>
                            <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">À rendre sous 3 jours</p>
                            <ul className="space-y-1">{aRendreBientot.map((loan) => <LoanRow key={loan.id} loan={loan} late={false} />)}</ul>
                        </>
                    )}
                </Card>

                <Card title="Pannes & maintenances ouvertes" icon={Wrench} action={<Link href="/materiel/interventions" className="text-xs font-semibold text-admin-accent hover:underline">Tout voir</Link>}>
                    {interventionsOuvertes.length === 0 ? (
                        <EmptyState icon={CheckCircle2} title="Rien en cours" hint="Aucune panne ni maintenance ouverte." />
                    ) : (
                        <ul className="space-y-1">
                            {interventionsOuvertes.map((intervention) => (
                                <li key={intervention.id}>
                                    <Link href={`/materiel/inventaire/${intervention.materiel.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-admin-hover/60">
                                        <span className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl', intervention.type === 'panne' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500')}>
                                            {intervention.type === 'panne' ? <AlertTriangle className="h-4 w-4" aria-hidden="true" /> : <Hammer className="h-4 w-4" aria-hidden="true" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-admin-text">{intervention.materiel.nom}</p>
                                            <p className="truncate text-xs text-admin-text-secondary">
                                                {intervention.titre} · depuis le {formatDate(intervention.date_debut)}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-admin-muted transition group-hover:translate-x-1" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Activité récente" icon={Plus} action={<Link href="/materiel/historique" className="text-xs font-semibold text-admin-accent hover:underline">Historique</Link>}>
                    {recent.length === 0 ? (
                        <EmptyState icon={Boxes} title="Aucune activité" hint="Les mouvements du matériel apparaîtront ici." />
                    ) : (
                        <ol className="relative space-y-3 border-l-2 border-admin-border pl-5">
                            {recent.map((mouvement) => (
                                <li key={mouvement.id} className="relative">
                                    <span className={cn('absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-admin-card', MOUVEMENT_STYLES[mouvement.type])}>
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                    </span>
                                    <p className="text-sm font-semibold text-admin-text">
                                        {mouvement.label} · <span className="font-medium text-admin-text-secondary">{mouvement.materiel.nom}</span>
                                    </p>
                                    <p className="text-[11px] text-admin-muted">
                                        {formatDateTime(mouvement.created_at)}
                                        {mouvement.user ? ` · ${mouvement.user}` : ''}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            </div>
        </MaterielLayout>
    );
}
