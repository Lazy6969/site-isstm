import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Building2, Check, ExternalLink, Images, LayoutGrid, List, Pencil, Plus, Search, Sparkles, Trash2, Upload, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Textarea } from '../../../Components/ui/textarea';
import PhotoLightbox from '../../../Components/Admin/PhotoLightbox';
import { useTranslations } from '../../../lib/useTranslations';

const emptyForm = {
    bloc_key: '',
    nom: '',
    signification: '',
    fondation: '',
    fondateurs: '',
    slogan: '',
    objectifs: '',
    activites: '',
    danse: '',
    mampiavaka: '',
};

const FIELD_KEYS = Object.keys(emptyForm);
/** Fields counted in the "fiche complète" score (key + name are always present). */
const SCORED_FIELDS = ['signification', 'fondation', 'fondateurs', 'slogan', 'objectifs', 'activites', 'danse', 'mampiavaka'];

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';

/** 0–100: how complete a block's sheet is (8 text fields + at least one photo). */
function completeness(bloc) {
    const filled = SCORED_FIELDS.filter((key) => (bloc[key] ?? '').trim() !== '').length + ((bloc.images ?? []).length > 0 ? 1 : 0);
    return Math.round((filled / (SCORED_FIELDS.length + 1)) * 100);
}

function scoreTone(score) {
    if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-500' };
    if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-500' };
    return { stroke: '#ef4444', text: 'text-red-400' };
}

