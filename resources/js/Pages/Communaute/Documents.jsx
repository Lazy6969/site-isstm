import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Backpack,
    BookOpen,
    Calculator,
    Check,
    ChevronDown,
    Download,
    Eraser,
    Eye,
    FileText,
    GraduationCap,
    Image as ImageIcon,
    LayoutGrid,
    List,
    Paperclip,
    Pencil,
    PenTool,
    Plus,
    Ruler,
    Search,
    Send,
    Share2,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { Badge } from '../../Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../Components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../Components/ui/dropdown-menu';
import { Select } from '../../Components/ui/select';
import { useConfirm } from '../../lib/useConfirm';
import { useTranslations } from '../../lib/useTranslations';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'heic', 'heif', 'avif', 'tiff'];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const APPROVED_PAGE_SIZE = 6;

// Decorative stationery scattered over both Leçons/Sujets banners — each
// floats on its own delay/duration (see .lecons-sujets-float-icon in
// app.css) so the set reads as organic motion, not one synchronised bounce.
const BANNER_ICONS = [
    { Icon: Pencil, className: 'left-[6%] top-[12%] h-7 w-7', delay: '0s', duration: '6s' },
    { Icon: Ruler, className: 'right-[8%] top-[18%] h-8 w-8', delay: '1.2s', duration: '7s' },
    { Icon: BookOpen, className: 'left-[14%] bottom-[20%] h-9 w-9', delay: '0.6s', duration: '8s' },
    { Icon: Backpack, className: 'right-[14%] bottom-[30%] h-8 w-8', delay: '1.8s', duration: '6.5s' },
    { Icon: GraduationCap, className: 'right-[30%] top-[10%] h-7 w-7', delay: '0.3s', duration: '7.5s' },
    { Icon: PenTool, className: 'left-[24%] top-[8%] h-6 w-6', delay: '0.9s', duration: '6.8s' },
    { Icon: Paperclip, className: 'right-[22%] bottom-[14%] h-6 w-6', delay: '2.1s', duration: '7.2s' },
    { Icon: Calculator, className: 'left-[38%] top-[22%] h-7 w-7', delay: '1.5s', duration: '8.5s' },
    { Icon: Eraser, className: 'right-[4%] top-[42%] h-6 w-6', delay: '0.4s', duration: '6.2s' },
    { Icon: Pencil, className: 'left-[44%] top-[6%] h-5 w-5', delay: '2.4s', duration: '7.8s' },
    { Icon: BookOpen, className: 'right-[42%] top-[30%] h-6 w-6', delay: '1s', duration: '9s' },
    { Icon: GraduationCap, className: 'left-[2%] top-[45%] h-6 w-6', delay: '2.7s', duration: '7s' },
];

function BannerFloatingIcons() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {BANNER_ICONS.map(({ Icon, className, delay, duration }, index) => (
                <Icon
                    key={index}
                    className={`lecons-sujets-float-icon absolute text-white/20 ${className}`}
                    style={{ animationDelay: delay, animationDuration: duration }}
                />
            ))}
        </div>
    );
}

function fileExtension(path) {
    return path?.split('.').pop()?.toLowerCase() ?? '';
}

function isImageFile(path) {
    return IMAGE_EXTENSIONS.includes(fileExtension(path));
}

function statusVariant(status) {
    return { en_attente: 'warning', valide: 'success', rejete: 'danger' }[status] ?? 'default';
}

/**
 * Multi-select filter as one dropdown button (checkboxes, not menu items, so
 * picking one doesn't close the panel — Radix only auto-closes on an Item's
 * own select) — used for Niveau and Année to the right of the search bar.
 */
