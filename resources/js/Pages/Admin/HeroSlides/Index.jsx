import { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ImagePlus, Image as ImageIcon, LayoutGrid, List, Pencil, Play, Plus, Trash2, Video, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

const emptyForm = { media: null, display_order: 0 };

function Media({ type, src, className = '', controls = false }) {
    return type === 'video' ? (
        <video src={src} muted controls={controls} className={className} />
    ) : (
        <img src={src} alt="" className={className} />
    );
}

/**
 * Inline side panel (no modal, no blocking popup) for adding or editing a
 * slide: drop zone with live preview, order field, and clear save/cancel.
 */
function SlidePanel({ editing, nextOrder, onClose }) {
    const { t } = useTranslations();
    const form = useForm({ media: null, display_order: editing ? editing.display_order : nextOrder });
    const [preview, setPreview] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    function pickFile(file) {
        if (!file) return;
        form.setData('media', file);
        setPreview(URL.createObjectURL(file));
        setPreviewType(file.type.startsWith('video/') ? 'video' : 'image');
    }

    function submit(e) {
        e.preventDefault();
        const options = { onSuccess: onClose, preserveScroll: true, forceFormData: true };
        if (editing) {
            form.put(`/console/accueil/${editing.id}`, options);
        } else {
            form.post('/console/accueil', options);
        }
    }

    const shownType = previewType ?? editing?.media_type;
    const shownSrc = preview ?? (editing ? `/${editing.image_path}` : null);

    return (
        <form
            onSubmit={submit}
            className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.hero_slides.edit_slide_title', 'Modifier la diapositive') : t('admin.hero_slides.new_slide_title', 'Nouvelle diapositive')}
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('admin.common.cancel', 'Annuler')}
                    className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                className={`group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragging ? 'scale-[1.01] border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                }`}
            >
                {shownSrc ? (
                    <>
                        <Media type={shownType} src={shownSrc} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <span className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900">
                                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                                {t('admin.hero_slides.change_media', 'Changer le fichier')}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-4 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                            <ImagePlus className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-medium text-admin-text">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.hero_slides.or_browse', 'ou cliquez pour parcourir (image ou vidéo)')}</p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*,video/*" onChange={(e) => pickFile(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            <p className="text-xs text-admin-muted">
                {t('admin.hero_slides.media_hint', "Une vidéo joue jusqu'à sa fin avant de passer à la diapositive suivante ; une image reste 5 secondes.")}
            </p>
            {form.errors.media && <p className="text-sm text-red-500">{form.errors.media}</p>}

            <label className="block text-sm font-medium text-admin-text" htmlFor="display_order">
                {t('admin.hero_slides.display_order', "Ordre d'affichage")}
                <input
                    id="display_order"
                    type="number"
                    value={form.data.display_order}
                    onChange={(e) => form.setData('display_order', e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-admin-border bg-admin-bg/40 px-3 text-sm text-admin-text outline-none focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                />
            </label>

            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover"
                >
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button
                    type="submit"
                    disabled={form.processing || (!editing && !form.data.media)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-5 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {editing ? t('admin.common.save', 'Enregistrer') : t('admin.common.add', 'Ajouter')}
                </button>
            </div>
        </form>
    );
}

const VIEW_STORAGE_KEY = 'admin.hero_slides.view';

function useStoredView() {
    const [view, setViewState] = useState(() => {
        try {
            return localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid';
        } catch {
            return 'grid';
        }
    });

    function setView(next) {
        setViewState(next);
        try {
            localStorage.setItem(VIEW_STORAGE_KEY, next);
        } catch {
            // storage unavailable: the choice just won't persist
        }
    }

    return [view, setView];
}

/**
 * Move / edit / delete buttons shared by both views. `overlay` styles them for
 * the dark gradient over a card's picture, `plain` for a list row.
 */
function SlideActions({ slide, index, total, reorderable, overlay, onMove, onEdit, onDelete }) {
    const { t } = useTranslations();
    const base = overlay
        ? 'rounded-lg bg-white/15 p-2 text-white backdrop-blur transition disabled:opacity-30'
        : 'rounded-lg border border-admin-border p-2 text-admin-text-secondary transition disabled:opacity-30';

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={!reorderable || index === 0}
                aria-label={t('admin.hero_slides.move_left', 'Déplacer avant')}
                className={`${base} ${overlay ? 'hover:bg-white/30' : 'hover:bg-admin-hover hover:text-admin-text'}`}
            >
                {overlay ? <ArrowLeft className="h-4 w-4" aria-hidden="true" /> : <ArrowUp className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={!reorderable || index === total - 1}
                aria-label={t('admin.hero_slides.move_right', 'Déplacer après')}
                className={`${base} ${overlay ? 'hover:bg-white/30' : 'hover:bg-admin-hover hover:text-admin-text'}`}
            >
                {overlay ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDown className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
                type="button"
                onClick={() => onEdit(slide)}
                aria-label={t('admin.hero_slides.edit_slide_aria', 'Modifier cette diapositive')}
                className={`${base} ${overlay ? 'hover:bg-admin-accent' : 'hover:border-admin-accent/50 hover:bg-admin-accent/10 hover:text-admin-accent'}`}
            >
                <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                onClick={() => onDelete(slide)}
                aria-label={t('admin.hero_slides.delete_slide_aria', 'Supprimer cette diapositive')}
                className={`${base} ${overlay ? 'hover:bg-red-600' : 'hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500'}`}
            >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}

function ConfirmDelete({ onCancel, onConfirm, inline = false }) {
    const { t } = useTranslations();

    return (
        <div
            className={
                inline
                    ? 'animate-in fade-in-0 flex items-center gap-3 duration-150'
                    : 'animate-in fade-in-0 absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-4 text-center backdrop-blur-sm duration-150'
            }
        >
            <p className={`text-sm font-medium ${inline ? 'text-admin-text' : 'text-white'}`}>{t('admin.hero_slides.confirm_delete', 'Supprimer cette diapositive ?')}</p>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        inline ? 'border border-admin-border text-admin-text-secondary hover:bg-admin-hover' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                >
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-500">
                    {t('admin.hero_slides.delete_confirm', 'Supprimer')}
                </button>
            </div>
        </div>
    );
}

function TypeBadge({ type, className = '' }) {
    const { t } = useTranslations();
    const isVideo = type === 'video';
    const Icon = isVideo ? Video : ImageIcon;

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {isVideo ? t('admin.hero_slides.video', 'Vidéo') : t('admin.hero_slides.image', 'Image')}
        </span>
    );
}

function SlideCard({ slide, index, total, number, reorderable, editing, confirming, onMove, onEdit, onAskDelete, onCancelDelete, onDelete }) {
    return (
        <li
            className={`group admin-card relative overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-admin-accent/10 ${
                editing ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
            }`}
        >
            <div className="relative aspect-video overflow-hidden bg-admin-bg">
                <Media type={slide.media_type} src={`/${slide.image_path}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-black/60 px-2 text-xs font-bold text-white backdrop-blur">{number}</span>
                {slide.media_type === 'video' && <TypeBadge type="video" className="absolute right-3 top-3 bg-black/60 text-white backdrop-blur" />}

                {confirming ? (
                    <ConfirmDelete onCancel={onCancelDelete} onConfirm={() => onDelete(slide)} />
                ) : (
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent p-3 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                        <SlideActions slide={slide} index={index} total={total} reorderable={reorderable} overlay onMove={onMove} onEdit={onEdit} onDelete={onAskDelete} />
                    </div>
                )}
            </div>
        </li>
    );
}

function SlideRow({ slide, index, total, number, reorderable, editing, confirming, onMove, onEdit, onAskDelete, onCancelDelete, onDelete }) {
    const { t } = useTranslations();
    const fileName = slide.image_path.split('/').pop();

    return (
        <li
            className={`admin-card flex flex-wrap items-center gap-x-4 gap-y-3 !p-3 transition-all duration-200 ${
                editing ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
            }`}
        >
            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-admin-accent/15 px-2 text-xs font-bold text-admin-accent">{number}</span>
            <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-lg bg-admin-bg sm:w-40">
                <Media type={slide.media_type} src={`/${slide.image_path}`} className="h-full w-full object-cover" />
                {slide.media_type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-6 w-6 fill-white text-white" aria-hidden="true" />
                    </span>
                )}
            </div>
            <div className="min-w-0 flex-1 basis-40">
                <p className="truncate text-sm font-semibold text-admin-text" title={fileName}>
                    {fileName}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <TypeBadge type={slide.media_type} className="bg-admin-hover text-admin-text-secondary" />
                    <span className="text-xs text-admin-muted">
                        {t('admin.hero_slides.position', 'Position')} {number}
                    </span>
                </div>
            </div>
            {confirming ? (
                <ConfirmDelete inline onCancel={onCancelDelete} onConfirm={() => onDelete(slide)} />
            ) : (
                <SlideActions slide={slide} index={index} total={total} reorderable={reorderable} onMove={onMove} onEdit={onEdit} onDelete={onAskDelete} />
            )}
        </li>
    );
}

export default function Index({ heroSlides }) {
    const { t } = useTranslations();
    const [panel, setPanel] = useState(null); // null | { slide: object|null }
    const [confirmId, setConfirmId] = useState(null);
    const [filter, setFilter] = useState('all'); // all | image | video
    const [view, setView] = useStoredView();
    const nextOrder = heroSlides.reduce((max, slide) => Math.max(max, slide.display_order), -1) + 1;

    const counts = {
        all: heroSlides.length,
        image: heroSlides.filter((slide) => slide.media_type !== 'video').length,
        video: heroSlides.filter((slide) => slide.media_type === 'video').length,
    };
    const shown = heroSlides
        .map((slide, index) => ({ slide, index }))
        .filter(({ slide }) => filter === 'all' || (filter === 'video' ? slide.media_type === 'video' : slide.media_type !== 'video'));
    // Moving a slide only makes sense against the full order — hidden by a filter, "before" is ambiguous.
    const reorderable = filter === 'all';

    function destroy(slide) {
        router.delete(`/console/accueil/${slide.id}`, { preserveScroll: true, onSuccess: () => setConfirmId(null) });
    }

    /** Re-numbers the slides 0..n after moving one, saving only those that changed. */
    function move(index, delta) {
        const target = index + delta;
        if (target < 0 || target >= heroSlides.length) return;
        const reordered = [...heroSlides];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        const changed = reordered.map((slide, position) => ({ slide, position })).filter(({ slide, position }) => slide.display_order !== position);

        const saveNext = (queue) => {
            if (queue.length === 0) return;
            const [{ slide, position }, ...rest] = queue;
            router.put(`/console/accueil/${slide.id}`, { display_order: position }, { preserveScroll: true, preserveState: true, onFinish: () => saveNext(rest) });
        };
        saveNext(changed);
    }

    const itemProps = ({ slide, index }) => ({
        key: slide.id,
        slide,
        index,
        total: heroSlides.length,
        number: index + 1,
        reorderable,
        editing: panel?.slide?.id === slide.id,
        confirming: confirmId === slide.id,
        onMove: move,
        onEdit: (target) => setPanel({ slide: target }),
        onAskDelete: (target) => setConfirmId(target.id),
        onCancelDelete: () => setConfirmId(null),
        onDelete: destroy,
    });

    return (
        <AdminLayout title={t('admin.hero_slides.title', "Images de l'accueil")}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('admin.hero_slides.filter_label', 'Filtrer par type')}>
                    {[
                        ['all', t('admin.hero_slides.filter_all', 'Tout')],
                        ['image', t('admin.hero_slides.filter_images', 'Images')],
                        ['video', t('admin.hero_slides.filter_videos', 'Vidéos')],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            aria-pressed={filter === value}
                            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                                filter === value
                                    ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                    : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                            }`}
                        >
                            {label}
                            <span className={`rounded-full px-1.5 text-xs ${filter === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{counts[value]}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
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
                    <button
                        type="button"
                        onClick={() => setPanel({ slide: null })}
                        className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('admin.hero_slides.add_media', 'Ajouter une image ou vidéo')}
                    </button>
                </div>
            </div>

            {!reorderable && heroSlides.length > 0 && (
                <p className="mb-4 text-xs text-admin-muted">{t('admin.hero_slides.reorder_hint', "Le réordonnancement est disponible quand le filtre « Tout » est actif.")}</p>
            )}

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : ''}`}>
                <div>
                    {heroSlides.length === 0 ? (
                        <button
                            type="button"
                            onClick={() => setPanel({ slide: null })}
                            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center transition hover:border-admin-accent/60 hover:bg-admin-accent/5"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                <ImagePlus className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <span className="text-sm text-admin-text-secondary">{t('admin.hero_slides.empty', 'Aucune image pour le moment.')}</span>
                        </button>
                    ) : shown.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-admin-border py-12 text-center text-sm text-admin-muted">{t('admin.hero_slides.no_match', 'Aucune diapositive de ce type.')}</p>
                    ) : view === 'grid' ? (
                        <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${panel ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
                            {shown.map((entry) => {
                                const { key, ...props } = itemProps(entry);
                                return <SlideCard key={key} {...props} />;
                            })}
                        </ul>
                    ) : (
                        <ul className="space-y-3">
                            {shown.map((entry) => {
                                const { key, ...props } = itemProps(entry);
                                return <SlideRow key={key} {...props} />;
                            })}
                        </ul>
                    )}
                </div>

                {panel && <SlidePanel key={panel.slide?.id ?? 'new'} editing={panel.slide} nextOrder={nextOrder} onClose={() => setPanel(null)} />}
            </div>
        </AdminLayout>
    );
}
