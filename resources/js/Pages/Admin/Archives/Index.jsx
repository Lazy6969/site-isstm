import { Fragment, useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, Fingerprint, KeyRound, Lock, LockOpen, MessageSquarePlus, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Users, X, Zap } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

const PILL = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    danger: 'border-red-500/30 bg-red-500/10 text-red-400',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
    neutral: 'border-admin-border bg-admin-hover text-admin-text-secondary',
};

const selectClass =
    'h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

function humanize(value) {
    const text = (value ?? '').replace(/[-_.]+/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function toneFor(action) {
    if (/destroy|refuse|reject/.test(action ?? '')) return 'danger';
    if (/store|approve|generate|restore/.test(action ?? '')) return 'success';
    if (/update|toggle|colors/.test(action ?? '')) return 'info';
    return 'neutral';
}

function Pill({ tone = 'neutral', children }) {
    return <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${PILL[tone]}`}>{children}</span>;
}

function displayValue(value, emptyLabel) {
    if (value === null || value === undefined || value === '') return <span className="italic text-admin-muted">{emptyLabel}</span>;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}

/** Asks for the archive key again before restoring one change. */
function RestoreControl({ archive, index, done }) {
    const { t } = useTranslations();
    const form = useForm({ password: '', change: index });
    const [open, setOpen] = useState(false);

    if (done) {
        return (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {t('admin.archives.restored', 'Restaurée')}
            </span>
        );
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-admin-accent/40 px-2.5 py-1 text-xs font-semibold text-admin-accent transition hover:bg-admin-accent hover:text-admin-accent-foreground"
            >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.archives.restore', 'Restaurer')}
            </button>
        );
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/console/archives/${archive.id}/restore`, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onFinish: () => form.reset('password'),
        });
    }

    const error = form.errors.password ?? form.errors.restore;

    return (
        <form onSubmit={submit} className="animate-in fade-in-0 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 duration-150">
            <p className="basis-full text-xs text-amber-500">
                {archive.changes[index]?.event === 'deleted'
                    ? t('admin.archives.restore_warning_deleted', "L'élément supprimé sera recréé tel qu'il était.")
                    : t('admin.archives.restore_warning', 'Les valeurs actuelles seront remplacées par les valeurs « Avant ».')}
            </p>
            <input
                type="password"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
                placeholder={t('admin.archives.key_label', "Clé de l'archive")}
                autoComplete="off"
                autoFocus
                className="h-8 min-w-0 flex-1 rounded-md border border-admin-border bg-admin-card px-2.5 text-xs text-admin-text outline-none focus:border-admin-accent/60"
            />
            <button type="submit" disabled={form.processing || !form.data.password} className="h-8 rounded-md bg-admin-accent px-3 text-xs font-semibold text-admin-accent-foreground disabled:opacity-50">
                {t('admin.archives.confirm_restore', 'Confirmer')}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-md border border-admin-border px-3 text-xs text-admin-text-secondary">
                {t('admin.common.cancel', 'Annuler')}
            </button>
            {error && <p className="basis-full text-xs text-red-400">{error}</p>}
        </form>
    );
}

