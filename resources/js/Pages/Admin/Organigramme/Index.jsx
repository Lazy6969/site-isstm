import { useEffect, useMemo, useRef, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Briefcase, Check, ExternalLink, FileImage, FileText, GraduationCap, ImagePlus, List, Network, Pencil, Search, Trash2, Upload, UserRound, Users, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import OrgTreeEditor from '../../../Components/Admin/OrgTreeEditor';
import { roleLabels } from '../../../Components/Parcours/orgChartData';
import { Input } from '../../../Components/ui/input';
import { Label } from '../../../Components/ui/label';
import { useTranslations } from '../../../lib/useTranslations';

const GOVERNANCE_KEYS = ['conseil_etablissement', 'directeur', 'prmp', 'conseil_scientifique', 'college_enseignants', 'secretariat_direction', 'coordo_pedagogique', 'resp_qualite', 'resp_comm'];

function groupOf(titleKey) {
    if (GOVERNANCE_KEYS.includes(titleKey)) return 'governance';
    if (/^(mention_|parcours_)/.test(titleKey) || titleKey === 'chef_de_parcours') return 'academic';
    return 'services';
}

const GROUP_ICONS = { governance: Network, academic: GraduationCap, services: Briefcase };

const primaryButton =
    'flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-4 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50';
const ghostButton = 'rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover';

/** Edit form as an inline side panel (no modal). */
function PersonPanel({ person, roleLabel, onClose }) {
    const { t } = useTranslations();
    const form = useForm({ name: person.name, photo: null });
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    function pickPhoto(file) {
        if (!file) return;
        form.setData('photo', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        form.put(`/console/organigramme/${person.id}`, { onSuccess: onClose, preserveScroll: true, forceFormData: true });
    }

    const shownPhoto = preview ?? (person.photo_path ? `/${person.photo_path}` : null);

    return (
        <form onSubmit={submit} className="admin-card animate-in fade-in-0 slide-in-from-right-4 space-y-4 p-5 duration-300 lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-admin-muted">{t('admin.organigramme.position', 'Poste')}</p>
                    <h2 className="text-base font-semibold text-admin-text">{roleLabel}</h2>
                </div>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-lg p-1.5 text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="flex flex-col items-center gap-2">
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
                        pickPhoto(e.dataTransfer.files?.[0]);
                    }}
                    className={`group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-200 ${
                        dragging ? 'scale-105 border-admin-accent bg-admin-accent/10' : 'border-admin-border bg-admin-bg/40 hover:border-admin-accent/60'
                    }`}
                >
                    {shownPhoto ? (
                        <>
                            <img src={shownPhoto} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <ImagePlus className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                        </>
                    ) : (
                        <UserRound className="h-10 w-10 text-admin-accent" aria-hidden="true" />
                    )}
                    <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} className="sr-only" tabIndex={-1} />
                </div>
                <p className="text-xs text-admin-muted">{t('admin.organigramme.photo_optional', 'Photo (optionnel)')} · {t('admin.hero_slides.drop_here', 'Glissez un fichier ici')}</p>
                {form.errors.photo && <p className="text-sm text-red-500">{form.errors.photo}</p>}
            </div>

            <div>
                <Label htmlFor="name">{t('admin.common.name', 'Nom')}</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="mt-1.5" />
                {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-1">
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

const DOC_GROUPS = [
    { prefix: 'organigramme', icon: Network },
    { prefix: 'cursus', icon: GraduationCap },
];

const DOC_FORMATS = [
    { suffix: 'pdf', label: 'PDF', accept: '.pdf,application/pdf', icon: FileText, tone: 'bg-red-500/15 text-red-500' },
    { suffix: 'word', label: 'Word', accept: '.doc,.docx', icon: FileText, tone: 'bg-blue-500/15 text-blue-500' },
    { suffix: 'image', label: 'JPEG / PNG', accept: '.jpg,.jpeg,.png,image/jpeg,image/png', icon: FileImage, tone: 'bg-emerald-500/15 text-emerald-500' },
];

/** One format of one document: what is there now, and add / replace / remove it. */
function DocumentSlot({ slug, format, document }) {
    const { t } = useTranslations();
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const Icon = format.icon;

    function upload(file) {
        if (!file) return;
        setError(null);
        router.post(
            `/console/organigramme/documents/${slug}`,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setBusy(true),
                onError: (errors) => setError(errors.file ?? t('admin.organigramme.upload_failed', "L'envoi a échoué.")),
                onFinish: () => {
                    setBusy(false);
                    if (inputRef.current) inputRef.current.value = '';
                },
            },
        );
    }

    function remove() {
        setConfirming(false);
        router.delete(`/console/organigramme/documents/${slug}`, { preserveScroll: true });
    }

    const fileName = document ? document.file_path.split('/').pop() : null;

    return (
        <li className="flex flex-wrap items-center gap-3 rounded-xl border border-admin-border bg-admin-bg/30 p-3">
            <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${format.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1 basis-44">
                <p className="text-sm font-semibold text-admin-text">{format.label}</p>
                {document ? (
                    <p className="truncate text-xs text-admin-text-secondary" title={fileName}>
                        {fileName}
                        <span className="text-admin-muted"> · {new Date(document.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                ) : (
                    <p className="text-xs text-amber-500">{t('admin.organigramme.no_file', 'Aucun fichier — « Document à venir » sur le site')}</p>
                )}
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            {confirming ? (
                <div className="animate-in fade-in-0 flex items-center gap-2 duration-150">
                    <span className="text-xs font-medium text-admin-text">{t('admin.organigramme.remove_confirm', 'Retirer ce fichier ?')}</span>
                    <button type="button" onClick={() => setConfirming(false)} className="rounded-md border border-admin-border px-2 py-1 text-xs font-medium text-admin-text-secondary transition hover:bg-admin-hover">
                        {t('admin.organigramme.no', 'Non')}
                    </button>
                    <button type="button" onClick={remove} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-500">
                        {t('admin.organigramme.yes_remove', 'Oui, retirer')}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    {document && (
                        <a
                            href={`/${document.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${t('admin.organigramme.view_file', 'Voir le fichier')} — ${format.label}`}
                            title={t('admin.organigramme.view_file', 'Voir le fichier')}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                        >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-3 text-xs font-semibold text-admin-accent-foreground shadow-sm shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-60"
                    >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        {busy ? t('admin.organigramme.uploading', 'Envoi…') : document ? t('admin.organigramme.replace_file', 'Remplacer') : t('admin.organigramme.add_file', 'Ajouter')}
                    </button>
                    {document && (
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            aria-label={`${t('admin.organigramme.remove_file', 'Retirer le fichier')} — ${format.label}`}
                            title={t('admin.organigramme.remove_file', 'Retirer le fichier')}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-admin-muted transition hover:bg-red-500/10 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}

            <input ref={inputRef} type="file" accept={format.accept} onChange={(e) => upload(e.target.files?.[0])} className="sr-only" tabIndex={-1} aria-hidden="true" />
        </li>
    );
}

/**
 * The files offered for download on the public Parcours page: the organigramme
 * and the academic cursus, each in PDF, Word and image. Whatever is added here
 * replaces the "Document à venir" placeholder there.
 */
function DocumentsPanel({ documents }) {
    const { t } = useTranslations();
    const groups = {
        organigramme: {
            title: t('admin.organigramme.doc_organigramme', 'Organigramme complet'),
            desc: t('admin.organigramme.doc_organigramme_desc', "La structure organisationnelle complète de l'institut."),
        },
        cursus: {
            title: t('admin.organigramme.doc_cursus', 'Cursus académique'),
            desc: t('admin.organigramme.doc_cursus_desc', 'Le détail des filières, mentions et parcours proposés.'),
        },
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-admin-border bg-admin-card px-4 py-3">
                <p className="text-sm text-admin-text-secondary">
                    {t('admin.organigramme.docs_hint', 'Ces fichiers sont téléchargeables depuis la page « Parcours » du site, par les comptes actifs. PDF, Word ou image, 10 Mo maximum chacun.')}
                </p>
                <a href="/parcours" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-admin-accent hover:underline">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    {t('admin.organigramme.see_page', 'Voir la page')}
                </a>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {DOC_GROUPS.map(({ prefix, icon: GroupIcon }) => (
                    <section key={prefix} className="admin-card p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-admin-accent/15 text-admin-accent">
                                <GroupIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-admin-text">{groups[prefix].title}</h2>
                                <p className="text-xs text-admin-muted">{groups[prefix].desc}</p>
                            </div>
                        </div>
                        <ul className="space-y-2.5">
                            {DOC_FORMATS.map((format) => {
                                const slug = `${prefix}_${format.suffix}`;

                                return <DocumentSlot key={slug} slug={slug} format={format} document={documents[slug]} />;
                            })}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default function Index({ orgPeople, documents = {} }) {
    const { t } = useTranslations();
    const [tab, setTab] = useState('membres');
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [layout, setLayoutState] = useState(() => {
        try {
            return localStorage.getItem('admin.organigramme.layout') === 'list' ? 'list' : 'tree';
        } catch {
            return 'tree';
        }
    });
    const { content } = usePage().props;

    function setLayout(next) {
        setLayoutState(next);
        try {
            localStorage.setItem('admin.organigramme.layout', next);
        } catch {
            // storage unavailable: the choice just won't persist
        }
    }

    // A title edited on the public page (quick edit) wins, exactly as it does there.
    const labelOfKey = (key) => content?.[`parcours_role_${key}`] ?? t(`admin.organigramme.role.${key}`, roleLabels[key] ?? key);
    const labelOf = (person) => labelOfKey(person.title_key);
    const peopleByKey = useMemo(() => Object.fromEntries(orgPeople.map((person) => [person.title_key, person])), [orgPeople]);
    const groupLabels = {
        governance: t('admin.organigramme.group_governance', 'Direction & gouvernance'),
        academic: t('admin.organigramme.group_academic', 'Mentions & parcours'),
        services: t('admin.organigramme.group_services', 'Services & divisions'),
    };

    const counts = useMemo(() => {
        const result = { governance: 0, academic: 0, services: 0, noPhoto: 0 };
        orgPeople.forEach((person) => {
            result[groupOf(person.title_key)] += 1;
            if (!person.photo_path) result.noPhoto += 1;
        });
        return result;
    }, [orgPeople]);

    const sections = useMemo(() => {
        const term = search.trim().toLowerCase();
        const matches = orgPeople.filter((person) => {
            if (filter === 'noPhoto' && person.photo_path) return false;
            if (filter && filter !== 'noPhoto' && groupOf(person.title_key) !== filter) return false;
            if (!term) return true;
            return `${person.name} ${labelOf(person)}`.toLowerCase().includes(term);
        });
        return ['governance', 'academic', 'services']
            .map((key) => [key, matches.filter((person) => groupOf(person.title_key) === key)])
            .filter(([, people]) => people.length > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgPeople, search, filter]);

    const editing = orgPeople.find((person) => person.id === editingId) ?? null;
    const filledDocuments = Object.keys(documents).length;
    const chips = [
        ['', t('admin.actualites.all', 'Tous'), orgPeople.length],
        ['governance', groupLabels.governance, counts.governance],
        ['academic', groupLabels.academic, counts.academic],
        ['services', groupLabels.services, counts.services],
        ...(counts.noPhoto > 0 ? [['noPhoto', t('admin.organigramme.no_photo_filter', 'Sans photo'), counts.noPhoto]] : []),
    ];

    return (
        <AdminLayout title={t('admin.organigramme.title', 'Organigramme')}>
            <div className="mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-admin-border bg-admin-card p-1" role="tablist">
                {[
                    ['membres', Users, t('admin.organigramme.tab_members', 'Organigramme'), orgPeople.length],
                    ['documents', FileText, t('admin.organigramme.tab_documents', 'Documents à télécharger'), `${filledDocuments}/${DOC_GROUPS.length * DOC_FORMATS.length}`],
                ].map(([value, Icon, label, count]) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        onClick={() => setTab(value)}
                        className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                            tab === value ? 'bg-admin-accent text-admin-accent-foreground shadow-sm' : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                        }`}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                        <span className={`rounded-full px-1.5 text-xs ${tab === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{count}</span>
                    </button>
                ))}
            </div>

            {tab === 'documents' && <DocumentsPanel documents={documents} />}

            {tab === 'membres' && (
                <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.organigramme.search_placeholder', 'Rechercher un poste ou une personne...')}
                            className="h-10 w-full rounded-lg border border-admin-border bg-admin-card pl-10 pr-9 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} aria-label={t('admin.contenu.clear_search', 'Effacer la recherche')} className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-admin-muted hover:bg-admin-hover hover:text-admin-text">
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                    <span className="flex items-center gap-2 text-sm text-admin-text-secondary">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        {orgPeople.length} {t('admin.organigramme.count_suffix', 'poste(s)')}
                    </span>
                    <div className="flex h-10 items-center gap-1 rounded-lg border border-admin-border bg-admin-card p-1" role="group" aria-label={t('admin.galerie.view_mode', "Mode d'affichage")}>
                        {[
                            ['tree', Network, t('admin.organigramme.view_tree', 'Hiérarchie')],
                            ['list', List, t('admin.organigramme.view_list', 'Liste')],
                        ].map(([mode, Icon, label]) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setLayout(mode)}
                                aria-pressed={layout === mode}
                                title={label}
                                className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
                                    layout === mode ? 'bg-admin-accent text-admin-accent-foreground shadow-sm' : 'text-admin-text-secondary hover:bg-admin-hover'
                                }`}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`mb-5 flex flex-wrap gap-2 ${layout === 'list' ? '' : 'hidden'}`}>
                    {chips.map(([value, label, count]) => (
                        <button
                            key={value || 'all'}
                            type="button"
                            onClick={() => setFilter(value)}
                            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                                filter === value
                                    ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                    : 'border-admin-border bg-admin-card text-admin-text-secondary hover:border-admin-accent/50 hover:text-admin-text'
                            }`}
                        >
                            {label}
                            <span className={`rounded-full px-1.5 text-xs ${filter === value ? 'bg-white/20' : 'bg-admin-hover text-admin-muted'}`}>{count}</span>
                        </button>
                    ))}
                </div>

                <div className={`grid grid-cols-1 gap-5 ${editing ? 'xl:grid-cols-[minmax(0,1fr)_380px]' : ''}`}>
                    {layout === 'tree' ? (
                        <OrgTreeEditor people={peopleByKey} labelOf={labelOfKey} search={search} selectedId={editingId} onSelect={(person) => setEditingId(person.id === editingId ? null : person.id)} />
                    ) : (
                    <div className="space-y-6">
                        {sections.length === 0 && (
                            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-admin-border py-16 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-admin-accent/15 text-admin-accent">
                                    <Network className="h-7 w-7" aria-hidden="true" />
                                </span>
                                <p className="text-sm text-admin-text-secondary">{t('admin.common.no_results', 'Aucun résultat')}</p>
                            </div>
                        )}

                        {sections.map(([key, people]) => {
                            const Icon = GROUP_ICONS[key];
                            return (
                                <section key={key}>
                                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-admin-text">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-accent/15 text-admin-accent">
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        {groupLabels[key]}
                                        <span className="text-xs font-normal text-admin-muted">{people.length}</span>
                                    </h2>
                                    <ul className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${editing ? '' : 'xl:grid-cols-3'}`}>
                                        {people.map((person) => {
                                            const active = editingId === person.id;
                                            return (
                                                <li key={person.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingId(active ? null : person.id)}
                                                        className={`group admin-card flex w-full items-center gap-3 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-admin-accent/10 ${
                                                            active ? '!border-admin-accent ring-2 ring-admin-accent/40' : 'hover:border-admin-accent/40'
                                                        }`}
                                                    >
                                                        {person.photo_path ? (
                                                            <img src={`/${person.photo_path}`} alt="" className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-admin-accent/30 object-cover" />
                                                        ) : (
                                                            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-amber-500/50 bg-amber-500/10 text-amber-500" title={t('admin.organigramme.no_photo_filter', 'Sans photo')}>
                                                                <UserRound className="h-6 w-6" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="line-clamp-2 text-xs font-medium leading-snug text-admin-muted">{labelOf(person)}</p>
                                                            <p className="mt-0.5 truncate text-sm font-semibold text-admin-text">{person.name}</p>
                                                        </div>
                                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-admin-muted transition group-hover:bg-admin-accent group-hover:text-admin-accent-foreground">
                                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            );
                        })}
                    </div>
                    )}

                    {editing && <PersonPanel key={editing.id} person={editing} roleLabel={labelOf(editing)} onClose={() => setEditingId(null)} />}
                </div>
                </>
            )}
        </AdminLayout>
    );
}
