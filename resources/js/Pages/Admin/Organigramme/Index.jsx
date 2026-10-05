import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Briefcase, Check, GraduationCap, ImagePlus, Network, Pencil, Search, UserRound, Users, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
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

export default function Index({ orgPeople }) {
    const { t } = useTranslations();
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');

    const labelOf = (person) => t(`admin.organigramme.role.${person.title_key}`, roleLabels[person.title_key] ?? person.title_key);
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
    const chips = [
        ['', t('admin.actualites.all', 'Tous'), orgPeople.length],
        ['governance', groupLabels.governance, counts.governance],
        ['academic', groupLabels.academic, counts.academic],
        ['services', groupLabels.services, counts.services],
        ...(counts.noPhoto > 0 ? [['noPhoto', t('admin.organigramme.no_photo_filter', 'Sans photo'), counts.noPhoto]] : []),
    ];

    return (
        <AdminLayout title={t('admin.organigramme.title', 'Organigramme')}>
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
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
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

                {editing && <PersonPanel key={editing.id} person={editing} roleLabel={labelOf(editing)} onClose={() => setEditingId(null)} />}
            </div>
        </AdminLayout>
    );
}
