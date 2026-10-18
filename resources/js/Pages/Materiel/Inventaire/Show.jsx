import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Archive, ArrowLeft, ArrowRightLeft, Calendar, CalendarPlus, CheckCircle2, ClipboardList, CornerDownLeft, Hammer, HandCoins, Hash, History, MapPin, Pencil, Tag, Trash2, Wallet, Wrench } from 'lucide-react';
import MaterielLayout from '../../../Components/Materiel/MaterielLayout';
import MaterielForm from '../../../Components/Materiel/MaterielForm';
import { BreakdownForm, FinishForm, LendForm, MaintenanceForm, MoveForm, ProlongForm, ReformForm, ReturnForm } from '../../../Components/Materiel/ActionForms';
import { CategoryIcon, EmptyState, StatusBadge, Tabs, Thumb } from '../../../Components/Materiel/kit';
import { MOUVEMENT_STYLES, STATUT_STYLES, formatDate, formatDateTime, formatMoney } from '../../../lib/materiel';
import { useConfirm } from '../../../lib/useConfirm';
import { cn } from '../../../lib/utils';

function Info({ icon: Icon, label, children }) {
    return (
        <div className="rounded-xl bg-admin-bg/60 p-3">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-admin-muted">
                <Icon className="h-3 w-3" aria-hidden="true" />
                {label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-admin-text">{children || '—'}</dd>
        </div>
    );
}

function ActionButton({ icon: Icon, children, onClick, tone = 'border-admin-border text-admin-text-secondary hover:bg-admin-hover', active }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn('flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition', tone, active && 'ring-2 ring-admin-accent/30')}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {children}
        </button>
    );
}