function FilterDropdown({ label, options, selected, onToggle, triggerClassName = 'flex-shrink-0 rounded-full' }) {
    const count = selected.size;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`flex h-10 items-center gap-1.5 border px-3.5 text-sm font-medium transition ${triggerClassName} ${
                        count > 0
                            ? 'border-isstm-navy bg-isstm-navy text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-isstm-navy/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                    {label}
                    {count > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-xs">{count}</span>}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-64 min-w-[10rem] overflow-y-auto">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-accent dark:text-slate-200"
                    >
                        <input
                            type="checkbox"
                            checked={selected.has(option.value)}
                            onChange={() => onToggle(option.value)}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        {option.label}
                    </label>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function UploadDialog({ open, onClose, category, categoryLabel, filieres, annees, initial }) {
    const { t } = useTranslations();
    const isEditing = Boolean(initial);
    const form = useForm({
        category,
        title: initial?.title ?? '',
        filiere_ids: initial?.filiere_ids ?? [],
        niveaux: initial?.niveaux ?? [],
        annee: initial?.annee ?? '',
        file: null,
    });

    function toggleArrayValue(field, value) {
        const current = form.data[field];
        form.setData(field, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
    }

    function submit(e) {
        e.preventDefault();

        if (isEditing) {
            form.put(`/communaute-fichiers/${initial.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            });
            return;
        }

        form.post('/communaute-fichiers', {
            forceFormData: true,
            onSuccess: () => {
                form.reset('title', 'file', 'filiere_ids', 'niveaux', 'annee');
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? t('lecons_sujets.modifier_titre', 'Modifier le fichier') : `${t('lecons_sujets.ajouter', 'Ajouter un fichier')} — ${categoryLabel}`}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-admin-text">{t('lecons_sujets.champ_titre', 'Titre')}</label>
                        <input
                            type="text"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            className="w-full rounded-lg border border-admin-border bg-transparent px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                            autoFocus
                        />
                        {form.errors.title && <p className="mt-1 text-xs text-red-500">{form.errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-admin-text">{t('lecons_sujets.champ_filiere', 'Filière')}</label>
                            <FilterDropdown
                                label={t('lecons_sujets.plusieurs_filieres', 'Choisir…')}
                                options={filieres.map((filiere) => ({ value: filiere.id, label: filiere.nom_fr }))}
                                selected={new Set(form.data.filiere_ids)}
                                onToggle={(value) => toggleArrayValue('filiere_ids', value)}
                                triggerClassName="w-full justify-between rounded-lg"
                            />
                            {form.data.filiere_ids.length > 0 && (
                                <p className="mt-1.5 text-xs text-admin-muted">
                                    {filieres.filter((f) => form.data.filiere_ids.includes(f.id)).map((f) => f.nom_fr).join(', ')}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-admin-text">{t('lecons_sujets.champ_niveau', 'Niveau')}</label>
                            <FilterDropdown
                                label={t('lecons_sujets.plusieurs_niveaux', 'Choisir…')}
                                options={NIVEAUX.map((niveau) => ({ value: niveau, label: niveau }))}
                                selected={new Set(form.data.niveaux)}
                                onToggle={(value) => toggleArrayValue('niveaux', value)}
                                triggerClassName="w-full justify-between rounded-lg"
                            />
                            {form.data.niveaux.length > 0 && <p className="mt-1.5 text-xs text-admin-muted">{form.data.niveaux.join(', ')}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-admin-text">{t('lecons_sujets.champ_annee', 'Année')}</label>
                            <Select value={form.data.annee} onChange={(e) => form.setData('annee', e.target.value)}>
                                <option value="">{t('lecons_sujets.toutes_annees', 'Non précisée')}</option>
                                {annees.map((annee) => (
                                    <option key={annee} value={annee}>
                                        {annee}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-admin-text">
                            {t('lecons_sujets.champ_fichier', 'Fichier (PDF ou image)')}
                            {isEditing && <span className="ml-1 font-normal text-admin-muted">{t('lecons_sujets.fichier_optionnel', '— laisser vide pour garder le fichier actuel')}</span>}
                        </label>
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                            className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-isstm-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                        />
                        {form.errors.file && <p className="mt-1 text-xs text-red-500">{form.errors.file}</p>}
                    </div>
                    <DialogFooter>
                        <button type="button" onClick={onClose} className="rounded-full border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary hover:bg-admin-hover">
                            {t('nav.annuler', 'Annuler')}
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >
                            {isEditing ? t('lecons_sujets.enregistrer', 'Enregistrer') : t('lecons_sujets.envoyer', 'Envoyer')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RejectDialog({ open, onClose, documentId }) {
    const { t } = useTranslations();
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    function submit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post(
            `/communaute-fichiers/${documentId}/rejeter`,
            { rejection_reason: reason || null },
            { preserveScroll: true, onFinish: () => setProcessing(false), onSuccess: () => { setReason(''); onClose(); } },
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('lecons_sujets.rejeter_titre', 'Rejeter ce fichier')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-admin-text">{t('lecons_sujets.motif_rejet', 'Motif (facultatif)')}</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-admin-border bg-transparent px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                    </div>
                    <DialogFooter>
                        <button type="button" onClick={onClose} className="rounded-full border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary hover:bg-admin-hover">
                            {t('nav.annuler', 'Annuler')}
                        </button>
                        <button type="submit" disabled={processing} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
                            {t('lecons_sujets.rejeter', 'Rejeter')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ShareDialog({ open, onClose, document, conversations }) {
    const { t } = useTranslations();
    const [target, setTarget] = useState(null);
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);

    function submit(e) {
        e.preventDefault();
        if (!target) return;

        const body = [note.trim(), `📄 ${document.title}`, `${window.location.origin}/${document.file_path}`].filter(Boolean).join('\n');
        setProcessing(true);
        router.post(
            target.kind === 'dm' ? `/messages/${target.id}/envoyer` : `/groupes/${target.id}/messages`,
            { body },
            { preserveScroll: true, onFinish: () => setProcessing(false), onSuccess: () => { setNote(''); setTarget(null); onClose(); } },
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('lecons_sujets.partager_titre', 'Partager ce fichier')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-admin-border p-1.5">
                        {conversations.length === 0 && (
                            <p className="px-2 py-3 text-center text-sm text-admin-muted">{t('lecons_sujets.aucune_conversation', 'Aucune conversation ou groupe pour le moment.')}</p>
                        )}
                        {conversations.map((item) => {
                            const isSelected = target?.kind === item.kind && target?.id === item.id;

                            return (
                                <button
                                    type="button"
                                    key={`${item.kind}-${item.id}`}
                                    onClick={() => setTarget({ kind: item.kind, id: item.id })}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                                        isSelected ? 'bg-isstm-navy/10 dark:bg-isstm-gold/10' : 'hover:bg-admin-hover'
                                    }`}
                                >
                                    {item.kind === 'groupe' ? (
                                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-community-accent/15 text-community-accent">
                                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    ) : (
                                        <Avatar className="h-7 w-7 flex-shrink-0">
                                            <AvatarImage src={item.user?.avatar_path ? `/storage/${item.user.avatar_path}` : undefined} alt="" />
                                            <AvatarFallback>{item.user?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <span className="truncate text-admin-text">{item.kind === 'groupe' ? item.name : item.user?.name}</span>
                                </button>
                            );
                        })}
                    </div>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('lecons_sujets.note_facultative', 'Ajouter un message (facultatif)')}
                        className="w-full rounded-lg border border-admin-border bg-transparent px-3 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                    />
                    <DialogFooter>
                        <button type="button" onClick={onClose} className="rounded-full border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary hover:bg-admin-hover">
                            {t('nav.annuler', 'Annuler')}
                        </button>
                        <button
                            type="submit"
                            disabled={!target || processing}
                            className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('lecons_sujets.envoyer', 'Envoyer')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DocumentCard({ document, canModerate, layout, onEdit, onReject, onShare }) {
    const { t } = useTranslations();
    const confirmAction = useConfirm();
    const Icon = isImageFile(document.file_path) ? ImageIcon : FileText;

    function destroy() {
        router.delete(`/communaute-fichiers/${document.id}`, { preserveScroll: true });
    }

    async function confirmDestroy() {
        if (await confirmAction({ message: t('lecons_sujets.confirmer_suppression', 'Supprimer ce fichier ?'), confirmLabel: t('communaute.supprimer', 'Supprimer') })) {
            destroy();
        }
    }

    function approve() {
        router.post(`/communaute-fichiers/${document.id}/approuver`, {}, { preserveScroll: true });
    }

    return (
        <div className={`flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${layout === 'list' ? 'sm:flex-row sm:items-center' : ''}`}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <a
                    href={`/${document.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-isstm-navy/5 text-isstm-navy dark:bg-white/10 dark:text-white"
                >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </a>

                <div className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                        <a href={`/${document.file_path}`} target="_blank" rel="noreferrer" className="truncate font-semibold text-slate-800 hover:text-isstm-navy dark:text-slate-100">
                            {document.title}
                        </a>
                        {document.extension && <Badge className="flex-shrink-0">{document.extension}</Badge>}
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={document.user.avatar_path ? `/storage/${document.user.avatar_path}` : undefined} alt="" />
                            <AvatarFallback>{document.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{document.user.name}</span>
                        {document.filiere_noms.map((nom) => (
                            <Badge key={nom} variant="outline">
                                {nom}
                            </Badge>
                        ))}
                        {document.niveaux.map((niveau) => (
                            <Badge key={niveau} variant="outline">
                                {niveau}
                            </Badge>
                        ))}
                        {document.annee && <Badge variant="outline">{document.annee}</Badge>}
                        {document.status !== 'valide' && <Badge variant={statusVariant(document.status)}>{document.status_label}</Badge>}
                    </div>
                    {document.status === 'rejete' && document.rejection_reason && (
                        <p className="mt-1.5 text-xs text-red-500">{document.rejection_reason}</p>
                    )}
                </div>
            </div>

            <div
                className={`flex flex-wrap items-center gap-1.5 ${
                    layout === 'grid' ? 'justify-center border-t border-slate-100 pt-3 dark:border-slate-700' : 'flex-shrink-0'
                }`}
            >
                <a
                    href={`/${document.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('lecons_sujets.voir_en_ligne', 'Voir en ligne')}
                    title={t('lecons_sujets.voir_en_ligne', 'Voir en ligne')}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                    href={`/${document.file_path}`}
                    download
                    aria-label={t('lecons_sujets.telecharger', 'Télécharger')}
                    title={t('lecons_sujets.telecharger', 'Télécharger')}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <Download className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                    type="button"
                    onClick={() => onShare(document)}
                    aria-label={t('lecons_sujets.partager', 'Partager')}
                    title={t('lecons_sujets.partager', 'Partager')}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>

                {canModerate && document.status === 'en_attente' && (
                    <>
                        <button
                            type="button"
                            onClick={approve}
                            aria-label={t('lecons_sujets.approuver', 'Approuver')}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-500/10"
                        >
                            <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onReject(document.id)}
                            aria-label={t('lecons_sujets.rejeter', 'Rejeter')}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-500/10"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </>
                )}
                {document.is_mine && (
                    <>
                        <button
                            type="button"
                            onClick={() => onEdit(document)}
                            aria-label={t('communaute.modifier', 'Modifier')}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={confirmDestroy}
                            aria-label={t('communaute.supprimer', 'Supprimer')}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-500/10 hover:text-red-600 dark:text-slate-400"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function DocumentList({ documents, canModerate, layout, onEdit, onReject, onShare }) {
    return (
        <div className={layout === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
            {documents.map((document) => (
                <DocumentCard key={document.id} document={document} canModerate={canModerate} layout={layout} onEdit={onEdit} onReject={onReject} onShare={onShare} />
            ))}
        </div>
    );
}

export default function Documents({ category, documents, canModerate, filieres, annees, conversations }) {
    const { t } = useTranslations();
    const [uploadOpen, setUploadOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [rejecting, setRejecting] = useState(null);
    const [sharing, setSharing] = useState(null);
    const [search, setSearch] = useState('');
    const [filiereFilter, setFiliereFilter] = useState(() => new Set());
    const [niveauFilter, setNiveauFilter] = useState(() => new Set());
    const [anneeFilter, setAnneeFilter] = useState(() => new Set());
    const [layout, setLayout] = useState('list');
    const [showAllApproved, setShowAllApproved] = useState(false);

    const categoryLabel = category === 'lecon' ? t('communaute.lecons_court', 'Leçons') : t('communaute.sujets_court', 'Sujets');
    const bannerImage = category === 'lecon' ? '/images/lecons-sujets-banner-lecons.jpg' : '/images/lecons-sujets-banner-sujets.jpg';
    const bannerSubtitle =
        category === 'lecon'
            ? t('lecons_sujets.banniere_lecons', 'Les supports de cours partagés par les étudiants et enseignants, validés par l’administration.')
            : t('lecons_sujets.banniere_sujets', "Les sujets d'examens et d'exercices à consulter, télécharger ou partager.");

    function toggleFilter(setFn, value) {
        setFn((prev) => {
            const next = new Set(prev);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return next;
        });
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return documents.filter((d) => {
            if (q && !d.title.toLowerCase().includes(q)) return false;
            if (filiereFilter.size > 0 && !d.filiere_ids.some((id) => filiereFilter.has(id))) return false;
            if (niveauFilter.size > 0 && !d.niveaux.some((niveau) => niveauFilter.has(niveau))) return false;
            if (anneeFilter.size > 0 && !anneeFilter.has(d.annee)) return false;
            return true;
        });
    }, [documents, search, filiereFilter, niveauFilter, anneeFilter]);

    const approved = filtered.filter((d) => d.status === 'valide');
    const pending = filtered.filter((d) => d.status === 'en_attente');
    const rejected = filtered.filter((d) => d.status === 'rejete');
    const visibleApproved = showAllApproved ? approved : approved.slice(0, APPROVED_PAGE_SIZE);

    return (
        <AppLayout title={categoryLabel}>
            <Head title={categoryLabel} />

            <div className="relative mb-6 flex min-h-[22rem] items-end overflow-hidden rounded-3xl bg-isstm-navy text-white sm:min-h-[28rem] lg:min-h-[32rem]">
                <img src={bannerImage} alt="" className="lecons-sujets-banner-img absolute inset-0 h-full w-full object-contain" />
                <div
                    className="absolute inset-0"
                    style={{ backgroundImage: 'linear-gradient(to top, rgba(0,31,63,0.92) 0%, rgba(0,31,63,0.45) 35%, rgba(0,31,63,0) 65%)' }}
                    aria-hidden="true"
                />
                <BannerFloatingIcons />
                <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-8 sm:py-10">
                    <h1 className="text-3xl font-bold sm:text-4xl">{categoryLabel}</h1>
                    <p className="mt-2 max-w-2xl text-white/85">{bannerSubtitle}</p>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Link href="/communaute" className="flex items-center gap-1.5 text-sm font-medium text-isstm-navy hover:underline dark:text-white">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {t('communaute.retour_fil', 'Retour au fil')}
                </Link>
                <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('lecons_sujets.ajouter', 'Ajouter un fichier')}
                </button>
            </div>

            <div className="mb-4 space-y-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('lecons_sujets.rechercher', 'Rechercher un fichier…')}
                            className="w-full rounded-full border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm focus:border-isstm-navy focus:outline-none dark:border-slate-700"
                        />
                    </div>
                    <FilterDropdown
                        label={t('lecons_sujets.champ_filiere', 'Filière')}
                        options={filieres.map((filiere) => ({ value: filiere.id, label: filiere.nom_fr }))}
                        selected={filiereFilter}
                        onToggle={(value) => toggleFilter(setFiliereFilter, value)}
                    />
                    <FilterDropdown
                        label={t('lecons_sujets.champ_niveau', 'Niveau')}
                        options={NIVEAUX.map((niveau) => ({ value: niveau, label: niveau }))}
                        selected={niveauFilter}
                        onToggle={(value) => toggleFilter(setNiveauFilter, value)}
                    />
                    <FilterDropdown
                        label={t('lecons_sujets.champ_annee', 'Année')}
                        options={annees.map((annee) => ({ value: annee, label: annee }))}
                        selected={anneeFilter}
                        onToggle={(value) => toggleFilter(setAnneeFilter, value)}
                    />
                    <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => setLayout('list')}
                            aria-pressed={layout === 'list'}
                            title={t('enseignants.vue_liste', 'Vue liste')}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${layout === 'list' ? 'bg-isstm-navy text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <List className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setLayout('grid')}
                            aria-pressed={layout === 'grid'}
                            title={t('enseignants.vue_grille', 'Vue grille')}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${layout === 'grid' ? 'bg-isstm-navy text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            {canModerate && pending.length > 0 && (
                <section className="mb-6">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600">{t('lecons_sujets.section_en_attente', 'En attente de validation')}</h2>
                    <DocumentList documents={pending} canModerate={canModerate} layout={layout} onEdit={setEditing} onReject={setRejecting} onShare={setSharing} />
                </section>
            )}

            <section className="mb-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-isstm-gold">{categoryLabel}</h2>
                {approved.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                        {t('lecons_sujets.aucun_fichier', 'Aucun fichier pour le moment.')}
                    </p>
                ) : (
                    <>
                        <DocumentList documents={visibleApproved} canModerate={canModerate} layout={layout} onEdit={setEditing} onReject={setRejecting} onShare={setSharing} />
                        {approved.length > APPROVED_PAGE_SIZE && (
                            <button
                                type="button"
                                onClick={() => setShowAllApproved((v) => !v)}
                                className="mt-3 w-full rounded-full border border-slate-200 py-2 text-sm font-medium text-isstm-navy transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700/50"
                            >
                                {showAllApproved
                                    ? t('lecons_sujets.voir_moins', 'Voir moins')
                                    : `${t('lecons_sujets.voir_tout', 'Voir tout')} (${approved.length})`}
                            </button>
                        )}
                    </>
                )}
            </section>

            {!canModerate && pending.some((d) => d.is_mine) && (
                <section className="mb-6">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600">{t('lecons_sujets.section_mes_envois', 'Mes envois en attente')}</h2>
                    <DocumentList documents={pending.filter((d) => d.is_mine)} canModerate={canModerate} layout={layout} onEdit={setEditing} onReject={setRejecting} onShare={setSharing} />
                </section>
            )}

            {rejected.length > 0 && (
                <section>
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-500">{t('lecons_sujets.section_rejetes', 'Rejetés')}</h2>
                    <DocumentList documents={rejected} canModerate={canModerate} layout={layout} onEdit={setEditing} onReject={setRejecting} onShare={setSharing} />
                </section>
            )}

            {uploadOpen && <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} category={category} categoryLabel={categoryLabel} filieres={filieres} annees={annees} />}
            {editing && <UploadDialog open={Boolean(editing)} onClose={() => setEditing(null)} category={category} categoryLabel={categoryLabel} filieres={filieres} annees={annees} initial={editing} />}
            {rejecting && <RejectDialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} documentId={rejecting} />}
            {sharing && <ShareDialog open={Boolean(sharing)} onClose={() => setSharing(null)} document={sharing} conversations={conversations ?? []} />}
        </AppLayout>
    );
}
