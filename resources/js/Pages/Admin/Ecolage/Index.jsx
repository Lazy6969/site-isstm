import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    CalendarDays,
    Check,
    Copy,
    Eye,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    ExternalLink,
    Maximize2,
    IdCard,
    Receipt,
    Search,
    ShieldCheck,
    Trash2,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../Components/ui/dialog';
import ViewToggle from '../../../Components/Admin/ViewToggle';
import { cn } from '../../../lib/utils';
import { useTranslations } from '../../../lib/useTranslations';
import DateRangeFilter from '../../../Components/Admin/DateRangeFilter';
import { useDateRange } from '../../../lib/dateRange';
import FilterPanel from '../../../Components/Admin/FilterPanel';

const PAGE_SIZE = 8;

const STATUS = {
    en_attente: { label: 'En attente', tone: 'bg-amber-500/10 text-amber-600 ring-amber-500/25', icon: Clock },
    valide: { label: 'Validé', tone: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25', icon: CheckCircle2 },
    refuse: { label: 'Refusé', tone: 'bg-rose-500/10 text-rose-600 ring-rose-500/25', icon: XCircle },
};

const formatAmount = (value) => `${Number(value ?? 0).toLocaleString('fr-FR')} Ar`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function useCountUp(target, duration = 1000) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || target === 0) {
            setValue(target);
            return undefined;
        }
        let frame;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
}

function StatCard({ icon: Icon, label, value, suffix = '', tone, glow }) {
    const display = useCountUp(value);

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <span className={cn('pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl transition group-hover:scale-125', glow)} />
            <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-admin-text-secondary">{label}</p>
                    <p className="mt-1 truncate text-2xl font-bold tabular-nums text-admin-text">
                        {display.toLocaleString('fr-FR')}
                        {suffix && <span className="ml-1 text-sm font-semibold text-admin-text-secondary">{suffix}</span>}
                    </p>
                </div>
                <span className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition group-hover:rotate-6', tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const style = STATUS[status] ?? STATUS.en_attente;
    const Icon = style.icon;

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', style.tone)}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {style.label}
        </span>
    );
}

function initialsOf(name) {
    return (name ?? '?').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function Avatar({ student, size = 'h-10 w-10' }) {
    return student.avatar_path ? (
        <img src={`/storage/${student.avatar_path}`} alt="" className={cn('flex-shrink-0 rounded-full object-cover', size)} />
    ) : (
        <span className={cn('flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-admin-accent to-sky-500 text-xs font-bold text-white', size)}>{initialsOf(student.name)}</span>
    );
}

function ProofPanel({ title, icon: Icon, src, isPdf }) {
    const { t } = useTranslations();
    const [zoom, setZoom] = useState(false);

    return (
        <>
            <div className="min-w-0">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">
                    <Icon className="h-3.5 w-3.5 text-admin-accent" aria-hidden="true" />
                    {title}
                </p>
                <div className="group relative h-44 overflow-hidden rounded-2xl border border-admin-border bg-admin-bg/60 shadow-inner">
                    {isPdf ? <iframe title={title} src={src} className="h-full w-full" /> : <img src={src} alt={title} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                        {!isPdf && (
                            <button type="button" onClick={() => setZoom(true)} className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow transition hover:bg-white">
                                <Maximize2 className="h-3 w-3" aria-hidden="true" />
                                Agrandir
                            </button>
                        )}
                        <a href={src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow transition hover:bg-white">
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            Ouvrir
                        </a>
                    </div>
                </div>
            </div>
            {zoom && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setZoom(false)} role="dialog" aria-label={title}>
                    <img src={src} alt={title} className="max-h-full max-w-full rounded-xl shadow-2xl" />
                    <button type="button" onClick={() => setZoom(false)} aria-label={t('admin.auto.fermer_7d20', 'Fermer')} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30">
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            )}
        </>
    );
}

const STATUS_BAR = { en_attente: 'bg-amber-500', valide: 'bg-emerald-500', refuse: 'bg-rose-500' };

function IconAction({ label, icon: Icon, onClick, href, tone = 'hover:bg-admin-hover hover:text-admin-text', active = false }) {
    const className = cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-admin-muted transition duration-200 hover:scale-110',
        tone,
        active && 'bg-emerald-500/10 text-emerald-500',
    );

    return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={label} className={className}>
            <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
    ) : (
        <button type="button" onClick={onClick} title={label} aria-label={label} className={className}>
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}

