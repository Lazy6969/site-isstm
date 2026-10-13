import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    AlertTriangle,
    BadgeCheck,
    Banknote,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    History,
    IdCard,
    Landmark,
    Plus,
    Receipt,
    Trash2,
    UploadCloud,
    XCircle,
} from 'lucide-react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../Components/ui/dialog';
import { cn } from '../../lib/utils';
import { useTranslations } from '../../lib/useTranslations';

const STATUS_STYLES = {
    en_attente: { label: 'En attente', icon: Clock, tone: 'bg-amber-500/10 text-amber-600 ring-amber-500/25 dark:text-amber-400' },
    valide: { label: 'Validé', icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400' },
    refuse: { label: 'Refusé', icon: XCircle, tone: 'bg-rose-500/10 text-rose-600 ring-rose-500/25 dark:text-rose-400' },
};

const formatAmount = (value) => `${Number(value ?? 0).toLocaleString('fr-FR')} Ar`;
const formatDate = (value) => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

function useCountUp(target, duration = 900) {
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

function StatTile({ icon: Icon, label, amount, tone }) {
    const value = useCountUp(amount);

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <span className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', tone)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="truncate text-lg font-bold tabular-nums text-isstm-navy dark:text-white">{formatAmount(value)}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] ?? STATUS_STYLES.en_attente;
    const Icon = style.icon;

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', style.tone)}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {style.label}
        </span>
    );
}

function ProofDrop({ id, label, hint, icon: Icon, accept, file, onChange, error }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!file || !file.type.startsWith('image/')) {
            setPreview(null);
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div>
            <label
                htmlFor={id}
                className={cn(
                    'group relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition',
                    file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-300 hover:border-isstm-navy/50 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800',
                    error && 'border-rose-500/60',
                )}
            >
                {preview ? (
                    <img src={preview} alt="" className="h-24 w-full rounded-lg object-contain" />
                ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-isstm-navy/10 text-isstm-navy transition group-hover:scale-110 dark:bg-white/10 dark:text-white">
                        {file ? <FileText className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
                    </span>
                )}
                <span className="text-sm font-semibold text-isstm-navy dark:text-white">{label}</span>
                <span className="max-w-full truncate text-xs text-slate-500 dark:text-slate-400">{file ? file.name : hint}</span>
                {file && <BadgeCheck className="absolute right-3 top-3 h-5 w-5 text-emerald-500" aria-hidden="true" />}
                <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
            </label>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

const inputClass =
    'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white';

/**
 * Warning shown before a student withdraws a pending versement: it is not
 * erased outright, the scolarité keeps it in its corbeille.
 */
function WithdrawWarning({ payment, types, processing, onCancel, onConfirm }) {
    const { t } = useTranslations();

    return (
        <Dialog open onOpenChange={(open) => !open && !processing && onCancel()}>
            <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 bg-white p-0 text-slate-800 shadow-2xl dark:bg-slate-800 dark:text-slate-100">
                <div className="flex flex-col items-center bg-gradient-to-b from-rose-500/15 to-transparent px-6 pb-2 pt-8 text-center">
                    <span className="relative flex h-16 w-16 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/25" aria-hidden="true" />
                        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/40">
                            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
                        </span>
                    </span>
                    <DialogHeader className="mt-4">
                        <DialogTitle className="text-center text-lg font-bold text-isstm-navy dark:text-white">{t('ecolage.retirer_titre', 'Attention : retirer ce versement ?')}</DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-600 dark:text-slate-300">
                            {t('ecolage.retirer_texte', 'Votre déclaration ne sera plus examinée par la scolarité. Pour la renvoyer, il faudra la déclarer à nouveau avec vos justificatifs.')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 pb-6">
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-3 text-left">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-isstm-navy dark:text-white">{types[payment.type] ?? payment.type}</p>
                            <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">{payment.reference}</p>
                        </div>
                        <p className="text-sm font-extrabold tabular-nums text-isstm-navy dark:text-white">{formatAmount(payment.amount)}</p>
                    </div>

                    <div className="mt-5 flex gap-2">
                        <button type="button" onClick={onCancel} disabled={processing} className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                            {t('ecolage.garder', 'Garder')}
                        </button>
                        <button type="button" onClick={onConfirm} disabled={processing} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110 disabled:opacity-60">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {t('ecolage.retirer_confirmer', 'Retirer le versement')}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ student, payments, totals, options }) {
    const { t } = useTranslations();
    const { content } = usePage().props;
    const [tab, setTab] = useState(payments.length > 0 ? 'historique' : 'declarer');
    const [toWithdraw, setToWithdraw] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);
    const bankAccount = content?.inscription_compte_bancaire;

    const form = useForm({
        annee_universitaire: options.annee_universitaire,
        type: 'v1',
        mode: 'banque',
        amount: '',
        reference: '',
        paid_at: new Date().toISOString().slice(0, 10),
        receipt: null,
        card: null,
    });

    const filled = useMemo(() => ['amount', 'reference', 'paid_at'].every((key) => String(form.data[key]).trim() !== '') && form.data.receipt && form.data.card, [form.data]);

    function submit(e) {
        e.preventDefault();
        form.post('/ecolage', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('amount', 'reference', 'receipt', 'card');
                setTab('historique');
            },
        });
    }

    function withdraw(payment) {
        setToWithdraw(payment);
    }

    function confirmWithdraw() {
        if (!toWithdraw) return;
        setWithdrawing(true);
        router.delete(`/ecolage/${toWithdraw.id}`, {
            preserveScroll: true,
            onSuccess: () => setToWithdraw(null),
            onFinish: () => setWithdrawing(false),
        });
    }

    const tabs = [
        ['declarer', t('ecolage.onglet_declarer', 'Déclarer un versement'), Plus],
        ['historique', `${t('ecolage.onglet_historique', 'Mes versements')} (${payments.length})`, History],
    ];

    return (
        <AppLayout>
            <Head title={t('ecolage.titre', 'Mon écolage')} />

            <div className="mx-auto max-w-4xl space-y-5">
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-isstm-navy via-isstm-navy to-slate-700 p-5 text-white shadow-xl sm:p-6">
                    <span className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                        <img
                            src={student.avatar_path ? `/storage/${student.avatar_path}` : '/images/logo-isstm.jpg'}
                            alt=""
                            className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover ring-2 ring-white/30"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
                                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('ecolage.titre', 'Mon écolage')}
                            </p>
                            <h1 className="truncate text-xl font-bold sm:text-2xl">{student.name}</h1>
                            <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/80">
                                <span className="inline-flex items-center gap-1.5">
                                    <IdCard className="h-4 w-4" aria-hidden="true" />
                                    {student.matricule}
                                </span>
                                {student.niveau && <span>{student.niveau}</span>}
                                {student.filiere && <span className="truncate">{student.filiere}</span>}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatTile icon={CheckCircle2} label={t('ecolage.total_valide', 'Versements validés')} amount={totals.valide} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
                    <StatTile icon={Clock} label={t('ecolage.total_attente', 'En cours de vérification')} amount={totals.en_attente} tone="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
                    <StatTile icon={XCircle} label={t('ecolage.total_refuse', 'Refusés')} amount={totals.refuse} tone="bg-rose-500/10 text-rose-600 dark:text-rose-400" />
                </div>

                <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800" role="tablist">
                    {tabs.map(([key, label, Icon]) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            onClick={() => setTab(key)}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300',
                                tab === key ? 'bg-isstm-navy text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
                            )}
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'declarer' && (
                    <Card className="p-5 sm:p-6">
                        {bankAccount && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl bg-isstm-navy/5 p-4 dark:bg-white/5">
                                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-isstm-navy text-white">
                                    <Landmark className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 text-sm">
                                    <p className="font-semibold text-isstm-navy dark:text-white">{t('ecolage.compte_titre', 'Compte pour le versement')}</p>
                                    <p className="font-mono text-base font-bold tracking-wide text-slate-800 dark:text-slate-100">{bankAccount}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {t('ecolage.compte_aide', "Après le versement, déclarez-le ici avec la photo du reçu et celle de votre carte d'étudiant.")}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label={t('ecolage.champ_type', 'Type de versement')} error={form.errors.type}>
                                    <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} className={inputClass}>
                                        {Object.entries(options.types).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label={t('ecolage.champ_mode', 'Mode de paiement')} error={form.errors.mode}>
                                    <select value={form.data.mode} onChange={(e) => form.setData('mode', e.target.value)} className={inputClass}>
                                        {Object.entries(options.modes).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label={t('ecolage.champ_montant', 'Montant versé (Ar)')} error={form.errors.amount}>
                                    <div className="relative">
                                        <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                        <input type="number" min="1000" step="1" inputMode="numeric" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} className={cn(inputClass, 'pl-9')} placeholder="250000" />
                                    </div>
                                </Field>
                                <Field label={t('ecolage.champ_date', 'Date du versement')} error={form.errors.paid_at}>
                                    <div className="relative">
                                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                        <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.data.paid_at} onChange={(e) => form.setData('paid_at', e.target.value)} className={cn(inputClass, 'pl-9')} />
                                    </div>
                                </Field>
                                <Field label={t('ecolage.champ_reference', 'Référence du reçu / bordereau')} error={form.errors.reference}>
                                    <input value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} className={cn(inputClass, 'font-mono uppercase')} placeholder="BV-2026-0001" maxLength={60} />
                                </Field>
                                <Field label={t('ecolage.champ_annee', 'Année universitaire')} error={form.errors.annee_universitaire}>
                                    <input value={form.data.annee_universitaire} onChange={(e) => form.setData('annee_universitaire', e.target.value)} className={inputClass} placeholder="2025-2026" maxLength={9} />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <ProofDrop
                                    id="ecolage-receipt"
                                    icon={Receipt}
                                    label={t('ecolage.preuve_recu', 'Reçu de versement')}
                                    hint={t('ecolage.preuve_recu_hint', 'Photo ou PDF lisible (5 Mo max)')}
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    file={form.data.receipt}
                                    onChange={(file) => form.setData('receipt', file)}
                                    error={form.errors.receipt}
                                />
                                <ProofDrop
                                    id="ecolage-card"
                                    icon={IdCard}
                                    label={t('ecolage.preuve_carte', "Carte d'étudiant")}
                                    hint={t('ecolage.preuve_carte_hint', 'Photo nette, nom et matricule visibles (4 Mo max)')}
                                    accept="image/jpeg,image/png,image/webp"
                                    file={form.data.card}
                                    onChange={(file) => form.setData('card', file)}
                                    error={form.errors.card}
                                />
                            </div>

                            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                <p>{t('ecolage.avertissement', 'La scolarité compare votre reçu à votre carte d’étudiant avant de valider. Une référence déjà déclarée est refusée.')}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing || !filled}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-isstm-navy to-slate-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                            >
                                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                                {form.processing ? t('ecolage.envoi', 'Envoi…') : t('ecolage.envoyer', 'Envoyer pour vérification')}
                            </button>
                        </form>
                    </Card>
                )}

                {tab === 'historique' &&
                    (payments.length === 0 ? (
                        <Card className="flex flex-col items-center px-6 py-12 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-isstm-navy/10 text-isstm-navy dark:bg-white/10 dark:text-white">
                                <Receipt className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <p className="mt-3 font-semibold text-isstm-navy dark:text-white">{t('ecolage.vide', 'Aucun versement déclaré pour le moment.')}</p>
                            <button type="button" onClick={() => setTab('declarer')} className="mt-3 text-sm font-semibold text-isstm-navy underline dark:text-white">
                                {t('ecolage.declarer_premier', 'Déclarer mon premier versement')}
                            </button>
                        </Card>
                    ) : (
                        <ul className="space-y-3">
                            {payments.map((payment) => (
                                <li key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-lg font-bold tabular-nums text-isstm-navy dark:text-white">{formatAmount(payment.amount)}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                {options.types[payment.type] ?? payment.type} · {options.modes[payment.mode] ?? payment.mode}
                                            </p>
                                        </div>
                                        <StatusBadge status={payment.status} />
                                    </div>
                                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="font-mono">{payment.reference}</span>
                                        <span>{formatDate(payment.paid_at)}</span>
                                        <span>{payment.annee_universitaire}</span>
                                    </p>
                                    {payment.status === 'refuse' && payment.motif_refus && (
                                        <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                            {payment.motif_refus}
                                        </p>
                                    )}
                                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                                        <a href={`/ecolage/${payment.id}/fichier/receipt`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                                            <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('ecolage.voir_recu', 'Voir le reçu')}
                                        </a>
                                        <a href={`/ecolage/${payment.id}/fichier/card`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                                            <IdCard className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t('ecolage.voir_carte', 'Voir la carte')}
                                        </a>
                                        {payment.status === 'en_attente' && (
                                            <button type="button" onClick={() => withdraw(payment)} className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10">
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                {t('ecolage.retirer', 'Retirer')}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ))}
            </div>
            {toWithdraw && <WithdrawWarning payment={toWithdraw} types={options.types} processing={withdrawing} onCancel={() => setToWithdraw(null)} onConfirm={confirmWithdraw} />}
        </AppLayout>
    );
}
