import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Check, Clock, ImagePlus, MapPin, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 10;

const emptyForm = {
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    lieu: '',
    categorie: 'general',
    status: 'brouillon',
    image: null,
};

const STATUS_TONES = {
    brouillon: 'border-admin-border bg-admin-hover text-admin-text-secondary',
    en_attente: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    publie: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    rejete: 'border-red-500/30 bg-red-500/10 text-red-400',
    archive: 'border-admin-border bg-transparent text-admin-muted',
};

const CATEGORY_TONES = {
    general: 'bg-slate-500/15 text-slate-400',
    examen: 'bg-red-500/15 text-red-400',
    ceremonie: 'bg-violet-500/15 text-violet-400',
    atelier: 'bg-sky-500/15 text-sky-500',
    vacances: 'bg-emerald-500/15 text-emerald-500',
    inscription: 'bg-amber-500/15 text-amber-500',
};

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';

function toDatetimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Create/edit form as an inline side panel (no modal). */
function EventPanel({ editing, categoryOptions, canPublish, onClose }) {
    const { t } = useTranslations();
    const form = useForm(
        editing
            ? {
                  titre: editing.titre,
                  description: editing.description ?? '',
                  date_debut: toDatetimeLocal(editing.date_debut),
                  date_fin: toDatetimeLocal(editing.date_fin),
                  lieu: editing.lieu ?? '',
                  categorie: editing.categorie,
                  status: editing.status,
                  image: null,
              }
            : emptyForm,
    );
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const statusOptions = canPublish
        ? [
              { value: 'brouillon', label: t('admin.common.draft', 'Brouillon') },
              { value: 'publie', label: t('admin.common.published', 'Publié') },
              { value: 'archive', label: t('admin.evenements.status_archived', 'Archivé') },
          ]
        : [
              { value: 'brouillon', label: t('admin.common.draft', 'Brouillon') },
              { value: 'en_attente', label: t('admin.evenements.submit_for_validation', 'Soumettre pour validation') },
          ];

    function pickImage(file) {
        if (!file) return;
        form.setData('image', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/evenements/${editing.id}`, options);
        } else {
            form.post('/console/evenements', options);
        }
    }

    const shownImage = preview ?? (editing?.image_path ? `/${editing.image_path}` : null);

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.evenements.edit_event', "Modifier l'événement") : t('admin.evenements.new_event', 'Nouvel événement')}
                </h2>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickImage(e.dataTransfer.files?.[0]);
                }}
                className={`group relative flex aspect-[16/7] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                }`}
            >
                {shownImage ? (
                    <>
                        <img src={shownImage} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900">
                                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                                {t('admin.hero_slides.change_media', 'Changer le fichier')}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                        <ImagePlus className="h-6 w-6 text-admin-accent" aria-hidden="true" />
                        <p className="text-sm font-medium text-admin-text">{t('admin.evenements.image_optional', 'Image (optionnel)')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            {form.errors.image && <p className="text-sm text-red-500">{form.errors.image}</p>}

            <div>
                <Label htmlFor="titre">{t('admin.common.title', 'Titre')}</Label>
                <Input id="titre" value={form.data.titre} onChange={(e) => form.setData('titre', e.target.value)} className="mt-1.5" />
                {form.errors.titre && <p className="mt-1 text-sm text-red-500">{form.errors.titre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="categorie">{t('admin.common.category', 'Catégorie')}</Label>
                    <Select id="categorie" value={form.data.categorie} onChange={(e) => form.setData('categorie', e.target.value)} className="mt-1.5">
                        {categoryOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">{t('admin.common.status', 'Statut')}</Label>
                    <Select id="status" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className="mt-1.5">
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="lieu">{t('admin.evenements.location_optional', 'Lieu (optionnel)')}</Label>
                <Input id="lieu" value={form.data.lieu} onChange={(e) => form.setData('lieu', e.target.value)} className="mt-1.5" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <Label htmlFor="date_debut">{t('admin.evenements.start_date_label', 'Date de début')}</Label>
                    <Input id="date_debut" type="datetime-local" value={form.data.date_debut} onChange={(e) => form.setData('date_debut', e.target.value)} className="mt-1.5" />
                    {form.errors.date_debut && <p className="mt-1 text-sm text-red-500">{form.errors.date_debut}</p>}
                </div>
                <div>
                    <Label htmlFor="date_fin">{t('admin.evenements.end_date_optional', 'Date de fin (optionnel)')}</Label>
                    <Input id="date_fin" type="datetime-local" value={form.data.date_fin} onChange={(e) => form.setData('date_fin', e.target.value)} className="mt-1.5" />
                    {form.errors.date_fin && <p className="mt-1 text-sm text-red-500">{form.errors.date_fin}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="description">{t('admin.evenements.description_optional', 'Description (optionnel)')}</Label>
                <Textarea id="description" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={4} className="mt-1.5" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onClose} className={ghostButton}>
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button type="submit" disabled={form.processing} className={primaryButton}>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {editing ? t('admin.common.save', 'Enregistrer') : t('admin.common.create', 'Créer')}
                </button>
            </div>
        </form>
    );
}

/** Confirmation shown over a row instead of a browser alert. */
function RowOverlay({ mode, evenement, onCancel }) {
    const { t } = useTranslations();
    const rejectForm = useForm({ rejection_reason: '' });

    function confirm() {
        if (mode === 'delete') {
            router.delete(`/console/evenements/${evenement.id}`, { preserveScroll: true, onSuccess: onCancel });
        } else if (mode === 'approve') {
            router.post(`/console/evenements/${evenement.id}/approve`, {}, { preserveScroll: true, onSuccess: onCancel });
        } else {
            rejectForm.post(`/console/evenements/${evenement.id}/reject`, { preserveScroll: true, onSuccess: onCancel });
        }
    }

    const messages = {
        delete: t('admin.evenements.confirm_delete', "Supprimer l'événement « :title » ?"),
        approve: t('admin.evenements.confirm_approve', "Valider et publier l'événement « :title » ?"),
        reject: `${t('admin.evenements.reject_dialog_title', 'Rejeter')} « :title »`,
    };
    const confirmLabels = {
        delete: t('admin.hero_slides.delete_confirm', 'Supprimer'),
        approve: t('admin.evenements.validate', 'Valider'),
        reject: t('admin.evenements.reject', 'Rejeter'),
    };
    const tones = { delete: 'bg-red-600 hover:bg-red-500', approve: 'bg-emerald-600 hover:bg-emerald-500', reject: 'bg-red-600 hover:bg-red-500' };

    return (
        <div className="animate-in fade-in-0 absolute inset-0 z-10 flex flex-wrap items-center justify-center gap-3 bg-black/80 p-3 text-center backdrop-blur-sm duration-150">
            <p className="text-sm font-medium text-white">{messages[mode].replace(':title', evenement.titre)}</p>
            {mode === 'reject' && (
                <div className="w-full max-w-md">
                    <Textarea
                        value={rejectForm.data.rejection_reason}
                        onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                        rows={2}
                        placeholder={t('admin.evenements.rejection_reason', 'Raison du rejet')}
                        className="bg-white/10 text-white placeholder:text-white/50"
                        autoFocus
                    />
                    {rejectForm.errors.rejection_reason && <p className="mt-1 text-sm text-red-400">{rejectForm.errors.rejection_reason}</p>}
                </div>
            )}
            <div className="flex gap-2">
                <button type="button" onClick={onCancel} className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/25">
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button type="button" onClick={confirm} disabled={rejectForm.processing} className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition disabled:opacity-60 ${tones[mode]}`}>
                    {confirmLabels[mode]}
                </button>
            </div>
        </div>
    );
}