/**
 * Row/card action icons: examine, validate or refuse (both open the panel on
 * the right — validation always goes through the checklist), open the two
 * proofs, copy the reference, delete.
 */
function PaymentActions({ payment, copied, onOpen, onCopy, onDelete }) {
    const { t } = useTranslations();
    const pending = payment.status === 'en_attente';
    const base = `/console/ecolage/${payment.id}`;

    return (
        <div className="flex items-center gap-0.5">
            {pending ? (
                <>
                    <IconAction label={t('admin.ecolage.verifier_valider', 'Vérifier et valider')} icon={ShieldCheck} onClick={() => onOpen(false)} tone="text-emerald-500 hover:bg-emerald-500/10" />
                    <IconAction label={t('admin.ecolage.refuser', 'Refuser')} icon={XCircle} onClick={() => onOpen(true)} tone="hover:bg-rose-500/10 hover:text-rose-500" />
                </>
            ) : (
                <IconAction label={t('admin.ecolage.voir', 'Voir')} icon={Eye} onClick={() => onOpen(false)} tone="hover:bg-admin-accent/10 hover:text-admin-accent" />
            )}
            <IconAction label={t('admin.ecolage.recu', 'Reçu de versement')} icon={Receipt} href={`${base}/fichier/receipt`} tone="hover:bg-sky-500/10 hover:text-sky-500" />
            <IconAction label={t('admin.ecolage.carte', "Carte d'étudiant")} icon={IdCard} href={`${base}/fichier/card`} tone="hover:bg-violet-500/10 hover:text-violet-500" />
            <IconAction label={copied ? t('admin.ecolage.copie', 'Référence copiée') : t('admin.ecolage.copier', 'Copier la référence')} icon={copied ? Check : Copy} onClick={onCopy} active={copied} tone="hover:bg-admin-hover hover:text-admin-text" />
            <IconAction label={t('admin.common.delete', 'Supprimer')} icon={Trash2} onClick={onDelete} tone="hover:bg-rose-500/10 hover:text-rose-500" />
        </div>
    );
}

const PANEL_ACCENT = {
    en_attente: { bar: 'bg-amber-500', icon: Clock, tone: 'text-amber-600' },
    valide: { bar: 'bg-emerald-500', icon: CheckCircle2, tone: 'text-emerald-600' },
    refuse: { bar: 'bg-rose-500', icon: XCircle, tone: 'text-rose-600' },
};

/**
 * The examination view, shown inside the page (next to the list) rather than
 * in a pop-up: who paid, the two proofs side by side, then the checks that
 * must all be ticked before the payment can be validated.
 */