function ScoreRing({ score, size = 44 }) {
    const tone = scoreTone(score);
    const radius = (size - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }} title={`${score}%`}>
            <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-admin-border" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={tone.stroke}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - score / 100)}
                    className="transition-all duration-700"
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[0.65rem] font-bold ${tone.text}`}>{score}%</span>
        </div>
    );
}

/** Card cover: crossfades through the block's photos while hovered. */
function CoverSlideshow({ images, compact = false }) {
    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (!hovered || images.length < 2) return undefined;
        const timer = setInterval(() => setActive((i) => (i + 1) % images.length), 1100);
        return () => clearInterval(timer);
    }, [hovered, images.length]);

    useEffect(() => {
        if (!hovered) setActive(0);
    }, [hovered]);

    return (
        <div className={`relative overflow-hidden bg-admin-bg ${compact ? 'aspect-[16/10]' : 'aspect-[16/9]'}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {images.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-admin-accent/20 to-transparent text-admin-accent/60">
                    <Building2 className="h-12 w-12" aria-hidden="true" />
                </div>
            ) : (
                images.map((image, i) => (
                    <img
                        key={image}
                        src={`/${image}`}
                        alt=""
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
            {images.length > 1 && (
                <div className="absolute bottom-2 left-3 flex gap-1" aria-hidden="true">
                    {images.slice(0, 8).map((image, i) => (
                        <span key={image} className={`h-1 rounded-full transition-all ${i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                    ))}
                </div>
            )}
        </div>
    );
}

/** Create/edit form as an inline side panel (no modal). */
function BlocPanel({ editing, onClose }) {
    const { t } = useTranslations();
    const form = useForm(editing ? Object.fromEntries(FIELD_KEYS.map((key) => [key, editing[key] ?? ''])) : emptyForm);

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true };
        if (editing) {
            form.put(`/console/campus/${editing.id}`, options);
        } else {
            form.post('/console/campus', options);
        }
    }

    const field = (name, label, { textarea = false, rows = 3, placeholder } = {}) => {
        const Field = textarea ? Textarea : Input;
        return (
            <div>
                <Label htmlFor={name}>{label}</Label>
                <Field id={name} value={form.data[name]} onChange={(e) => form.setData(name, e.target.value)} rows={textarea ? rows : undefined} placeholder={placeholder} className="mt-1.5" />
                {form.errors[name] && <p className="mt-1 text-sm text-red-500">{form.errors[name]}</p>}
            </div>
        );
    };

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">{editing ? t('admin.campus.edit_block', 'Modifier le bloc') : t('admin.campus.new_block', 'Nouveau bloc')}</h2>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {field('bloc_key', t('admin.campus.key_url_label', "Clé (identifiant d'URL)"), { placeholder: 'bloc-a' })}
                {field('nom', t('admin.common.name', 'Nom'))}
            </div>
            {field('signification', t('admin.campus.signification_optional', 'Signification (optionnel)'), { textarea: true, rows: 2 })}
            <div className="grid grid-cols-2 gap-3">
                {field('fondation', t('admin.campus.foundation_optional', 'Fondation (optionnel)'))}
                {field('fondateurs', t('admin.campus.founders_optional', 'Fondateurs (optionnel)'))}
            </div>
            {field('slogan', t('admin.campus.slogan_optional', 'Slogan (optionnel)'))}
            {field('objectifs', t('admin.campus.objectives_optional', 'Objectifs (optionnel)'), { textarea: true })}
            {field('activites', t('admin.campus.activities_optional', 'Activités (optionnel)'), { textarea: true })}
            <div className="grid grid-cols-2 gap-3">
                {field('danse', t('admin.campus.dance_optional', 'Danse (optionnel)'))}
                {field('mampiavaka', t('admin.campus.distinguishing_optional', 'Ce qui les distingue (optionnel)'))}
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

/** Photo manager as an inline side panel: multi-drop upload, gallery, click to open the viewer. */
function PhotosPanel({ bloc, onClose, onOpenViewer }) {
    const { t } = useTranslations();
    const form = useForm({ photos: [] });
    const [previews, setPreviews] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [confirmIndex, setConfirmIndex] = useState(null);
    const inputRef = useRef(null);
    const images = bloc.images ?? [];

    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    function pickFiles(fileList) {
        const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/'));
        if (files.length === 0) return;
        form.setData('photos', files);
        setPreviews(files.map((file) => URL.createObjectURL(file)));
    }

    function upload(e) {
        e.preventDefault();
        form.post(`/console/campus/${bloc.id}/photos`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setPreviews([]);
                form.reset();
            },
        });
    }

    function destroyPhoto(index) {
        router.delete(`/console/campus/${bloc.id}/photos/${index}`, { preserveScroll: true, onSuccess: () => setConfirmIndex(null) });
    }

    return (
        <div className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">{t('admin.campus.photos', 'Photos')}</p>
                    <h2 className="truncate text-base font-semibold text-admin-text">{bloc.nom}</h2>
                </div>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <form onSubmit={upload} className="space-y-3">
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
                        pickFiles(e.dataTransfer.files);
                    }}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
                        dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                    }`}
                >
                    <Upload className="h-6 w-6 text-admin-accent" aria-hidden="true" />
                    <p className="text-sm font-medium text-admin-text">{t('admin.campus.drop_photos', 'Glissez plusieurs photos ici')}</p>
                    <p className="text-xs text-admin-muted">{t('admin.hero_slides.or_browse', 'ou cliquez pour parcourir')}</p>
                    <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => pickFiles(e.target.files)} className="sr-only" tabIndex={-1} />
                </div>
                {form.errors['photos.0'] && <p className="text-sm text-red-500">{form.errors['photos.0']}</p>}
                {form.errors.photos && <p className="text-sm text-red-500">{form.errors.photos}</p>}

                {previews.length > 0 && (
                    <>
                        <ul className="grid grid-cols-4 gap-2">
                            {previews.map((url) => (
                                <li key={url} className="aspect-square overflow-hidden rounded-lg border border-admin-accent/50">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviews([]);
                                    form.reset();
                                }}
                                className={ghostButton}
                            >
                                {t('admin.common.cancel', 'Annuler')}
                            </button>
                            <button type="submit" disabled={form.processing} className={primaryButton}>
                                <Upload className="h-4 w-4" aria-hidden="true" />
                                {t('admin.common.add', 'Ajouter')} ({previews.length})
                            </button>
                        </div>
                    </>
                )}
            </form>

            {images.length === 0 ? (
                <p className="py-6 text-center text-sm text-admin-muted">{t('admin.campus.no_photos', 'Aucune photo pour ce bloc.')}</p>
            ) : (
                <ul className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                        <li key={image} className="group relative aspect-square overflow-hidden rounded-lg border border-admin-border">
                            <button type="button" onClick={() => onOpenViewer(index)} className="h-full w-full" aria-label={t('admin.campus.open_viewer', 'Agrandir la photo')}>
                                <img src={`/${image}`} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            </button>
                            {confirmIndex === index ? (
                                <div className="animate-in fade-in-0 absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/80 p-1 duration-150">
                                    <button type="button" onClick={() => destroyPhoto(index)} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                                        {t('admin.hero_slides.delete_confirm', 'Supprimer')}
                                    </button>
                                    <button type="button" onClick={() => setConfirmIndex(null)} className="rounded-md bg-white/15 px-2 py-1 text-xs text-white">
                                        {t('admin.common.cancel', 'Annuler')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConfirmIndex(index)}
                                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
                                    aria-label={t('admin.campus.delete_photo_aria', 'Supprimer cette photo')}
                                >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** Delete confirmation covering a card or a list row. */
function DeleteOverlay({ bloc, onCancel, onConfirm }) {
    const { t } = useTranslations();

    return (
        <div className="animate-in fade-in-0 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center backdrop-blur-sm duration-150">
            <p className="text-sm font-medium text-white">{t('admin.campus.confirm_delete', 'Supprimer le bloc « :name » ?').replace(':name', bloc.nom)}</p>
            <div className="flex gap-2">
                <button type="button" onClick={onCancel} className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/25">
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-500">
                    {t('admin.hero_slides.delete_confirm', 'Supprimer')}
                </button>
            </div>
        </div>
    );
}

/** View-on-site link + photos / edit / delete buttons, shared by the grid card and the list row. */
function BlocActions({ bloc, setPanel, setConfirmId, className, iconOnlyLink = false }) {
    const { t } = useTranslations();

    return (
        <div className={className}>
            <a
                href={`/campus/${bloc.bloc_key}`}
                target="isstm-site-preview"
                rel="noopener noreferrer"
                title={t('admin.campus.view_on_site', 'Voir sur le site')}
                aria-label={`${t('admin.campus.view_on_site', 'Voir sur le site')} ${bloc.nom}`}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-accent"
            >
                <ExternalLink className={iconOnlyLink ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5'} aria-hidden="true" />
                {!iconOnlyLink && t('admin.campus.view_on_site', 'Voir sur le site')}
            </a>
            <div className="flex gap-0.5">
                <button
                    type="button"
                    onClick={() => setPanel({ type: 'photos', id: bloc.id })}
                    className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                    aria-label={`${t('admin.campus.photos_of', 'Photos de')} ${bloc.nom}`}
                >
                    <Images className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => setPanel({ type: 'edit', bloc })}
                    className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                    aria-label={`${t('admin.common.edit', 'Modifier')} ${bloc.nom}`}
                >
                    <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => setConfirmId(bloc.id)}
                    className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                    aria-label={`${t('admin.common.delete', 'Supprimer')} ${bloc.nom}`}
                >
                    <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

export default function Index({ blocs }) {
    const { t } = useTranslations();
    const [panel, setPanel] = useState(null); // null | { type: 'edit', bloc } | { type: 'photos', id }
    const [confirmId, setConfirmId] = useState(null);
    const [viewer, setViewer] = useState(null); // null | { id, index }
    const [search, setSearch] = useState('');
    const [view, setViewState] = useState(() => {
        try {
            return localStorage.getItem('admin.campus.view') === 'list' ? 'list' : 'grid';
        } catch {
            return 'grid';
        }
    });

    function setView(next) {
        setViewState(next);
        try {
            localStorage.setItem('admin.campus.view', next);
        } catch {
            // storage unavailable: the choice just won't persist
        }
    }

    const stats = useMemo(() => {
        const photos = blocs.reduce((sum, bloc) => sum + (bloc.images ?? []).length, 0);
        const average = blocs.length ? Math.round(blocs.reduce((sum, bloc) => sum + completeness(bloc), 0) / blocs.length) : 0;
        return { photos, average, incomplete: blocs.filter((bloc) => completeness(bloc) < 100).length };
    }, [blocs]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return blocs;
        return blocs.filter((bloc) => [bloc.nom, bloc.bloc_key, bloc.slogan, bloc.signification].some((field) => (field ?? '').toLowerCase().includes(term)));
    }, [blocs, search]);

    const photosBloc = panel?.type === 'photos' ? blocs.find((bloc) => bloc.id === panel.id) : null;
    const viewerBloc = viewer ? blocs.find((bloc) => bloc.id === viewer.id) : null;

    // Close the photo panel if its block disappeared (deleted elsewhere).
    useEffect(() => {
        if (panel?.type === 'photos' && !photosBloc) setPanel(null);
    }, [panel, photosBloc]);

    function destroy(bloc) {
        router.delete(`/console/campus/${bloc.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    const averageTone = scoreTone(stats.average);

    return (
        <AdminLayout title={t('admin.campus.title', 'Campus')}>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    [Building2, t('admin.campus.stat_blocks', 'Blocs'), blocs.length],
                    [Images, t('admin.campus.photos', 'Photos'), stats.photos],
                ].map(([Icon, label, value]) => (
                    <div key={label} className="admin-card flex items-center gap-3 px-4 py-3">
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-xs text-admin-text-secondary">{label}</p>
                            <p className="text-2xl font-semibold leading-tight text-admin-text">{value}</p>
                        </div>
                    </div>
                ))}
                <div className="admin-card flex items-center gap-3 px-4 py-3">
                    <ScoreRing score={stats.average} size={52} />
                    <div>
                        <p className="flex items-center gap-1.5 text-xs text-admin-text-secondary">
                            <Sparkles className="h-3.5 w-3.5 text-admin-accent" aria-hidden="true" />
                            {t('admin.campus.stat_completeness', 'Fiches complétées')}
                        </p>
                        <p className={`text-sm font-semibold ${averageTone.text}`}>
                            {stats.incomplete > 0 ? `${stats.incomplete} ${t('admin.campus.to_complete', 'à compléter')}` : t('admin.campus.all_complete', 'Tout est complet')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.campus.search_placeholder', 'Rechercher un bloc...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-3 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                </div>
                <div className="flex h-10 items-center gap-1 rounded-lg border border-admin-border bg-admin-card p-1" role="group" aria-label={t('admin.galerie.view_mode', "Mode d'affichage")}>
                    {[
                        ['grid', LayoutGrid, t('admin.galerie.view_grid', 'Grille')],
                        ['list', List, t('admin.galerie.view_list', 'Liste')],
                    ].map(([mode, Icon, label]) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setView(mode)}
                            aria-pressed={view === mode}
                            title={label}
                            className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
                                view === mode ? 'bg-admin-accent text-admin-accent-foreground shadow-sm' : 'text-admin-text-secondary hover:bg-admin-hover'
                            }`}
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
                <button type="button" onClick={() => setPanel({ type: 'edit', bloc: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.campus.new_block', 'Nouveau bloc')}
                </button>
            </div>

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_440px]' : ''}`}>
                <div>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                <Building2 className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <p className="text-sm text-admin-text-secondary">{t('admin.campus.empty', 'Aucun bloc pour le moment.')}</p>
                        </div>
                    ) : (
                        <ul className={view === 'list' ? 'space-y-2' : `grid grid-cols-1 gap-3 sm:grid-cols-2 ${panel ? 'xl:grid-cols-2' : 'lg:grid-cols-3 2xl:grid-cols-4'}`}>
                            {filtered.map((bloc, index) => {
                                const images = bloc.images ?? [];
                                const score = completeness(bloc);
                                const missing = SCORED_FIELDS.filter((key) => (bloc[key] ?? '').trim() === '').length + (images.length === 0 ? 1 : 0);
                                const active = (panel?.type === 'edit' && panel.bloc?.id === bloc.id) || (panel?.type === 'photos' && panel.id === bloc.id);
                                if (view === 'list') {
                                    return (
                                        <li
                                            key={bloc.id}
                                            style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                                            className={`group admin-card animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-backwards relative flex flex-wrap items-center gap-3 overflow-hidden !p-2 pr-3 transition-all duration-200 hover:border-admin-accent/40 ${
                                                confirmId === bloc.id ? 'min-h-[110px]' : ''
                                            } ${active ? '!border-admin-accent ring-2 ring-admin-accent/40' : ''}`}
                                        >
                                            {confirmId === bloc.id && <DeleteOverlay bloc={bloc} onCancel={() => setConfirmId(null)} onConfirm={() => destroy(bloc)} />}
                                            <button
                                                type="button"
                                                disabled={images.length === 0}
                                                onClick={() => setViewer({ id: bloc.id, index: 0 })}
                                                className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                                                aria-label={`${t('admin.campus.view_gallery', 'Voir la galerie')} ${bloc.nom}`}
                                            >
                                                <CoverSlideshow images={images} compact />
                                            </button>
                                            <div className="min-w-0 flex-1 basis-48">
                                                <h3 className="truncate text-sm font-semibold text-admin-text">{bloc.nom}</h3>
                                                <p className="truncate text-xs text-admin-muted">
                                                    /{bloc.bloc_key}
                                                    {bloc.slogan && <span className="italic text-admin-text-secondary"> — « {bloc.slogan} »</span>}
                                                </p>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs text-admin-text-secondary">
                                                <Images className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                {images.length}
                                            </span>
                                            {missing > 0 && (
                                                <span className="text-xs text-amber-500">
                                                    {missing} {t('admin.campus.missing_items', 'élément(s) à compléter')}
                                                </span>
                                            )}
                                            <ScoreRing score={score} size={40} />
                                            <BlocActions bloc={bloc} setPanel={setPanel} setConfirmId={setConfirmId} className="flex items-center gap-1" iconOnlyLink />
                                        </li>
                                    );
                                }

                                return (
                                    <li
                                        key={bloc.id}
                                        className={`group admin-card relative overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-admin-accent/10 ${
                                            active ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
                                        }`}
                                    >
                                        {confirmId === bloc.id && <DeleteOverlay bloc={bloc} onCancel={() => setConfirmId(null)} onConfirm={() => destroy(bloc)} />}

                                        <div className="relative">
                                            <CoverSlideshow images={images} compact />
                                            {images.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setViewer({ id: bloc.id, index: 0 })}
                                                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    <Images className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {t('admin.campus.view_gallery', 'Voir la galerie')}
                                                </button>
                                            )}
                                            <span className="absolute bottom-2 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                                                <Images className="h-3 w-3" aria-hidden="true" />
                                                {images.length}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-3 p-3">
                                            <ScoreRing score={score} />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-admin-text">{bloc.nom}</h3>
                                                <p className="truncate text-xs text-admin-muted">/{bloc.bloc_key}</p>
                                                {bloc.slogan && <p className="mt-1 line-clamp-1 text-sm italic text-admin-text-secondary">« {bloc.slogan} »</p>}
                                                {missing > 0 && (
                                                    <p className="mt-1.5 text-xs text-amber-500">
                                                        {missing} {t('admin.campus.missing_items', 'élément(s) à compléter')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <BlocActions bloc={bloc} setPanel={setPanel} setConfirmId={setConfirmId} className="flex items-center justify-between gap-1 border-t border-admin-border px-3 py-1.5" />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {panel?.type === 'edit' && <BlocPanel key={panel.bloc?.id ?? 'new'} editing={panel.bloc} onClose={() => setPanel(null)} />}
                {photosBloc && <PhotosPanel key={photosBloc.id} bloc={photosBloc} onClose={() => setPanel(null)} onOpenViewer={(index) => setViewer({ id: photosBloc.id, index })} />}
            </div>

            {viewerBloc && (viewerBloc.images ?? []).length > 0 && (
                <PhotoLightbox images={viewerBloc.images} startIndex={Math.min(viewer.index, viewerBloc.images.length - 1)} title={viewerBloc.nom} onClose={() => setViewer(null)} />
            )}
        </AdminLayout>
    );
}
