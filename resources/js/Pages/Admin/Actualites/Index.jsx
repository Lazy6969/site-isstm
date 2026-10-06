import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Check, ImagePlus, Newspaper, Palette, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';
import { Textarea } from '../../../Components/ui/textarea';
import { Checkbox } from '../../../Components/ui/checkbox';
import { useTranslations } from '../../../lib/useTranslations';

const PAGE_SIZE = 12;

const emptyForm = {
    news_category_id: '',
    title: '',
    excerpt: '',
    content: '',
    author: '',
    status: 'brouillon',
    is_featured: false,
    image: null,
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

/** Article editor as an inline side panel (no modal). */
function ArticlePanel({ editing, categories, canPublish, onClose }) {
    const { t } = useTranslations();
    const form = useForm(
        editing
            ? {
                  news_category_id: editing.news_category_id ? String(editing.news_category_id) : '',
                  title: editing.title,
                  excerpt: editing.excerpt ?? '',
                  content: editing.content ?? '',
                  author: editing.author ?? '',
                  status: editing.status,
                  is_featured: editing.is_featured,
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
              { value: 'archive', label: t('admin.actualites.status_archived', 'Archivé') },
          ]
        : [
              { value: 'brouillon', label: t('admin.common.draft', 'Brouillon') },
              { value: 'en_attente', label: t('admin.actualites.submit_for_validation', 'Soumettre pour validation') },
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
            form.put(`/console/actualites/${editing.id}`, options);
        } else {
            form.post('/console/actualites', options);
        }
    }

    const shownImage = preview ?? (editing?.image_path ? `/${editing.image_path}` : null);

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">
                    {editing ? t('admin.actualites.edit_article', "Modifier l'article") : t('admin.actualites.new_article', 'Nouvel article')}
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
                className={`group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
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
                    <div className="flex flex-col items-center gap-2 px-4 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                            <ImagePlus className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-medium text-admin-text">{t('admin.actualites.image_optional', 'Image (optionnel)')}</p>
                        <p className="text-xs text-admin-muted">{t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
            </div>
            {form.errors.image && <p className="text-sm text-red-500">{form.errors.image}</p>}

            <div>
                <Label htmlFor="title">{t('admin.common.title', 'Titre')}</Label>
                <Input id="title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5" />
                {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="news_category_id">{t('admin.common.category', 'Catégorie')}</Label>
                    <Select id="news_category_id" value={form.data.news_category_id} onChange={(e) => form.setData('news_category_id', e.target.value)} className="mt-1.5">
                        <option value="">{t('admin.actualites.none', 'Aucune')}</option>
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

            <div>
                <Label htmlFor="author">{t('admin.actualites.author_optional', 'Auteur (optionnel)')}</Label>
                <Input id="author" value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} className="mt-1.5" />
            </div>

            <div>
                <Label htmlFor="excerpt">{t('admin.actualites.excerpt_optional', 'Résumé (optionnel)')}</Label>
                <Textarea id="excerpt" value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} rows={2} className="mt-1.5" />
            </div>

            <div>
                <Label htmlFor="content">{t('admin.actualites.content_optional', 'Contenu (optionnel)')}</Label>
                <Textarea id="content" value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} rows={6} className="mt-1.5" />
            </div>

            <label className="flex items-center gap-2 text-sm text-admin-text-secondary">
                <Checkbox checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} />
                {t('admin.actualites.featured', 'Mettre en avant')}
            </label>

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

/** Category badge colors as an inline side panel. */
function ColorsPanel({ categories, onClose }) {
    const { t } = useTranslations();
    const form = useForm({ colors: Object.fromEntries(categories.map((c) => [c.id, c.color ?? ''])) });

    function submit(e) {
        e.preventDefault();
        form.put('/console/actualites/categories/colors', { preserveScroll: true, onSuccess: onClose });
    }

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-admin-text">{t('admin.actualites.category_colors', 'Couleurs des catégories')}</h2>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
            <p className="text-sm text-admin-text-secondary">
                {t('admin.actualites.colors_description', 'Colore le badge de chaque catégorie sur les pages Actualités du site public.')}
            </p>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border border-admin-border p-2.5">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-admin-text">
                            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: form.data.colors[category.id] || '#94a3b8' }} aria-hidden="true" />
                            <span className="truncate">{category.name_fr}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={form.data.colors[category.id] || '#94a3b8'}
                                onChange={(e) => form.setData('colors', { ...form.data.colors, [category.id]: e.target.value })}
                                className="h-8 w-10 flex-shrink-0 cursor-pointer rounded border border-admin-border bg-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => form.setData('colors', { ...form.data.colors, [category.id]: '' })}
                                className="text-xs text-admin-muted hover:text-admin-text"
                            >
                                {t('admin.actualites.default_color', 'Défaut')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className={ghostButton}>
                    {t('admin.common.cancel', 'Annuler')}
                </button>
                <button type="submit" disabled={form.processing} className={primaryButton}>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t('admin.common.save', 'Enregistrer')}
                </button>
            </div>
        </form>
    );
}

/** Confirmation shown over a card instead of a browser alert. */
function CardOverlay({ mode, article, onCancel }) {
    const { t } = useTranslations();
    const rejectForm = useForm({ rejection_reason: '' });

    function confirm() {
        if (mode === 'delete') {
            router.delete(`/console/actualites/${article.id}`, { preserveScroll: true, onSuccess: onCancel });
        } else if (mode === 'approve') {
            router.post(`/console/actualites/${article.id}/approve`, {}, { preserveScroll: true, onSuccess: onCancel });
        } else {
            rejectForm.post(`/console/actualites/${article.id}/reject`, { preserveScroll: true, onSuccess: onCancel });
        }
    }

    const messages = {
        delete: t('admin.actualites.confirm_delete', "Supprimer l'article « :title » ?"),
        approve: t('admin.actualites.confirm_approve', "Valider et publier l'article « :title » ?"),
        reject: `${t('admin.actualites.reject_dialog_title', 'Rejeter')} « :title »`,
    };
    const confirmLabels = {
        delete: t('admin.hero_slides.delete_confirm', 'Supprimer'),
        approve: t('admin.actualites.validate', 'Valider'),
        reject: t('admin.actualites.reject', 'Rejeter'),
    };
    const confirmTones = { delete: 'bg-red-600 hover:bg-red-500', approve: 'bg-emerald-600 hover:bg-emerald-500', reject: 'bg-red-600 hover:bg-red-500' };

    return (
        <div className="animate-in fade-in-0 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center backdrop-blur-sm duration-150">
            <p className="text-sm font-medium text-white">{messages[mode].replace(':title', article.title)}</p>
            {mode === 'reject' && (
                <div className="w-full">
                    <Textarea
                        value={rejectForm.data.rejection_reason}
                        onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                        rows={3}
                        placeholder={t('admin.actualites.rejection_reason', 'Raison du rejet')}
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
                <button type="button" onClick={confirm} disabled={rejectForm.processing} className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition disabled:opacity-60 ${confirmTones[mode]}`}>
                    {confirmLabels[mode]}
                </button>
            </div>
        </div>
    );
}

