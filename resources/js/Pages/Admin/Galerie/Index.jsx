import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Check, ImagePlus, Images, LayoutGrid, List, MapPin, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import PhotoLightbox from '../../../Components/Admin/PhotoLightbox';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 12;

const emptyForm = {
    gallery_category_id: '',
    title: '',
    description: '',
    event_date: '',
    location: '',
    author: '',
    status: 'brouillon',
    cover_image: null,
};

const STATUS_TONES = {
    brouillon: 'border-admin-border bg-admin-hover text-admin-text-secondary',
    en_attente: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    publie: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    rejete: 'border-red-500/30 bg-red-500/10 text-red-400',
    archive: 'border-admin-border bg-transparent text-admin-muted',
};

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';

/** Card cover: the album cover (or first photo); crossfades through the photos while hovered. */
function AlbumCover({ album, compact = false }) {
    const sources = useMemo(() => {
        const photos = album.photos.map((photo) => photo.image_path);
        return album.cover_image ? [album.cover_image, ...photos.filter((path) => path !== album.cover_image)] : photos;
    }, [album]);
    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (!hovered || sources.length < 2) return undefined;
        const timer = setInterval(() => setActive((i) => (i + 1) % sources.length), 1100);
        return () => clearInterval(timer);
    }, [hovered, sources.length]);

    useEffect(() => {
        if (!hovered) setActive(0);
    }, [hovered]);

    return (
        <div className={`relative overflow-hidden bg-admin-bg ${compact ? 'aspect-[16/10]' : 'aspect-[4/3]'}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {sources.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-admin-accent/20 to-transparent text-admin-accent/60">
                    <Images className="h-12 w-12" aria-hidden="true" />
                </div>
            ) : (
                sources.map((source, i) => (
                    <img key={source} src={`/${source}`} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
                ))
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
    );
}

/** Album create/edit form as an inline side panel (no modal). */
function AlbumPanel({ editing, categories, canPublish, onClose }) {
    const { t } = useTranslations();
    const form = useForm(
        editing
            ? {
                  gallery_category_id: editing.gallery_category_id ? String(editing.gallery_category_id) : '',
                  title: editing.title,
                  description: editing.description ?? '',
                  event_date: editing.event_date ?? '',
                  location: editing.location ?? '',
                  author: editing.author ?? '',
                  status: editing.status,
                  cover_image: null,
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
              { value: 'archive', label: t('admin.galerie.status_archived', 'Archivé') },
          ]
        : [
              { value: 'brouillon', label: t('admin.common.draft', 'Brouillon') },
              { value: 'en_attente', label: t('admin.galerie.submit_for_validation', 'Soumettre pour validation') },
          ];

    function pickCover(file) {
        if (!file) return;
        form.setData('cover_image', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/galerie/${editing.id}`, options);
        } else {
            form.post('/console/galerie', options);
        }
    }

    const shownCover = preview ?? (editing?.cover_image ? `/${editing.cover_image}` : null);

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">{editing ? t('admin.galerie.edit_album', "Modifier l'album") : t('admin.galerie.new_album', 'Nouvel album')}</h2>
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
                    pickCover(e.dataTransfer.files?.[0]);
                }}
                className={`group relative flex aspect-[16/8] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragging ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                }`}
            >
                {shownCover ? (
                    <>
                        <img src={shownCover} alt="" className="h-full w-full object-cover" />
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
                        <p className="text-sm font-medium text-admin-text">{t('admin.galerie.cover_image_optional', 'Image de couverture (optionnel)')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickCover(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            {form.errors.cover_image && <p className="text-sm text-red-500">{form.errors.cover_image}</p>}

            <div>
                <Label htmlFor="title">{t('admin.common.title', 'Titre')}</Label>
                <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" />
                {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="gallery_category_id">{t('admin.common.category', 'Catégorie')}</Label>
                    <Select id="gallery_category_id" value={form.data.gallery_category_id} onChange={(e) => form.setData('gallery_category_id', e.target.value)} className="mt-1.5">
                        <option value="">{t('admin.galerie.none', 'Aucune')}</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name_fr}
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

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="event_date">{t('admin.galerie.date_optional', 'Date (optionnel)')}</Label>
                    <Input id="event_date" type="date" value={form.data.event_date ?? ''} onChange={(e) => form.setData('event_date', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                    <Label htmlFor="location">{t('admin.galerie.location_optional', 'Lieu (optionnel)')}</Label>
                    <Input id="location" value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} className="mt-1.5" />
                </div>
            </div>

            <div>
                <Label htmlFor="author">{t('admin.galerie.author_optional', 'Auteur (optionnel)')}</Label>
                <Input id="author" value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} className="mt-1.5" />
            </div>

            <div>
                <Label htmlFor="description">{t('admin.galerie.description_optional', 'Description (optionnel)')}</Label>
                <Textarea id="description" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={3} className="mt-1.5" />
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

/** Photo manager as an inline side panel: multi-drop upload, thumbnails, click to open the viewer. */
function PhotosPanel({ album, onClose, onOpenViewer }) {
    const { t } = useTranslations();
    const form = useForm({ photos: [] });
    const [previews, setPreviews] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    function pickFiles(fileList) {
        const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/'));
        if (files.length === 0) return;
        form.setData('photos', files);
        setPreviews(files.map((file) => URL.createObjectURL(file)));
    }

    function upload(e) {
        e.preventDefault();
        form.post(`/console/galerie/${album.id}/photos`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setPreviews([]);
                form.reset();
            },
        });
    }

    function destroyPhoto(photo) {
        router.delete(`/console/galerie/photos/${photo.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    return (
        <div className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">{t('admin.galerie.photos', 'Photos')}</p>
                    <h2 className="truncate text-base font-semibold text-admin-text">{album.title}</h2>
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

            {album.photos.length === 0 ? (
                <p className="py-6 text-center text-sm text-admin-muted">{t('admin.galerie.no_photos', 'Aucune photo dans cet album.')}</p>
            ) : (
                <ul className="grid grid-cols-3 gap-2">
                    {album.photos.map((photo, index) => (
                        <li key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-admin-border">
                            <button type="button" onClick={() => onOpenViewer(index)} className="h-full w-full" aria-label={t('admin.campus.open_viewer', 'Agrandir la photo')}>
                                <img src={`/${photo.image_path}`} alt={photo.alt_text ?? ''} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            </button>
                            {confirmId === photo.id ? (
                                <div className="animate-in fade-in-0 absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/80 p-1 duration-150">
                                    <button type="button" onClick={() => destroyPhoto(photo)} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                                        {t('admin.hero_slides.delete_confirm', 'Supprimer')}
                                    </button>
                                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-md bg-white/15 px-2 py-1 text-xs text-white">
                                        {t('admin.common.cancel', 'Annuler')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConfirmId(photo.id)}
                                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
                                    aria-label={t('admin.galerie.delete_photo_aria', 'Supprimer cette photo')}
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

/** Confirmation shown over a card instead of a browser alert. */
function CardOverlay({ mode, album, onCancel }) {
    const { t } = useTranslations();
    const rejectForm = useForm({ rejection_reason: '' });

    function confirm() {
        if (mode === 'delete') {
            router.delete(`/console/galerie/${album.id}`, { preserveScroll: true, onSuccess: onCancel });
        } else if (mode === 'approve') {
            router.post(`/console/galerie/${album.id}/approve`, {}, { preserveScroll: true, onSuccess: onCancel });
        } else {
            rejectForm.post(`/console/galerie/${album.id}/reject`, { preserveScroll: true, onSuccess: onCancel });
        }
    }

    const messages = {
        delete: t('admin.galerie.confirm_delete', "Supprimer l'album « :title » et ses photos ?"),
        approve: t('admin.galerie.confirm_approve', "Valider et publier l'album « :title » ?"),
        reject: `${t('admin.galerie.reject_dialog_title', 'Rejeter')} « :title »`,
    };
    const confirmLabels = {
        delete: t('admin.hero_slides.delete_confirm', 'Supprimer'),
        approve: t('admin.galerie.validate', 'Valider'),
        reject: t('admin.galerie.reject', 'Rejeter'),
    };
    const tones = { delete: 'bg-red-600 hover:bg-red-500', approve: 'bg-emerald-600 hover:bg-emerald-500', reject: 'bg-red-600 hover:bg-red-500' };

    return (
        <div className="animate-in fade-in-0 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center backdrop-blur-sm duration-150">
            <p className="text-sm font-medium text-white">{messages[mode].replace(':title', album.title)}</p>
            {mode === 'reject' && (
                <div className="w-full">
                    <Textarea
                        value={rejectForm.data.rejection_reason}
                        onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                        rows={3}
                        placeholder={t('admin.galerie.rejection_reason', 'Raison du rejet')}
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

/** Validate / reject / photos / edit / delete buttons, shared by the grid card and the list row. */
function AlbumActions({ album, canPublish, setOverlay, setPanel, className }) {
    const { t } = useTranslations();

    return (
                <div className={className}>
                    {canPublish && album.status === 'en_attente' && (
                        <>
                            <button
                                type="button"
                                onClick={() => setOverlay({ id: album.id, mode: 'approve' })}
                                className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-500"
                                aria-label={`${t('admin.galerie.validate', 'Valider')} ${album.title}`}
                            >
                                <Check className="h-[18px] w-[18px]" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverlay({ id: album.id, mode: 'reject' })}
                                className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-500"
                                aria-label={`${t('admin.galerie.reject', 'Rejeter')} ${album.title}`}
                            >
                                <X className="h-[18px] w-[18px]" aria-hidden="true" />
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => setPanel({ type: 'photos', id: album.id })}
                        className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                        aria-label={`${t('admin.galerie.manage_photos', 'Gérer les photos de')} ${album.title}`}
                    >
                        <Images className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setOverlay(null);
                            setPanel({ type: 'album', album });
                        }}
                        className="rounded-lg p-2 text-admin-muted transition hover:bg-admin-hover hover:text-admin-accent"
                        aria-label={`${t('admin.common.edit', 'Modifier')} ${album.title}`}
                    >
                        <Pencil className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setOverlay({ id: album.id, mode: 'delete' })}
                        className="rounded-lg p-2 text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                        aria-label={`${t('admin.common.delete', 'Supprimer')} ${album.title}`}
                    >
                        <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                </div>
    );
}

export default function Index({ albums, categories }) {
    const { t, locale } = useTranslations();
    const { props } = usePage();
    const canPublish = (props.auth?.permissions ?? []).includes('gallery.publish');
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';

    const statusLabels = {
        brouillon: t('admin.common.draft', 'Brouillon'),
        en_attente: t('admin.galerie.status_pending', 'En attente'),
        publie: t('admin.common.published', 'Publié'),
        rejete: t('admin.galerie.status_rejected', 'Rejeté'),
        archive: t('admin.galerie.status_archived', 'Archivé'),
    };

    const [panel, setPanel] = useState(null); // null | { type: 'album', album } | { type: 'photos', id }
    const [overlay, setOverlay] = useState(null); // null | { id, mode }
    const [viewer, setViewer] = useState(null); // null | { id, index }
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [view, setViewState] = useState(() => {
        try {
            return localStorage.getItem('admin.galerie.view') === 'list' ? 'list' : 'grid';
        } catch {
            return 'grid';
        }
    });

    function setView(next) {
        setViewState(next);
        try {
            localStorage.setItem('admin.galerie.view', next);
        } catch {
            // storage unavailable: the choice just won't persist
        }
    }

    useEffect(() => setVisible(PAGE_SIZE), [search, statusFilter, categoryFilter]);

    const totalPhotos = useMemo(() => albums.reduce((sum, album) => sum + album.photos.length, 0), [albums]);
    const counts = useMemo(() => {
        const result = {};
        albums.forEach((album) => (result[album.status] = (result[album.status] ?? 0) + 1));
        return result;
    }, [albums]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return albums.filter((album) => {
            if (statusFilter && album.status !== statusFilter) return false;
            if (categoryFilter && String(album.gallery_category_id) !== categoryFilter) return false;
            if (!term) return true;
            return [album.title, album.location, album.author, album.description].some((field) => (field ?? '').toLowerCase().includes(term));
        });
    }, [albums, search, statusFilter, categoryFilter]);

    const photosAlbum = panel?.type === 'photos' ? albums.find((album) => album.id === panel.id) : null;
    const viewerAlbum = viewer ? albums.find((album) => album.id === viewer.id) : null;

    useEffect(() => {
        if (panel?.type === 'photos' && !photosAlbum) setPanel(null);
    }, [panel, photosAlbum]);

    const formatDate = (value) => (value ? new Date(value).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : null);
    const chips = [['', t('admin.actualites.all', 'Tous'), albums.length], ...Object.keys(statusLabels).filter((status) => counts[status]).map((status) => [status, statusLabels[status], counts[status]])];

    return (
        <AdminLayout title={t('admin.galerie.title', 'Galerie')}>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                    [Images, t('admin.galerie.stat_albums', 'Albums'), albums.length],
                    [ImagePlus, t('admin.galerie.photos', 'Photos'), totalPhotos],
                    [Check, t('admin.common.published', 'Publié'), counts.publie ?? 0],
                ].map(([Icon, label, value]) => (
                    <div key={label} className="admin-card flex items-center gap-3 px-4 py-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent/75 text-admin-accent-foreground shadow-md shadow-admin-accent/30">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-xs text-admin-text-secondary">{label}</p>
                            <p className="text-xl font-semibold leading-tight text-admin-text">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.galerie.search_placeholder', 'Rechercher un album...')}
                        className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-3 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label={t('admin.common.category', 'Catégorie')}
                    className="h-10 rounded-lg border border-admin-border bg-admin-card px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60"
                >
                    <option value="">{t('admin.actualites.all_categories', 'Toutes les catégories')}</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name_fr}
                        </option>
                    ))}
                </select>
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
                <button type="button" onClick={() => setPanel({ type: 'album', album: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.galerie.new_album', 'Nouvel album')}
                </button>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {chips.map(([value, label, count]) => (
                    <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setStatusFilter(value)}
                        className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                            statusFilter === value
                                ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                        }`}
                    >
                        {label}
                        <span className={`rounded-full px-1.5 text-xs ${statusFilter === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{count}</span>
                    </button>
                ))}
            </div>

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : ''}`}>
                <div>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                <Images className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <p className="text-sm text-admin-text-secondary">{t('admin.galerie.empty', 'Aucun album pour le moment.')}</p>
                        </div>
                    ) : (
                        <>
                            <ul className={view === 'list' ? 'space-y-2' : `grid grid-cols-1 gap-3 sm:grid-cols-2 ${panel ? 'xl:grid-cols-2' : 'lg:grid-cols-3 2xl:grid-cols-4'}`}>
                                {filtered.slice(0, visible).map((album, index) => {
                                    const active = (panel?.type === 'album' && panel.album?.id === album.id) || (panel?.type === 'photos' && panel.id === album.id);
                                    const date = formatDate(album.event_date);
                                    if (view === 'list') {
                                        return (
                                            <li
                                                key={album.id}
                                                style={{ animationDelay: `${(index % PAGE_SIZE) * 30}ms` }}
                                                className={`group admin-card animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-backwards relative flex flex-wrap items-center gap-3 !p-2 pr-3 transition-all duration-200 hover:border-admin-accent/40 ${
                                                    overlay?.id === album.id ? 'min-h-[170px]' : ''
                                                } ${active ? '!border-admin-accent ring-2 ring-admin-accent/40' : ''}`}
                                            >
                                                {overlay?.id === album.id && <CardOverlay mode={overlay.mode} album={album} onCancel={() => setOverlay(null)} />}
                                                <button
                                                    type="button"
                                                    disabled={album.photos.length === 0}
                                                    onClick={() => setViewer({ id: album.id, index: 0 })}
                                                    className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                                                    aria-label={`${t('admin.campus.view_gallery', 'Voir la galerie')} ${album.title}`}
                                                >
                                                    <AlbumCover album={album} compact />
                                                </button>
                                                <div className="min-w-0 flex-1 basis-48">
                                                    <h3 className="truncate text-sm font-semibold text-admin-text">{album.title}</h3>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-admin-text-secondary">
                                                        {album.category && <span className="font-semibold text-admin-accent">{album.category.name_fr}</span>}
                                                        {date && <span>{date}</span>}
                                                        {album.location && <span className="truncate">{album.location}</span>}
                                                    </div>
                                                </div>
                                                <span className="flex items-center gap-1 text-xs text-admin-text-secondary">
                                                    <Images className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                    {album.photos.length}
                                                </span>
                                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONES[album.status]}`}>{statusLabels[album.status]}</span>
                                                <AlbumActions album={album} canPublish={canPublish} setOverlay={setOverlay} setPanel={setPanel} className="flex items-center gap-0.5" />
                                            </li>
                                        );
                                    }

                                    return (
                                        <li
                                            key={album.id}
                                            className={`group admin-card relative flex flex-col overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-admin-accent/10 ${
                                                active ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
                                            }`}
                                        >
                                            {overlay?.id === album.id && <CardOverlay mode={overlay.mode} album={album} onCancel={() => setOverlay(null)} />}

                                            <div className="relative">
                                                <AlbumCover album={album} compact />
                                                <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur ${STATUS_TONES[album.status]}`}>{statusLabels[album.status]}</span>
                                                <span className="absolute bottom-2 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                                                    <Images className="h-3 w-3" aria-hidden="true" />
                                                    {album.photos.length}
                                                </span>
                                                {album.photos.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewer({ id: album.id, index: 0 })}
                                                        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100 focus:opacity-100"
                                                    >
                                                        <Images className="h-3.5 w-3.5" aria-hidden="true" />
                                                        {t('admin.campus.view_gallery', 'Voir la galerie')}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col gap-1 p-3">
                                                {album.category && <span className="text-xs font-semibold text-admin-accent">{album.category.name_fr}</span>}
                                                <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-admin-text">{album.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-admin-text-secondary">
                                                    {date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                            {date}
                                                        </span>
                                                    )}
                                                    {album.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5 text-admin-muted" aria-hidden="true" />
                                                            {album.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {album.status === 'rejete' && album.rejection_reason && <p className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400">{album.rejection_reason}</p>}
                                            </div>

                                            <AlbumActions album={album} canPublish={canPublish} setOverlay={setOverlay} setPanel={setPanel} className="flex items-center justify-end gap-0.5 border-t border-admin-border px-3 py-1.5" />
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

                {panel?.type === 'album' && <AlbumPanel key={panel.album?.id ?? 'new'} editing={panel.album} categories={categories} canPublish={canPublish} onClose={() => setPanel(null)} />}
                {photosAlbum && <PhotosPanel key={photosAlbum.id} album={photosAlbum} onClose={() => setPanel(null)} onOpenViewer={(index) => setViewer({ id: photosAlbum.id, index })} />}
            </div>

            {viewerAlbum && viewerAlbum.photos.length > 0 && (
                <PhotoLightbox
                    images={viewerAlbum.photos.map((photo) => photo.image_path)}
                    startIndex={Math.min(viewer.index, viewerAlbum.photos.length - 1)}
                    title={viewerAlbum.title}
                    onClose={() => setViewer(null)}
                />
            )}
        </AdminLayout>
    );
}