export default function Show({ materiel, mouvements, emprunts, interventions, options, localisations }) {
    const permissions = usePage().props.auth?.permissions ?? [];
    const can = (permission) => permissions.includes(permission);
    const confirmAction = useConfirm();
    const [action, setAction] = useState(null);
    const [tab, setTab] = useState('historique');

    const statut = materiel.statut;
    const openLoan = emprunts.find((emprunt) => emprunt.date_retour_effective === null) ?? null;
    const openIntervention = interventions.find((intervention) => intervention.ouverte) ?? null;
    const close = () => setAction(null);
    const toggle = (name) => setAction((current) => (current === name ? null : name));

    async function remove() {
        const confirmed = await confirmAction({
            title: 'Supprimer ce matériel ?',
            message: 'Il sera placé dans la corbeille de l’administration, d’où il pourra être restauré.',
            details: `${materiel.nom} · ${materiel.code}`,
            confirmLabel: 'Mettre à la corbeille',
        });
        if (confirmed) router.delete(`/materiel/inventaire/${materiel.id}`);
    }

    const style = STATUT_STYLES[statut];

    return (
        <MaterielLayout title={materiel.nom}>
            <Link href="/materiel/inventaire" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-admin-text-secondary transition hover:text-admin-accent">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Retour à l’inventaire
            </Link>

            <section className="relative mb-5 overflow-hidden rounded-3xl border border-admin-border bg-admin-card p-5 shadow-sm sm:p-6">
                <span className={cn('absolute inset-x-0 top-0 h-1.5', style.bar)} aria-hidden="true" />
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <Thumb materiel={materiel} className="h-28 w-28 sm:h-32 sm:w-32" iconClass="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold text-admin-text sm:text-2xl">{materiel.nom}</h1>
                            <StatusBadge statut={statut} />
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-admin-text-secondary">
                            <span className="font-mono font-semibold text-admin-accent">{materiel.code}</span>
                            <span className="flex items-center gap-1.5">
                                <CategoryIcon categorie={materiel.categorie} className="h-4 w-4" />
                                {options.categories[materiel.categorie]}
                            </span>
                        </p>
                        <dl className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                            <Info icon={MapPin} label="Localisation">
                                {materiel.localisation}
                            </Info>
                            <Info icon={Tag} label="Marque / modèle">
                                {[materiel.marque, materiel.modele].filter(Boolean).join(' ')}
                            </Info>
                            <Info icon={Hash} label="N° de série">
                                <span className="font-mono">{materiel.numero_serie}</span>
                            </Info>
                            <Info icon={Calendar} label="Acquisition">
                                {formatDate(materiel.date_acquisition)}
                            </Info>
                            <Info icon={Wallet} label="Valeur">
                                {formatMoney(materiel.valeur)}
                            </Info>
                        </dl>
                        {materiel.notes && <p className="mt-3 rounded-xl bg-admin-bg/60 p-3 text-sm text-admin-text-secondary">{materiel.notes}</p>}
                    </div>
                </div>

                {openLoan && (
                    <div className={cn('mt-5 flex flex-wrap items-center gap-3 rounded-2xl border p-4', openLoan.en_retard ? 'border-rose-500/30 bg-rose-500/5' : 'border-sky-500/30 bg-sky-500/5')}>
                        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', openLoan.en_retard ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500')}>
                            <ClipboardList className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="font-bold text-admin-text">
                                Prêté à {openLoan.emprunteur_nom} <span className="font-medium text-admin-text-secondary">({options.emprunteur_types[openLoan.emprunteur_type]})</span>
                            </p>
                            <p className="text-xs text-admin-text-secondary">
                                Sorti le {formatDate(openLoan.date_sortie)} · retour prévu le {formatDate(openLoan.date_retour_prevue)}
                                {openLoan.en_retard && <span className="font-bold text-rose-600"> · {openLoan.jours_retard} jour(s) de retard</span>}
                                {openLoan.emprunteur_contact && ` · ${openLoan.emprunteur_contact}`}
                            </p>
                        </div>
                    </div>
                )}
                {openIntervention && (
                    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">{openIntervention.type === 'panne' ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <Wrench className="h-5 w-5" aria-hidden="true" />}</span>
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="font-bold text-admin-text">
                                {options.intervention_types[openIntervention.type]} : {openIntervention.titre}
                            </p>
                            <p className="text-xs text-admin-text-secondary">
                                Depuis le {formatDate(openIntervention.date_debut)}
                                {openIntervention.prestataire && ` · ${openIntervention.prestataire}`}
                            </p>
                        </div>
                    </div>
                )}
            </section>

            <div className="mb-5 flex flex-wrap gap-2">
                {statut === 'disponible' && can('materiel.loan') && <ActionButton icon={HandCoins} onClick={() => toggle('preter')} active={action === 'preter'} tone="border-transparent bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25 hover:brightness-110">Prêter</ActionButton>}
                {statut === 'emprunte' && openLoan && can('materiel.loan') && (
                    <>
                        <ActionButton icon={CornerDownLeft} onClick={() => toggle('retour')} active={action === 'retour'} tone="border-transparent bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25 hover:brightness-110">Enregistrer le retour</ActionButton>
                        <ActionButton icon={CalendarPlus} onClick={() => toggle('prolonger')} active={action === 'prolonger'}>Prolonger</ActionButton>
                    </>
                )}
                {['disponible', 'en_panne', 'en_maintenance'].includes(statut) && can('materiel.move') && <ActionButton icon={ArrowRightLeft} onClick={() => toggle('deplacer')} active={action === 'deplacer'}>Déplacer</ActionButton>}
                {statut === 'disponible' && can('materiel.maintain') && (
                    <>
                        <ActionButton icon={AlertTriangle} onClick={() => toggle('panne')} active={action === 'panne'} tone="border-rose-500/40 text-rose-600 hover:bg-rose-500/10">Signaler une panne</ActionButton>
                        <ActionButton icon={Hammer} onClick={() => toggle('maintenance')} active={action === 'maintenance'} tone="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">Mettre en maintenance</ActionButton>
                    </>
                )}
                {statut === 'en_panne' && can('materiel.maintain') && <ActionButton icon={Hammer} onClick={() => toggle('maintenance')} active={action === 'maintenance'} tone="border-amber-500/40 text-amber-600 hover:bg-amber-500/10">Prendre en charge la réparation</ActionButton>}
                {['en_panne', 'en_maintenance'].includes(statut) && openIntervention && can('materiel.maintain') && <ActionButton icon={CheckCircle2} onClick={() => toggle('terminer')} active={action === 'terminer'} tone="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10">Terminer l’intervention</ActionButton>}
                {can('materiel.edit') && statut !== 'reforme' && <ActionButton icon={Pencil} onClick={() => toggle('modifier')} active={action === 'modifier'}>Modifier la fiche</ActionButton>}
                {can('materiel.edit') && !['emprunte', 'reforme'].includes(statut) && <ActionButton icon={Archive} onClick={() => toggle('reformer')} active={action === 'reformer'}>Réformer</ActionButton>}
                {can('materiel.delete') && statut !== 'emprunte' && <ActionButton icon={Trash2} onClick={remove} tone="border-rose-500/40 text-rose-600 hover:bg-rose-500/10">Supprimer</ActionButton>}
            </div>

            {action && (
                <div className="mb-5 max-w-3xl">
                    {action === 'deplacer' && <MoveForm materiel={materiel} localisations={localisations} onClose={close} />}
                    {action === 'preter' && <LendForm materiel={materiel} options={options} onClose={close} />}
                    {action === 'retour' && openLoan && <ReturnForm emprunt={openLoan} options={options} onClose={close} />}
                    {action === 'prolonger' && openLoan && <ProlongForm emprunt={openLoan} onClose={close} />}
                    {action === 'panne' && <BreakdownForm materiel={materiel} onClose={close} />}
                    {action === 'maintenance' && <MaintenanceForm materiel={materiel} onClose={close} />}
                    {action === 'terminer' && openIntervention && <FinishForm intervention={openIntervention} onClose={close} />}
                    {action === 'reformer' && <ReformForm materiel={materiel} onClose={close} />}
                    {action === 'modifier' && <MaterielForm materiel={materiel} options={options} localisations={localisations} onClose={close} />}
                </div>
            )}

            <Tabs
                tabs={[
                    ['historique', 'Historique', mouvements.length],
                    ['prets', 'Prêts', emprunts.length],
                    ['interventions', 'Pannes & maintenance', interventions.length],
                ]}
                value={tab}
                onChange={setTab}
            />

            <div className="mt-4">
                {tab === 'historique' &&
                    (mouvements.length === 0 ? (
                        <EmptyState icon={History} title="Aucun mouvement" />
                    ) : (
                        <ol className="relative space-y-4 border-l-2 border-admin-border pl-6">
                            {mouvements.map((mouvement) => (
                                <li key={mouvement.id} className="relative">
                                    <span className={cn('absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-admin-bg', MOUVEMENT_STYLES[mouvement.type])}>
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                    </span>
                                    <div className="rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm">
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <p className="text-sm font-bold text-admin-text">{mouvement.label}</p>
                                            <p className="text-[11px] text-admin-muted">
                                                {formatDateTime(mouvement.created_at)}
                                                {mouvement.user ? ` · ${mouvement.user}` : ''}
                                            </p>
                                        </div>
                                        {(mouvement.de || mouvement.vers) && (
                                            <p className="mt-1 text-xs text-admin-text-secondary">
                                                {mouvement.de ?? '—'} <span className="mx-1 text-admin-accent">→</span> {mouvement.vers ?? '—'}
                                            </p>
                                        )}
                                        {mouvement.note && <p className="mt-1 text-xs text-admin-text-secondary">{mouvement.note}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ))}

                {tab === 'prets' &&
                    (emprunts.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="Jamais prêté" hint="Les prêts de ce matériel apparaîtront ici." />
                    ) : (
                        <ul className="space-y-2.5">
                            {emprunts.map((emprunt) => (
                                <li key={emprunt.id} className="rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-admin-text">
                                            {emprunt.emprunteur_nom} <span className="text-xs font-medium text-admin-text-secondary">· {options.emprunteur_types[emprunt.emprunteur_type]}</span>
                                        </p>
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', emprunt.date_retour_effective ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25' : emprunt.en_retard ? 'bg-rose-500/10 text-rose-600 ring-rose-500/25' : 'bg-sky-500/10 text-sky-600 ring-sky-500/25')}>
                                            {emprunt.date_retour_effective ? 'Rendu' : emprunt.en_retard ? `En retard (${emprunt.jours_retard} j)` : 'En cours'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-admin-text-secondary">
                                        Sorti le {formatDate(emprunt.date_sortie)} · retour prévu {formatDate(emprunt.date_retour_prevue)}
                                        {emprunt.date_retour_effective && ` · rendu le ${formatDate(emprunt.date_retour_effective)} (${options.etats_retour[emprunt.etat_au_retour] ?? '—'})`}
                                    </p>
                                    {emprunt.motif && <p className="mt-1 text-xs text-admin-muted">Motif : {emprunt.motif}</p>}
                                    {emprunt.note_retour && <p className="mt-1 text-xs text-admin-muted">Retour : {emprunt.note_retour}</p>}
                                </li>
                            ))}
                        </ul>
                    ))}

                {tab === 'interventions' &&
                    (interventions.length === 0 ? (
                        <EmptyState icon={Wrench} title="Aucune intervention" hint="Les pannes, maintenances et réparations apparaîtront ici." />
                    ) : (
                        <ul className="space-y-2.5">
                            {interventions.map((intervention) => (
                                <li key={intervention.id} className="rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-admin-text">
                                            {intervention.titre} <span className="text-xs font-medium text-admin-text-secondary">· {options.intervention_types[intervention.type]}</span>
                                        </p>
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', intervention.ouverte ? 'bg-amber-500/10 text-amber-600 ring-amber-500/25' : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25')}>{intervention.ouverte ? 'Ouverte' : 'Terminée'}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-admin-text-secondary">
                                        Du {formatDate(intervention.date_debut)}
                                        {intervention.date_fin && ` au ${formatDate(intervention.date_fin)}`}
                                        {intervention.prestataire && ` · ${intervention.prestataire}`}
                                        {intervention.cout !== null && ` · ${formatMoney(intervention.cout)}`}
                                    </p>
                                    {intervention.description && <p className="mt-1 text-xs text-admin-muted">{intervention.description}</p>}
                                    {intervention.resolution && <p className="mt-1 text-xs text-emerald-600">Résolution : {intervention.resolution}</p>}
                                </li>
                            ))}
                        </ul>
                    ))}
            </div>
        </MaterielLayout>
    );
}