export default function Index({ articles, categories }) {
    const { t, locale } = useTranslations();
    const { props } = usePage();
    const canPublish = (props.auth?.permissions ?? []).includes('news.publish');
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';

    const statusLabels = {
        brouillon: t('admin.common.draft', 'Brouillon'),
        en_attente: t('admin.actualites.status_pending', 'En attente'),
        publie: t('admin.common.published', 'Publié'),
        rejete: t('admin.actualites.status_rejected', 'Rejeté'),
        archive: t('admin.actualites.status_archived', 'Archivé'),
    };

    const [panel, setPanel] = useState(null); // null | { type: 'article', article } | { type: 'colors' }
    const [overlay, setOverlay] = useState(null); // null | { id, mode }
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [visible, setVisible] = useState(PAGE_SIZE);

    useEffect(() => setVisible(PAGE_SIZE), [search, statusFilter, categoryFilter]);

    const counts = useMemo(() => {
        const result = {};
        articles.forEach((a) => (result[a.status] = (result[a.status] ?? 0) + 1));
        return result;
    }, [articles]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return articles.filter((a) => {
            if (statusFilter && a.status !== statusFilter) return false;
            if (categoryFilter && String(a.news_category_id) !== categoryFilter) return false;
            if (!term) return true;
            return [a.title, a.author, a.excerpt].some((field) => (field ?? '').toLowerCase().includes(term));
        });
    }, [articles, search, statusFilter, categoryFilter]);

    const shown = filtered.slice(0, visible);
    const formatDate = (value) => (value ? new Date(value).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : null);
    const chips = [['', t('admin.actualites.all', 'Tous'), articles.length], ...Object.keys(statusLabels).filter((s) => counts[s]).map((s) => [s, statusLabels[s], counts[s]])];

    return (
        <AdminLayout title={t('admin.actualites.title', 'Actualités')}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.actualites.search_placeholder', 'Rechercher un article...')}
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
                <button type="button" onClick={() => setPanel({ type: 'colors' })} className="flex h-10 items-center gap-2 rounded-lg border border-admin-border bg-admin-card px-3.5 text-sm font-medium text-admin-text transition hover:bg-admin-hover">
                    <Palette className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{t('admin.actualites.category_colors', 'Couleurs des catégories')}</span>
                </button>
                <button type="button" onClick={() => setPanel({ type: 'article', article: null })} className={`h-10 ${primaryButton}`}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('admin.actualites.new_article', 'Nouvel article')}
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

            <div className={`grid grid-cols-1 gap-5 ${panel ? 'lg:grid-cols-[minmax(0,1fr)_380px]' : ''}`}>
                <div>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                <Newspaper className="h-7 w-7" aria-hidden="true" />
                            </span>
                            <p className="text-sm text-admin-text-secondary">{t('admin.actualites.empty', 'Aucun article pour le moment.')}</p>
                        </div>
                    ) : (
                        <>
                            <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${panel ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
                                {shown.map((article) => {
                                    const editingThis = panel?.type === 'article' && panel.article?.id === article.id;
                                    const color = article.category?.color || '#94a3b8';
                                    return (
                                        <li
                                            key={article.id}
                                            className={`group admin-card relative flex flex-col overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-admin-accent/10 ${
                                                editingThis ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
                                            }`}
                                        >
                                            {overlay?.id === article.id && <CardOverlay mode={overlay.mode} article={article} onCancel={() => setOverlay(null)} />}

                                            <div className="relative aspect-[16/9] overflow-hidden bg-admin-bg">
                                                {article.image_path ? (
                                                    <img src={`/${article.image_path}`} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-admin-muted">
                                                        <Newspaper className="h-10 w-10" aria-hidden="true" />
                                                    </div>
                                                )}
                                                <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur ${STATUS_TONES[article.status]}`}>
                                                    {statusLabels[article.status]}
                                                </span>
                                                {article.is_featured && (
                                                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950" title={t('admin.actualites.featured', 'Mettre en avant')}>
                                                        <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col gap-2 p-4">
                                                {article.category && (
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
                                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                                                        {article.category.name_fr}
                                                    </span>
                                                )}
                                                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-admin-text">{article.title}</h3>
                                                {article.excerpt && <p className="line-clamp-2 text-sm text-admin-text-secondary">{article.excerpt}</p>}
                                                {article.status === 'rejete' && article.rejection_reason && (
                                                    <p className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400">{article.rejection_reason}</p>
                                                )}
                                                <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-admin-muted">
                                                    <span className="truncate">{[article.author, formatDate(article.published_at)].filter(Boolean).join(' · ') || '—'}</span>
                                                    <div className="flex flex-shrink-0 gap-0.5">
                                                        {canPublish && article.status === 'en_attente' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOverlay({ id: article.id, mode: 'approve' })}
                                                                    className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-500"
                                                                    aria-label={`${t('admin.actualites.validate', 'Valider')} ${article.title}`}
                                                                >
                                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOverlay({ id: article.id, mode: 'reject' })}
                                                                    className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-500"
                                                                    aria-label={`${t('admin.actualites.reject', 'Rejeter')} ${article.title}`}
                                                                >
                                                                    <X className="h-4 w-4" aria-hidden="true" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPanel({ type: 'article', article })}
                                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-accent"
                                                            aria-label={`${t('admin.common.edit', 'Modifier')} ${article.title}`}
                                                        >
                                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOverlay({ id: article.id, mode: 'delete' })}
                                                            className="rounded-lg p-2 text-admin-text-secondary transition hover:bg-red-500/10 hover:text-red-500"
                                                            aria-label={`${t('admin.common.delete', 'Supprimer')} ${article.title}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
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

                {panel?.type === 'article' && (
                    <ArticlePanel key={panel.article?.id ?? 'new'} editing={panel.article} categories={categories} canPublish={canPublish} onClose={() => setPanel(null)} />
                )}
                {panel?.type === 'colors' && <ColorsPanel categories={categories} onClose={() => setPanel(null)} />}
            </div>
        </AdminLayout>
    );
}