/** Notes attached to an entry; the entry itself is never edited. */
function Notes({ archive, notes, dateLocale }) {
    const { t } = useTranslations();
    const form = useForm({ note: '' });

    function submit(e) {
        e.preventDefault();
        form.post(`/console/archives/${archive.id}/note`, { preserveScroll: true, onSuccess: () => form.reset('note') });
    }

    return (
        <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-admin-muted">
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.archives.notes', 'Notes')}
            </p>
            {notes.length > 0 && (
                <ul className="mb-2 space-y-1.5">
                    {notes.map((note) => (
                        <li key={note.id} className="rounded-lg border border-admin-border bg-admin-card/60 px-3 py-2 text-sm">
                            <p className="text-admin-text">{note.text}</p>
                            <p className="mt-0.5 text-xs text-admin-muted">
                                {note.user_name} · {new Date(note.created_at).toLocaleString(dateLocale)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            <form onSubmit={submit} className="flex gap-2">
                <input
                    value={form.data.note}
                    onChange={(e) => form.setData('note', e.target.value)}
                    maxLength={1000}
                    placeholder={t('admin.archives.note_placeholder', 'Ajouter une note à cette entrée...')}
                    className="h-9 min-w-0 flex-1 rounded-lg border border-admin-border bg-admin-bg/40 px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60"
                />
                <button type="submit" disabled={form.processing || !form.data.note.trim()} className="h-9 rounded-lg border border-admin-border px-3 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover disabled:opacity-40">
                    {t('admin.archives.add_note', 'Ajouter')}
                </button>
            </form>
            {form.errors.note && <p className="mt-1 text-xs text-red-400">{form.errors.note}</p>}
        </div>
    );
}

/** Old → new values of every record touched by an action, plus the submitted form. */
function Details({ archive, restoredIndexes, notes, dateLocale }) {
    const { t } = useTranslations();
    const empty = t('admin.archives.empty_value', 'vide');
    const eventLabels = {
        created: t('admin.archives.event_created', 'Création'),
        updated: t('admin.archives.event_updated', 'Modification'),
        deleted: t('admin.archives.event_deleted', 'Suppression'),
    };
    const inputEntries = Object.entries(archive.input ?? {});

    return (
        <div className="space-y-4">
            {archive.target_id && (
                <p className="rounded-lg bg-admin-accent/10 px-3 py-2 text-sm text-admin-accent">
                    {t('admin.archives.refers_to', "Concerne l'entrée n°:id").replace(':id', archive.target_id)}
                </p>
            )}

            {archive.changes.length === 0 ? (
                <p className="text-sm text-admin-muted">{t('admin.archives.no_record_changes', "Aucune donnée enregistrée n'a été modifiée par cette action.")}</p>
            ) : (
                archive.changes.map((change, index) => (
                    <div key={index} className="overflow-hidden rounded-xl border border-admin-border">
                        <div className="flex flex-wrap items-center gap-2 border-b border-admin-border bg-admin-hover/60 px-3 py-2 text-sm">
                            <Pill tone={change.event === 'deleted' ? 'danger' : change.event === 'created' ? 'success' : 'info'}>{eventLabels[change.event] ?? change.event}</Pill>
                            <span className="font-medium text-admin-text">{change.label}</span>
                            <span className="text-xs text-admin-muted">
                                {change.model} #{change.id}
                            </span>
                            {change.restorable && archive.outcome === 'success' && (
                                <span className="ml-auto">
                                    <RestoreControl archive={archive} index={index} done={restoredIndexes.includes(index)} />
                                </span>
                            )}
                        </div>
                        {Object.keys(change.fields ?? {}).length > 0 && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-admin-muted">
                                        <th className="px-3 py-2 font-medium">{t('admin.archives.field', 'Champ')}</th>
                                        <th className="px-3 py-2 font-medium">{t('admin.archives.before', 'Avant')}</th>
                                        <th className="w-6" />
                                        <th className="px-3 py-2 font-medium">{t('admin.archives.after', 'Après')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(change.fields).map(([field, [before, after]]) => (
                                        <tr key={field} className="border-t border-admin-border/60 align-top">
                                            <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-admin-text-secondary">{field}</td>
                                            <td className="max-w-xs break-words px-3 py-2 text-red-400/90">
                                                <span className="line-clamp-4">{displayValue(before, empty)}</span>
                                            </td>
                                            <td className="text-admin-muted">
                                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                            </td>
                                            <td className="max-w-xs break-words px-3 py-2 text-emerald-500">
                                                <span className="line-clamp-4">{displayValue(after, empty)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))
            )}

            {inputEntries.length > 0 && (
                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-admin-muted">{t('admin.archives.submitted_data', 'Données envoyées')}</p>
                    <pre className="max-h-48 overflow-auto rounded-lg border border-admin-border bg-admin-bg/60 p-3 text-xs text-admin-text-secondary">{JSON.stringify(archive.input, null, 2)}</pre>
                </div>
            )}

            <Notes archive={archive} notes={notes} dateLocale={dateLocale} />

            <div className="grid gap-2 text-xs text-admin-muted sm:grid-cols-2">
                <p className="flex items-center gap-1.5 break-all font-mono">
                    <Fingerprint className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    {t('admin.archives.fingerprint', 'Empreinte')} : {archive.hash.slice(0, 24)}…
                </p>
                <p className="break-all font-mono">
                    {archive.method} {archive.path} · HTTP {archive.status_code}
                </p>
            </div>
        </div>
    );
}

/** Lock now / make public or protect again / change the key — every change needs the key. */
function SecurityPanel({ security, onClose }) {
    const { t } = useTranslations();
    const visibilityForm = useForm({ password: '', protected: !security.protected });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const inputClass =
        'h-9 w-full rounded-lg border border-admin-border bg-admin-bg/40 px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';

    function submitVisibility(e) {
        e.preventDefault();
        visibilityForm.transform((data) => ({ ...data, protected: !security.protected }));
        visibilityForm.post('/console/archives/visibility', { preserveScroll: true, onSuccess: () => visibilityForm.reset('password') });
    }

    function submitPassword(e) {
        e.preventDefault();
        passwordForm.post('/console/archives/password', { preserveScroll: true, onSuccess: () => passwordForm.reset() });
    }

    return (
        <div className="admin-card animate-in fade-in-0 slide-in-from-top-1 mb-4 grid gap-5 p-5 duration-200 lg:grid-cols-2">
            <div className="lg:col-span-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-admin-text">
                    <ShieldCheck className="h-5 w-5 text-admin-accent" aria-hidden="true" />
                    {t('admin.archives.security', "Sécurité de l'archive")}
                    <Pill tone={security.protected ? 'success' : 'danger'}>{security.protected ? t('admin.archives.state_protected', 'Protégée par une clé') : t('admin.archives.state_public', 'Publique')}</Pill>
                </h2>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <form onSubmit={submitVisibility} className="space-y-3">
                <p className="text-sm font-medium text-admin-text">
                    {security.protected ? t('admin.archives.make_public', "Remettre l'archive publique") : t('admin.archives.protect_again', 'Protéger de nouveau par la clé')}
                </p>
                <p className="text-xs text-admin-text-secondary">
                    {security.protected
                        ? t('admin.archives.make_public_hint', "Tous les administrateurs autorisés pourront de nouveau consulter l'archive sans la clé. La clé reste nécessaire pour restaurer.")
                        : t('admin.archives.protect_hint', "L'archive ne sera de nouveau accessible qu'avec la clé.")}
                </p>
                <input type="password" value={visibilityForm.data.password} onChange={(e) => visibilityForm.setData('password', e.target.value)} placeholder={t('admin.archives.key_label', "Clé de l'archive")} autoComplete="off" className={inputClass} />
                {visibilityForm.errors.password && <p className="text-xs text-red-400">{visibilityForm.errors.password}</p>}
                <button type="submit" disabled={visibilityForm.processing || !visibilityForm.data.password} className="flex items-center gap-2 rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text transition hover:bg-admin-hover disabled:opacity-50">
                    {security.protected ? <LockOpen className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
                    {security.protected ? t('admin.archives.make_public_action', 'Rendre publique') : t('admin.archives.protect_action', 'Protéger')}
                </button>
            </form>

            <form onSubmit={submitPassword} className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-admin-text">
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    {t('admin.archives.change_key', 'Réinitialiser la clé')}
                </p>
                <input type="password" value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} placeholder={t('admin.archives.current_key', 'Clé actuelle')} autoComplete="off" className={inputClass} />
                {passwordForm.errors.current_password && <p className="text-xs text-red-400">{passwordForm.errors.current_password}</p>}
                <input type="password" value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} placeholder={t('admin.archives.new_key', 'Nouvelle clé (8 caractères minimum)')} autoComplete="new-password" className={inputClass} />
                {passwordForm.errors.password && <p className="text-xs text-red-400">{passwordForm.errors.password}</p>}
                <input type="password" value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} placeholder={t('admin.archives.confirm_key', 'Confirmer la nouvelle clé')} autoComplete="new-password" className={inputClass} />
                <button type="submit" disabled={passwordForm.processing || !passwordForm.data.current_password || !passwordForm.data.password} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50">
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    {t('admin.archives.change_key_action', 'Changer la clé')}
                </button>
            </form>
        </div>
    );
}

export default function Index({ archives, filters, options, stats, security, restored, notes }) {
    const { t, locale } = useTranslations();
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';
    const [search, setSearch] = useState(filters.q ?? '');
    const [showFilters, setShowFilters] = useState(Boolean(filters.user || filters.module || filters.action || filters.outcome || filters.from || filters.to));
    const [openId, setOpenId] = useState(null);
    const [integrity, setIntegrity] = useState(null); // null | { loading } | result
    const [showSecurity, setShowSecurity] = useState(false);
    const firstRender = useRef(true);

    const activeFilters = ['user', 'module', 'action', 'outcome', 'from', 'to'].filter((key) => filters[key]).length;

    function apply(next) {
        const params = Object.fromEntries(Object.entries({ ...filters, ...next }).filter(([, value]) => value !== '' && value !== null && value !== undefined));
        router.get('/console/archives', params, { preserveState: true, preserveScroll: true, replace: true });
    }

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return undefined;
        }
        const timer = setTimeout(() => apply({ q: search }), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function verify() {
        setIntegrity({ loading: true });
        try {
            const response = await fetch('/console/archives/verify', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            setIntegrity(await response.json());
        } catch {
            setIntegrity({ error: true });
        }
    }

    const moduleLabel = (module) => t(`admin.archives.module.${module}`, humanize(module));
    const actionLabel = (action) => t(`admin.archives.action.${action}`, humanize(action));
    const roleLabel = (role) => (role ? t(`admin.roles.${role === 'super-admin' ? 'super_admin' : role === 'responsable-materiel' ? 'materiel' : role}`, role) : null);
    const exportUrl = `/console/archives/export?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))).toString()}`;

    return (
        <AdminLayout title={t('admin.archives.title', 'Archives des actions')}>
            <div className="admin-card mb-4 flex flex-wrap items-center gap-4 !border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent p-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                    <Lock className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 basis-64">
                    <p className="text-sm font-semibold text-admin-text">{t('admin.archives.locked_title', 'Archive verrouillée — lecture seule')}</p>
                    <p className="text-sm text-admin-text-secondary">
                        {t('admin.archives.locked_hint', "Chaque action de l'administration est enregistrée avec son auteur, sa date et les valeurs avant / après. Aucune entrée ne peut être modifiée ni supprimée, et chaque entrée est chaînée à la précédente.")}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowSecurity((v) => !v)}
                            className="flex items-center gap-2 rounded-lg border border-admin-border px-3.5 py-2 text-sm font-medium text-admin-text transition hover:bg-admin-hover"
                        >
                            <KeyRound className="h-4 w-4" aria-hidden="true" />
                            {t('admin.archives.security', "Sécurité de l'archive")}
                        </button>
                        {security.protected && (
                            <button
                                type="button"
                                onClick={() => router.post('/console/archives/lock')}
                                className="flex items-center gap-2 rounded-lg border border-admin-border px-3.5 py-2 text-sm font-medium text-admin-text transition hover:bg-admin-hover"
                            >
                                <Lock className="h-4 w-4" aria-hidden="true" />
                                {t('admin.archives.lock_now', 'Verrouiller maintenant')}
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={verify}
                        disabled={integrity?.loading}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-60"
                    >
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        {integrity?.loading ? t('admin.archives.verifying', 'Vérification...') : t('admin.archives.verify', "Vérifier l'intégrité")}
                    </button>
                    {integrity && !integrity.loading && (
                        <p className={`flex items-center gap-1.5 text-xs font-medium ${integrity.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                            {integrity.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
                            {integrity.error
                                ? t('admin.archives.verify_error', 'Vérification impossible')
                                : integrity.ok
                                  ? t('admin.archives.verify_ok', 'Chaîne intacte : :count entrée(s) vérifiée(s)').replace(':count', integrity.checked)
                                  : t('admin.archives.verify_broken', "Altération détectée à l'entrée n°:id").replace(':id', integrity.broken_id)}
                        </p>
                    )}
                </div>
            </div>

            {showSecurity && <SecurityPanel security={security} onClose={() => setShowSecurity(false)} />}

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                    [Zap, t('admin.archives.stat_total', 'Actions archivées'), stats.total],
                    [Zap, t('admin.archives.stat_today', "Aujourd'hui"), stats.today],
                    [Users, t('admin.archives.stat_contributors', 'Contributeurs'), stats.contributors],
                    [AlertTriangle, t('admin.archives.stat_failed', 'Refusées / en erreur'), stats.failed],
                ].map(([Icon, label, value], index) => (
                    <div key={index} className="admin-card flex items-center gap-3 px-4 py-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-xs text-admin-text-secondary">{label}</p>
                            <p className="text-xl font-semibold leading-tight text-admin-text">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${
                        showFilters || activeFilters > 0 ? 'border-admin-accent/60 bg-admin-accent/10 text-admin-accent' : 'border-admin-border bg-admin-card text-admin-text hover:bg-admin-hover'
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    {showFilters ? t('admin.activity_log.hide_filters', 'Masquer les filtres') : t('admin.activity_log.show_filters', 'Afficher les filtres')}
                    {activeFilters > 0 && <span className="rounded-full bg-admin-accent px-1.5 text-xs text-admin-accent-foreground">{activeFilters}</span>}
                </button>

                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.archives.search_placeholder', 'Rechercher un auteur, un contenu, une valeur...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-9 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch('')} aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')} className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted hover:bg-admin-hover hover:text-admin-text">
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <a href={exportUrl} className="flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3.5 text-sm font-medium text-admin-text transition hover:bg-admin-hover">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('admin.activity_log.export', 'Exporter')}
                </a>
            </div>

            {showFilters && (
                <div className="admin-card animate-in fade-in-0 slide-in-from-top-1 mb-3 flex flex-wrap items-end gap-3 p-3 duration-200">
                    <select value={filters.user ?? ''} onChange={(e) => apply({ user: e.target.value })} className={selectClass} aria-label={t('admin.archives.who', 'Auteur')}>
                        <option value="">{t('admin.archives.all_users', 'Tous les auteurs')}</option>
                        {options.users.map((user) => (
                            <option key={user} value={user}>
                                {user}
                            </option>
                        ))}
                    </select>
                    <select value={filters.module ?? ''} onChange={(e) => apply({ module: e.target.value })} className={selectClass} aria-label={t('admin.archives.module', 'Module')}>
                        <option value="">{t('admin.archives.all_modules', 'Tous les modules')}</option>
                        {options.modules.map((module) => (
                            <option key={module} value={module}>
                                {moduleLabel(module)}
                            </option>
                        ))}
                    </select>
                    <select value={filters.action ?? ''} onChange={(e) => apply({ action: e.target.value })} className={selectClass} aria-label={t('admin.archives.action', 'Action')}>
                        <option value="">{t('admin.archives.all_actions', 'Toutes les actions')}</option>
                        {options.actions.map((action) => (
                            <option key={action} value={action}>
                                {actionLabel(action)}
                            </option>
                        ))}
                    </select>
                    <select value={filters.outcome ?? ''} onChange={(e) => apply({ outcome: e.target.value })} className={selectClass} aria-label={t('admin.archives.result', 'Résultat')}>
                        <option value="">{t('admin.archives.all_results', 'Tous les résultats')}</option>
                        <option value="success">{t('admin.archives.success', 'Réussie')}</option>
                        <option value="failed">{t('admin.archives.failed', 'Refusée / erreur')}</option>
                    </select>
                    <label className="text-xs text-admin-muted">
                        {t('admin.archives.from', 'Du')}
                        <input type="date" value={filters.from ?? ''} onChange={(e) => apply({ from: e.target.value })} className={`${selectClass} mt-1 block`} />
                    </label>
                    <label className="text-xs text-admin-muted">
                        {t('admin.archives.to', 'Au')}
                        <input type="date" value={filters.to ?? ''} onChange={(e) => apply({ to: e.target.value })} className={`${selectClass} mt-1 block`} />
                    </label>
                    {activeFilters > 0 && (
                        <button type="button" onClick={() => apply({ user: '', module: '', action: '', outcome: '', from: '', to: '' })} className="pb-2 text-sm font-medium text-admin-accent hover:underline">
                            {t('admin.activity_log.reset_filters', 'Réinitialiser')}
                        </button>
                    )}
                </div>
            )}

            <div className="admin-card overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="border-b border-admin-border text-left text-xs font-medium uppercase tracking-wide text-admin-muted">
                                <th className="px-4 py-3">{t('admin.archives.when', 'Quand')}</th>
                                <th className="px-3 py-3">{t('admin.archives.who', 'Auteur')}</th>
                                <th className="px-3 py-3">{t('admin.archives.module', 'Module')}</th>
                                <th className="px-3 py-3">{t('admin.archives.action', 'Action')}</th>
                                <th className="px-3 py-3">{t('admin.archives.subject', 'Élément')}</th>
                                <th className="px-3 py-3">{t('admin.archives.result', 'Résultat')}</th>
                                <th className="w-10 px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {archives.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                                <Lock className="h-6 w-6" aria-hidden="true" />
                                            </span>
                                            <span className="text-admin-muted">{t('admin.archives.empty', 'Aucune action archivée pour ces critères.')}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {archives.data.map((archive) => {
                                const open = openId === archive.id;
                                const date = new Date(archive.created_at);
                                const name = archive.user_name ?? t('admin.activity_log.system', 'Système');
                                return (
                                    <Fragment key={archive.id}>
                                        <tr
                                            onClick={() => setOpenId(open ? null : archive.id)}
                                            className={`cursor-pointer border-b border-admin-border/60 transition-colors hover:bg-admin-hover/60 ${open ? 'bg-admin-accent/5' : ''}`}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-admin-text-secondary">
                                                <span className="block">{date.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="block text-xs text-admin-muted">{date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-admin-accent/15 text-xs font-semibold text-admin-accent">{name.charAt(0).toUpperCase()}</span>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-admin-text">{name}</p>
                                                        {archive.user_role && <p className="truncate text-xs text-admin-muted">{roleLabel(archive.user_role)}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">{archive.module ? <Pill tone="neutral">{moduleLabel(archive.module)}</Pill> : '—'}</td>
                                            <td className="px-3 py-3">{archive.action ? <Pill tone={toneFor(archive.action)}>{actionLabel(archive.action)}</Pill> : '—'}</td>
                                            <td className="max-w-[240px] px-3 py-3">
                                                <p className="truncate text-admin-text">{archive.subject_label ?? '—'}</p>
                                                {archive.changes.length > 1 && <p className="text-xs text-admin-muted">+{archive.changes.length - 1}</p>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <Pill tone={archive.outcome === 'success' ? 'success' : 'danger'}>{archive.outcome === 'success' ? t('admin.archives.success', 'Réussie') : t('admin.archives.failed', 'Refusée / erreur')}</Pill>
                                            </td>
                                            <td className="px-3 py-3 text-admin-muted">
                                                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                                            </td>
                                        </tr>
                                        {open && (
                                            <tr className="border-b border-admin-border/60 bg-admin-bg/40">
                                                <td colSpan={7} className="animate-in fade-in-0 px-4 py-4 duration-150">
                                                    <p className="mb-3 text-xs text-admin-muted">
                                                        {t('admin.archives.from_ip', 'Depuis')} {archive.ip_address ?? '—'} · #{archive.id}
                                                    </p>
                                                    <Details archive={archive} restoredIndexes={restored?.[archive.id] ?? []} notes={notes?.[archive.id] ?? []} dateLocale={dateLocale} />
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border px-4 py-3 text-sm text-admin-text-secondary">
                    <span>
                        {archives.total} {t('admin.archives.entries', 'entrée(s)')}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={!archives.prev_page_url}
                            onClick={() => router.get(archives.prev_page_url, {}, { preserveState: true, preserveScroll: true })}
                            aria-label={t('admin.activity_log.previous', 'Précédent')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border transition hover:bg-admin-hover disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="tabular-nums">
                            {archives.current_page} / {archives.last_page}
                        </span>
                        <button
                            type="button"
                            disabled={!archives.next_page_url}
                            onClick={() => router.get(archives.next_page_url, {}, { preserveState: true, preserveScroll: true })}
                            aria-label={t('admin.activity_log.next', 'Suivant')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border transition hover:bg-admin-hover disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