export default function Index({ evenements }) {
    const { t, locale } = useTranslations();
    const { props } = usePage();
    const canPublish = (props.auth?.permissions ?? []).includes('evenements.publish');
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';

    const categoryOptions = [
        { value: 'general', label: t('admin.evenements.category_general', 'Général') },
        { value: 'examen', label: t('admin.evenements.category_examen', 'Examen') },
        { value: 'ceremonie', label: t('admin.evenements.category_ceremonie', 'Cérémonie') },
        { value: 'atelier', label: t('admin.evenements.category_atelier', 'Atelier') },
        { value: 'vacances', label: t('admin.evenements.category_vacances', 'Vacances') },
        { value: 'inscription', label: t('admin.evenements.category_inscription', 'Inscription') },
    ];
    const categoryLabels = Object.fromEntries(categoryOptions.map((c) => [c.value, c.label]));
    const statusLabels = {
        brouillon: t('admin.common.draft', 'Brouillon'),
        en_attente: t('admin.evenements.status_pending', 'En attente'),
        publie: t('admin.common.published', 'Publié'),
        rejete: t('admin.evenements.status_rejected', 'Rejeté'),
        archive: t('admin.evenements.status_archived', 'Archivé'),
    };

    const [panel, setPanel] = useState(null); // null | { evenement: object|null }
    const [overlay, setOverlay] = useState(null); // null | { id, mode }
    const [search, setSearch] = useState('');
    const [timeFilter, setTimeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [visible, setVisible] = useState(PAGE_SIZE);

    useEffect(() => setVisible(PAGE_SIZE), [search, timeFilter, statusFilter, categoryFilter]);

    const now = Date.now();
    const isUpcoming = (event) => new Date(event.date_fin ?? event.date_debut).getTime() >= now;
    const upcomingCount = evenements.filter(isUpcoming).length;

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return evenements.filter((event) => {
            if (timeFilter === 'upcoming' && !isUpcoming(event)) return false;
            if (timeFilter === 'past' && isUpcoming(event)) return false;
            if (statusFilter && event.status !== statusFilter) return false;
            if (categoryFilter && event.categorie !== categoryFilter) return false;
            if (!term) return true;
            return [event.titre, event.lieu, event.description].some((field) => (field ?? '').toLowerCase().includes(term));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evenements, search, timeFilter, statusFilter, categoryFilter]);

    const chips = [
        ['', t('admin.actualites.all', 'Tous'), evenements.length],
        ['upcoming', t('admin.evenements.upcoming', 'À venir'), upcomingCount],
        ['past', t('admin.evenements.past', 'Passés'), evenements.length - upcomingCount],
    ];

    const selectClass =
        'h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10';
    const dateParts = (value) => {
        const date = new Date(value);
        return {
            day: date.toLocaleDateString(dateLocale, { day: '2-digit' }),
            month: date.toLocaleDateString(dateLocale, { month: 'short' }),
            time: date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }),
            full: date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }),
        };
    };

    return (
        <AdminLayout title={t('admin.evenements.title', 'Événements')}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.evenements.search_placeholder', 'Rechercher un événement...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-3 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass} aria-label={t('admin.common.category', 'Catégorie')}>
                    <option value="">{t('admin.actualites.all_categories', 'Toutes les catégories')}</option>
                    {categoryOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass} aria-label={t('admin.common.status', 'Statut')}>
                    <option value="">{t('admin.evenements.all_statuses', 'Tous les statuts')}</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={() => setPanel({ evenement: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.evenements.new_event', 'Nouvel événement')}
                </button>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {chips.map(([value, label, count]) => (
                    <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setTimeFilter(value)}
                        className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                            timeFilter === value
                                ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                        }`}
                    >
                        {label}
                        <span className={`rounded-full px-1.5 text-xs ${timeFilter === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{count}</span>
                    </button>
                ))}
            </div>

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : ''}`}>
                <div>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                <CalendarDays className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <p className="text-sm text-admin-text-secondary">{t('admin.evenements.empty', 'Aucun événement pour le moment.')}</p>
                        </div>
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {filtered.slice(0, visible).map((event) => {
                                    const start = dateParts(event.date_debut);
                                    const end = event.date_fin ? dateParts(event.date_fin) : null;
                                    const past = !isUpcoming(event);
                                    const editingThis = panel?.evenement?.id === event.id;
                                    return (
                                        <li
                                            key={event.id}
                                            className={`group admin-card relative flex flex-wrap items-center gap-4 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-admin-accent/10 ${
                                                editingThis ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
                                            } ${past ? 'opacity-80' : ''} ${overlay?.id === event.id && overlay.mode === 'reject' ? 'min-h-[9.5rem]' : ''}`}
                                        >
                                            {overlay?.id === event.id && <RowOverlay mode={overlay.mode} evenement={event} onCancel={() => setOverlay(null)} />}

                                            <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/25">
                                                <span className="text-2xl font-bold leading-none">{start.day}</span>
                                                <span className="mt-0.5 text-xs font-medium uppercase">{start.month}</span>
                                            </div>

                                            {event.image_path && <img src={`/${event.image_path}`} alt="" className="hidden h-16 w-24 flex-shrink-0 rounded-lg border border-admin-border object-cover sm:block" />}

                                            <div className="min-w-0 flex-1 basis-56">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-semibold text-admin-text">{event.titre}</h3>
                                                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_TONES[event.status]}`}>{statusLabels[event.status]}</span>
                                                    {past && <span className="text-xs text-admin-muted">{t('admin.evenements.past_badge', 'Terminé')}</span>}
                                                </div>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-admin-text-secondary">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                        {start.time}
                                                        {end && ` → ${end.full !== start.full ? `${end.full} ` : ''}${end.time}`}
                                                    </span>
                                                    {event.lieu && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                            {event.lieu}
                                                        </span>
                                                    )}
                                                    <span className={`rounded-md px-1.5 py-0.5 font-medium ${CATEGORY_TONES[event.categorie] ?? CATEGORY_TONES.general}`}>
                                                        {categoryLabels[event.categorie] ?? event.categorie}
                                                    </span>
                                                </div>
                                                {event.status === 'rejete' && event.rejection_reason && (
                                                    <p className="mt-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs text-red-400">{event.rejection_reason}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-shrink-0 gap-0.5">
                                                {canPublish && event.status === 'en_attente' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOverlay({ id: event.id, mode: 'approve' })}
                                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-500"
                                                            aria-label={`${t('admin.evenements.validate', 'Valider')} ${event.titre}`}
                                                        >
                                                            <Check className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOverlay({ id: event.id, mode: 'reject' })}
                                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`${t('admin.evenements.reject', 'Rejeter')} ${event.titre}`}
                                                        >
                                                            <X className="h-[18px] w-[18px]" aria-hidden="true" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOverlay(null);
                                                        setPanel({ evenement: event });
                                                    }}
                                                    className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                                                    aria-label={`${t('admin.common.edit', 'Modifier')} ${event.titre}`}
                                                >
                                                    <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOverlay({ id: event.id, mode: 'delete' })}
                                                    className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                                                    aria-label={`${t('admin.common.delete', 'Supprimer')} ${event.titre}`}
                                                >
                                                    <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {filtered.length > visible && (
                                <div className="mt-5 flex justify-center">
                                    <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className={ghostButton}>
                                        {t('admin.actualites.load_more', 'Afficher plus')} ({filtered.length - visible})
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {panel && <EventPanel key={panel.evenement?.id ?? 'new'} editing={panel.evenement} categoryOptions={categoryOptions} canPublish={canPublish} onClose={() => setPanel(null)} />}
            </div>
        </AdminLayout>
    );
}