function ReviewPanel({ payment, options, onClose, startRefusing = false }) {
    const { t } = useTranslations();
    const [checks, setChecks] = useState({ receipt_ok: false, card_ok: false, amount_ok: false });
    const [refusing, setRefusing] = useState(startRefusing);
    const [motif, setMotif] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const pending = payment.status === 'en_attente';
    const allChecked = Object.values(checks).every(Boolean);
    const base = `/console/ecolage/${payment.id}`;
    const accent = PANEL_ACCENT[payment.status] ?? PANEL_ACCENT.en_attente;
    const AccentIcon = accent.icon;

    function send(path, data) {
        setProcessing(true);
        setErrors({});
        router.post(`${base}/${path}`, data, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    const checklist = [
        ['receipt_ok', t('admin.ecolage.check_recu', 'Le reçu est lisible et authentique')],
        ['card_ok', t('admin.ecolage.check_carte', "Le nom et le matricule du reçu correspondent à la carte d'étudiant")],
        ['amount_ok', t('admin.ecolage.check_montant', 'Le montant ({amount}) et la référence correspondent au reçu').replace('{amount}', formatAmount(payment.amount))],
    ];

    return (
        <aside className="relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-lg" aria-label={t('admin.ecolage.examiner', 'Examiner le versement')}>
            <span className={cn('absolute inset-y-0 left-0 w-1', accent.bar)} aria-hidden="true" />

            <header className="flex items-center gap-3 border-b border-admin-border py-3 pl-5 pr-3">
                <Avatar student={payment.student} size="h-11 w-11" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-admin-text">{payment.student.name}</p>
                    <p className="truncate text-xs text-admin-text-secondary">
                        <span className="font-mono font-semibold text-admin-accent">{payment.student.matricule}</span>
                        {[payment.student.niveau, payment.student.filiere].filter(Boolean).length > 0 && ` · ${[payment.student.niveau, payment.student.filiere].filter(Boolean).join(' · ')}`}
                    </p>
                </div>
                <StatusBadge status={payment.status} />
                <button type="button" onClick={onClose} aria-label={t('admin.common.close', 'Fermer')} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </header>

            <div className="space-y-4 p-4 pl-5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">
                            {options.types[payment.type] ?? payment.type} · {payment.annee_universitaire}
                        </p>
                        <p className="text-3xl font-extrabold tabular-nums tracking-tight text-admin-text">{formatAmount(payment.amount)}</p>
                    </div>
                    <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                        <div>
                            <dt className="text-admin-muted">{t('admin.ecolage.mode', 'Mode')}</dt>
                            <dd className="font-semibold text-admin-text">{options.modes[payment.mode] ?? payment.mode}</dd>
                        </div>
                        <div>
                            <dt className="text-admin-muted">{t('admin.ecolage.reference', 'Référence')}</dt>
                            <dd className="font-mono font-semibold text-admin-text">{payment.reference}</dd>
                        </div>
                        <div>
                            <dt className="text-admin-muted">{t('admin.ecolage.date', 'Date du versement')}</dt>
                            <dd className="font-semibold text-admin-text">{formatDate(payment.paid_at)}</dd>
                        </div>
                    </dl>
                </div>

                {payment.duplicate_reference && (
                    <p className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-2.5 text-xs text-rose-600">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                        {t('admin.ecolage.doublon', 'Attention : cette référence apparaît sur un autre versement non refusé. Vérifiez qu’il ne s’agit pas d’un doublon.')}
                    </p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ProofPanel title={t('admin.ecolage.recu', 'Reçu de versement')} icon={Receipt} src={`${base}/fichier/receipt`} isPdf={payment.receipt_ext === 'pdf'} />
                    <ProofPanel title={t('admin.ecolage.carte', "Carte d'étudiant")} icon={IdCard} src={`${base}/fichier/card`} isPdf={false} />
                </div>

                {pending ? (
                    <div className="space-y-3 border-t border-admin-border pt-4">
                        {!refusing ? (
                            <>
                                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">
                                    <ShieldCheck className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                                    {t('admin.ecolage.verifications', 'Vérifications avant validation')}
                                    <span className="ml-auto rounded-full bg-admin-hover px-2 py-0.5 text-[10px] tabular-nums">{Object.values(checks).filter(Boolean).length}/3</span>
                                </p>
                                <ul className="space-y-1.5">
                                    {checklist.map(([key, label]) => (
                                        <li key={key}>
                                            <label className={cn('flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-[13px] transition-all duration-300', checks[key] ? 'border-emerald-500/40 bg-emerald-500/10 text-admin-text' : 'border-admin-border text-admin-text-secondary hover:border-admin-accent/40')}>
                                                <input type="checkbox" checked={checks[key]} onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })} className="h-4 w-4 flex-shrink-0 accent-emerald-500" />
                                                {label}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                {Object.values(errors).length > 0 && <p className="text-xs text-rose-500">{Object.values(errors)[0]}</p>}
                                <div className="flex flex-wrap justify-end gap-2">
                                    <button type="button" onClick={() => setRefusing(true)} className="rounded-full border border-rose-500/40 px-5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/10">
                                        {t('admin.ecolage.refuser', 'Refuser')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!allChecked || processing}
                                        onClick={() => send('valider', checks)}
                                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:opacity-40"
                                    >
                                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                        {t('admin.ecolage.valider', 'Valider le versement')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary" htmlFor="motif">
                                    {t('admin.ecolage.motif', 'Motif du refus (envoyé à l’étudiant)')}
                                </label>
                                <textarea
                                    id="motif"
                                    value={motif}
                                    onChange={(e) => setMotif(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    className="w-full rounded-xl border border-admin-border bg-admin-bg/50 p-3 text-sm text-admin-text outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10"
                                    placeholder={t('admin.auto.ex_recu_illisible_nom_different_de_la_ca_359d', 'Ex. reçu illisible, nom différent de la carte…')}
                                />
                                {errors.motif_refus && <p className="text-xs text-rose-500">{errors.motif_refus}</p>}
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setRefusing(false)} className="rounded-full border border-admin-border px-5 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover">
                                        {t('admin.common.cancel', 'Annuler')}
                                    </button>
                                    <button type="button" disabled={processing || motif.trim().length < 3} onClick={() => send('refuser', { motif_refus: motif })} className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 disabled:opacity-40">
                                        {t('admin.ecolage.confirmer_refus', 'Confirmer le refus')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex items-start gap-2.5 border-t border-admin-border pt-4 text-sm text-admin-text-secondary">
                        <AccentIcon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', accent.tone)} aria-hidden="true" />
                        <p>
                            {payment.status === 'valide' ? 'Validé' : 'Refusé'} {t('admin.ecolage.par', 'par')} <span className="font-semibold text-admin-text">{payment.reviewer ?? '—'}</span> {t('admin.ecolage.le', 'le')} {formatDate(payment.reviewed_at)}
                            {payment.motif_refus && <span className="mt-1 block font-medium text-rose-600">Motif : {payment.motif_refus}</span>}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}

/**
 * Warning shown before a versement is deleted: says what will happen (it goes
 * to the Corbeille, proofs included, and can be restored from there) and asks
 * for an explicit confirmation.
 */
function DeleteWarning({ payment, options, processing, onCancel, onConfirm }) {
    const { t } = useTranslations();

    return (
        <Dialog open onOpenChange={(open) => !open && !processing && onCancel()}>
            <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">
                <div className="relative flex flex-col items-center bg-gradient-to-b from-rose-500/15 to-transparent px-6 pb-2 pt-8 text-center">
                    <span className="relative flex h-16 w-16 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/25" aria-hidden="true" />
                        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/40">
                            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
                        </span>
                    </span>
                    <DialogHeader className="mt-4">
                        <DialogTitle className="text-center text-lg font-bold text-admin-text">{t('admin.ecolage.suppr_titre', 'Attention : supprimer ce versement ?')}</DialogTitle>
                        <DialogDescription className="text-center text-sm text-admin-text-secondary">
                            {t('admin.ecolage.suppr_texte', "Le versement disparaît de la liste et des totaux de l'étudiant. Il est placé dans la corbeille : vous pourrez le restaurer ou le supprimer définitivement.")}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 pb-6">
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-3">
                        <Avatar student={payment.student} size="h-10 w-10" />
                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-bold text-admin-text">{payment.student.name}</p>
                            <p className="truncate text-xs text-admin-text-secondary">
                                {options.types[payment.type] ?? payment.type} · <span className="font-mono">{payment.reference}</span>
                            </p>
                        </div>
                        <p className="text-sm font-extrabold tabular-nums text-admin-text">{formatAmount(payment.amount)}</p>
                    </div>

                    <div className="mt-5 flex gap-2">
                        <button type="button" onClick={onCancel} disabled={processing} className="flex-1 rounded-full border border-admin-border px-4 py-2.5 text-sm font-semibold text-admin-text-secondary transition hover:bg-admin-hover disabled:opacity-50">
                            {t('admin.common.cancel', 'Annuler')}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={processing}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110 disabled:opacity-60"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {t('admin.ecolage.suppr_confirmer', 'Mettre à la corbeille')}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ payments, stats, options }) {
    const { t } = useTranslations();
    const [filter, setFilter] = useState(stats.en_attente > 0 ? 'en_attente' : 'all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [openId, setOpenId] = useState(null);
    const [openRefusing, setOpenRefusing] = useState(false);
    const [view, setView] = useState('list');
    const [copiedId, setCopiedId] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [typeFilter, setTypeFilter] = useState('');
    const [modeFilter, setModeFilter] = useState('');
    const [niveauFilter, setNiveauFilter] = useState('');
    const [filiereFilter, setFiliereFilter] = useState('');
    const [anneeFilter, setAnneeFilter] = useState('');
    const [duplicatesOnly, setDuplicatesOnly] = useState(false);

    const term = search.trim().toLowerCase();
    const range = useDateRange();
    const choices = useMemo(() => {
        const unique = (values) => [...new Set(values.filter(Boolean))].sort();

        return {
            niveaux: unique(payments.map((payment) => payment.student.niveau)),
            filieres: unique(payments.map((payment) => payment.student.filiere)),
            annees: unique(payments.map((payment) => payment.annee_universitaire)).reverse(),
        };
    }, [payments]);
    const extraFilters = [typeFilter, modeFilter, niveauFilter, filiereFilter, anneeFilter].filter(Boolean).length + Number(duplicatesOnly);

    function resetExtraFilters() {
        setTypeFilter('');
        setModeFilter('');
        setNiveauFilter('');
        setFiliereFilter('');
        setAnneeFilter('');
        setDuplicatesOnly(false);
        setPage(1);
    }
    const filtered = useMemo(
        () =>
            payments.filter((payment) => {
                if (filter !== 'all' && payment.status !== filter) return false;
                if (!range.matches(payment.paid_at)) return false;
                if (typeFilter && payment.type !== typeFilter) return false;
                if (modeFilter && payment.mode !== modeFilter) return false;
                if (niveauFilter && payment.student.niveau !== niveauFilter) return false;
                if (filiereFilter && payment.student.filiere !== filiereFilter) return false;
                if (anneeFilter && payment.annee_universitaire !== anneeFilter) return false;
                if (duplicatesOnly && !payment.duplicate_reference) return false;
                if (!term) return true;

                return [
                    payment.student.name,
                    payment.student.email,
                    payment.student.matricule,
                    payment.student.numero_dossier,
                    payment.student.telephone,
                    payment.student.classe,
                    payment.reference,
                    payment.amount,
                    options.types[payment.type],
                    options.modes[payment.mode],
                ].some((field) => String(field ?? '').toLowerCase().includes(term));
            }),
        [payments, filter, term, range, typeFilter, modeFilter, niveauFilter, filiereFilter, anneeFilter, duplicatesOnly, options],
    );

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const opened = payments.find((payment) => payment.id === openId) ?? null;

    const decided = stats.valide + stats.refuse;

    const tabs = [
        ['en_attente', t('admin.ecolage.tab_attente', 'À vérifier'), stats.en_attente],
        ['valide', t('admin.ecolage.tab_valide', 'Validés'), stats.valide],
        ['refuse', t('admin.ecolage.tab_refuse', 'Refusés'), stats.refuse],
        ['all', t('admin.ecolage.tab_tous', 'Tous'), payments.length],
    ];

    function openPayment(payment, refusing = false) {
        setOpenRefusing(refusing);
        setOpenId(payment.id);
    }

    async function copyReference(payment) {
        try {
            await navigator.clipboard.writeText(payment.reference);
            setCopiedId(payment.id);
            setTimeout(() => setCopiedId(null), 1800);
        } catch {
            // Clipboard unavailable (insecure context) — nothing to do.
        }
    }

    function destroy(payment) {
        setToDelete(payment);
    }

    function confirmDelete() {
        if (!toDelete) return;
        setDeleting(true);
        router.delete(`/console/ecolage/${toDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (openId === toDelete.id) setOpenId(null);
                setToDelete(null);
            },
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <AdminLayout title={t('admin.ecolage.titre', 'Écolage')}>
            <div className="relative -mt-2 mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-admin-accent via-admin-accent/90 to-sky-500 p-5 text-white shadow-lg shadow-admin-accent/20 sm:p-6">
                <span className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
                <span className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                            <Wallet className="h-7 w-7" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">{t('admin.ecolage.banner_label', 'Suivi des versements')}</p>
                            <p className="text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl">
                                {Number(stats.total_valide).toLocaleString('fr-FR')} <span className="text-base font-semibold text-white/80">Ar</span>
                            </p>
                            <p className="text-xs text-white/80">{t('admin.ecolage.banner_hint', 'encaissés après vérification des reçus')}</p>
                        </div>
                    </div>
                    <div className="sm:w-56">
                        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/85">
                            <span>{t('admin.ecolage.taux', 'Taux de validation')}</span>
                            <span className="tabular-nums">{decided > 0 ? Math.round((stats.valide / decided) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/25">
                            <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${decided > 0 ? (stats.valide / decided) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={Clock} label={t('admin.ecolage.stat_attente', 'À vérifier')} value={stats.en_attente} tone="bg-amber-500/15 text-amber-500" glow="from-amber-500/25" />
                <StatCard icon={CheckCircle2} label={t('admin.ecolage.stat_valides', 'Validés')} value={stats.valide} tone="bg-emerald-500/15 text-emerald-500" glow="from-emerald-500/25" />
                <StatCard icon={Wallet} label={t('admin.ecolage.stat_encaisse', 'Encaissé (validé)')} value={stats.total_valide} suffix="Ar" tone="bg-admin-accent/15 text-admin-accent" glow="from-admin-accent/25" />
                <StatCard icon={Banknote} label={t('admin.ecolage.stat_en_cours', 'En cours de vérification')} value={stats.total_attente} suffix="Ar" tone="bg-sky-500/15 text-sky-500" glow="from-sky-500/25" />
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-1 overflow-x-auto rounded-2xl border border-admin-border bg-admin-card p-1 shadow-sm">
                    {tabs.map(([key, label, count]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                setFilter(key);
                                setPage(1);
                            }}
                            aria-pressed={filter === key}
                            className={cn(
                                'flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300',
                                filter === key ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/25' : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text',
                            )}
                        >
                            {label}
                            <span className={cn('rounded-full px-2 py-0.5 text-[11px]', filter === key ? 'bg-white/25' : 'bg-admin-hover')}>{count}</span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder={t('admin.ecolage.recherche', 'Nom, e-mail, matricule, dossier, référence…')}
                            className="h-10 w-full rounded-full border border-admin-border bg-admin-card pl-10 pr-4 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                        />
                    </div>
                    <ViewToggle view={view} onChange={setView} />
                    <a href="/console/ecolage/export" className="flex h-10 items-center gap-2 rounded-full border border-admin-border bg-admin-card px-4 text-sm font-semibold text-admin-text shadow-sm transition hover:bg-admin-hover">
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {t('admin.ecolage.exporter', 'Exporter')}
                    </a>
                </div>
            </div>

            <FilterPanel activeCount={extraFilters} search={search} onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}>
            <div className="flex flex-wrap items-center gap-2">
                {[
                    [typeFilter, setTypeFilter, t('admin.ecolage.filtre_type', 'Tous les types'), Object.entries(options.types)],
                    [modeFilter, setModeFilter, t('admin.ecolage.filtre_mode', 'Tous les modes'), Object.entries(options.modes)],
                    [niveauFilter, setNiveauFilter, t('admin.ecolage.filtre_niveau', 'Tous les niveaux'), choices.niveaux.map((value) => [value, value])],
                    [filiereFilter, setFiliereFilter, t('admin.ecolage.filtre_filiere', 'Toutes les filières'), choices.filieres.map((value) => [value, value])],
                    [anneeFilter, setAnneeFilter, t('admin.ecolage.filtre_annee', 'Toutes les années'), choices.annees.map((value) => [value, value])],
                ].map(([value, setValue, placeholder, entries]) => (
                    <select
                        key={placeholder}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setPage(1);
                        }}
                        aria-label={placeholder}
                        className="h-9 max-w-52 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    >
                        <option value="">{placeholder}</option>
                        {entries.map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                ))}
                <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text-secondary">
                    <input
                        type="checkbox"
                        checked={duplicatesOnly}
                        onChange={(e) => {
                            setDuplicatesOnly(e.target.checked);
                            setPage(1);
                        }}
                        className="h-4 w-4 accent-[var(--color-admin-accent)]"
                    />
                    {t('admin.ecolage.filtre_doublons', 'Références en double')}
                </label>
                {extraFilters > 0 && (
                    <button type="button" onClick={resetExtraFilters} className="h-9 rounded-lg px-3 text-sm font-medium text-admin-accent hover:bg-admin-hover">
                        {t('admin.ecolage.filtre_reset', 'Réinitialiser les filtres')}
                    </button>
                )}
                <span className="ml-auto text-xs text-admin-muted">
                    {filtered.length} {t('admin.ecolage.filtre_resultats', 'versement(s)')}
                </span>
            </div>

            <DateRangeFilter range={range} label={t('admin.dates.payment_date', 'Date du versement')} />
            </FilterPanel>

            <div className={cn('grid gap-5', opened && 'xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)]')}>
            <div className={cn('min-w-0', opened && 'hidden xl:block')}>
            {visible.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-admin-border bg-admin-card px-6 py-14 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-accent/10 text-admin-accent">
                        <Wallet className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-admin-text">{t('admin.ecolage.vide', 'Aucun versement dans cette vue.')}</p>
                    <p className="mt-1 text-xs text-admin-muted">{t('admin.ecolage.vide_hint', 'Les versements déclarés par les étudiants apparaîtront ici.')}</p>
                </div>
            ) : view === 'grid' ? (
                <ul className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', !opened && '2xl:grid-cols-3')}>
                    {visible.map((payment) => (
                        <li
                            key={payment.id}
                            className={cn(
                                'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card p-4 pt-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-admin-accent/40 hover:shadow-xl hover:shadow-admin-accent/5',
                                openId === payment.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border',
                            )}
                        >
                            <span className={cn('absolute inset-x-0 top-0 h-1', STATUS_BAR[payment.status])} aria-hidden="true" />
                            <div className="flex items-start gap-3">
                                <Avatar student={payment.student} size="h-11 w-11" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-admin-text">{payment.student.name}</p>
                                    <p className="truncate font-mono text-xs font-semibold text-admin-accent">{payment.student.matricule}</p>
                                </div>
                                <StatusBadge status={payment.status} />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold tabular-nums tracking-tight text-admin-text">{formatAmount(payment.amount)}</p>
                                <p className="mt-0.5 text-xs text-admin-text-secondary">
                                    {options.types[payment.type] ?? payment.type} · {options.modes[payment.mode] ?? payment.mode}
                                </p>
                            </div>
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-admin-muted">
                                <span className="rounded-md bg-admin-hover px-1.5 py-0.5 font-mono text-admin-text-secondary">{payment.reference}</span>
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                                    {formatDate(payment.paid_at)}
                                </span>
                                {payment.duplicate_reference && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                        {t('admin.ecolage.doublon_court', 'Doublon ?')}
                                    </span>
                                )}
                            </p>
                            <div className="mt-auto flex items-center justify-between border-t border-admin-border pt-2.5">
                                <PaymentActions payment={payment} copied={copiedId === payment.id} onOpen={(refuse) => openPayment(payment, refuse)} onCopy={() => copyReference(payment)} onDelete={() => destroy(payment)} />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="space-y-2.5">
                    {visible.map((payment) => (
                        <li
                            key={payment.id}
                            className={cn(
                                'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-admin-card py-3.5 pl-5 pr-3 shadow-sm transition hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg sm:flex-row sm:items-center',
                                openId === payment.id ? 'border-admin-accent ring-2 ring-admin-accent/20' : 'border-admin-border',
                            )}
                        >
                            <span className={cn('absolute inset-y-0 left-0 w-1', STATUS_BAR[payment.status])} aria-hidden="true" />
                            <Avatar student={payment.student} size="h-11 w-11" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-bold text-admin-text">{payment.student.name}</p>
                                    <StatusBadge status={payment.status} />
                                    {payment.duplicate_reference && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                                            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                            {t('admin.ecolage.doublon_court', 'Doublon ?')}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-admin-text-secondary">
                                    <span className="font-mono text-admin-accent">{payment.student.matricule}</span>
                                    <span>{options.types[payment.type] ?? payment.type}</span>
                                    <span className="font-mono">{payment.reference}</span>
                                    <span>{formatDate(payment.paid_at)}</span>
                                </p>
                            </div>
                            <p className="text-lg font-bold tabular-nums text-admin-text sm:text-right">{formatAmount(payment.amount)}</p>
                            <PaymentActions payment={payment} copied={copiedId === payment.id} onOpen={(refuse) => openPayment(payment, refuse)} onCopy={() => copyReference(payment)} onDelete={() => destroy(payment)} />
                        </li>
                    ))}
                </ul>
            )}

            {pageCount > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-admin-text-secondary">
                    <span>
                        {t('admin.telechargements.page', 'Page')} {currentPage} / {pageCount}
                    </span>
                    <div className="flex gap-2">
                        <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="flex items-center gap-1 rounded-full border border-admin-border bg-admin-card px-4 py-2 font-medium shadow-sm transition hover:bg-admin-hover disabled:opacity-40">
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            {t('admin.telechargements.precedent', 'Précédent')}
                        </button>
                        <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="flex items-center gap-1 rounded-full border border-admin-border bg-admin-card px-4 py-2 font-medium shadow-sm transition hover:bg-admin-hover disabled:opacity-40">
                            {t('admin.telechargements.suivant', 'Suivant')}
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            </div>
            {opened && (
                <div className="min-w-0 xl:sticky xl:top-20 xl:self-start">
                    <ReviewPanel key={`${opened.id}-${openRefusing}`} payment={opened} options={options} startRefusing={openRefusing} onClose={() => setOpenId(null)} />
                </div>
            )}
            </div>
            {toDelete && <DeleteWarning payment={toDelete} options={options} processing={deleting} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />}
        </AdminLayout>
    );
}
