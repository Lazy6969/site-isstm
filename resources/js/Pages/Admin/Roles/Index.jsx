import { Fragment, useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronsUpDown,
    GraduationCap,
    Globe,
    Layers,
    Lock,
    MessagesSquare,
    RotateCcw,
    Save,
    Search,
    Settings2,
    ShieldCheck,
    Sparkles,
    Users,
    X,
} from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { cn } from '../../../lib/utils';
import { useTranslations } from '../../../lib/useTranslations';
import { useConfirm } from '../../../lib/useConfirm';

function roleLabels(t) {
    return {
        'super-admin': t('admin.roles.super_admin', 'Super Admin'),
        enseignant: t('admin.roles.enseignant', 'Enseignant'),
        scolarite: t('admin.roles.scolarite', 'Scolarité'),
        'responsable-materiel': t('admin.roles.materiel', 'Matériel'),
        etudiant: t('admin.roles.etudiant', 'Étudiant'),
    };
}

const ROLE_BLURBS = {
    'super-admin': 'Accès total à la plateforme. Ses permissions ne sont pas modifiables.',
    enseignant: 'Équipe pédagogique : groupes de classe, annonces, leçons et échanges avec les étudiants.',
    scolarite: 'Gestion administrative : préinscriptions, inscriptions, réactivations et dossiers étudiants.',
    'responsable-materiel': 'Suivi du matériel et accès de base à la console.',
    etudiant: "Espace étudiant : fil communautaire, messages, groupes de classe et réinscription.",
};

/**
 * Categories group the modules the way an administrator thinks about them.
 * Each module: [key, label, hint]. A module unknown here still shows up under
 * "Autres" so a new permission is never hidden.
 */
const CATEGORIES = [
    {
        key: 'scolarite',
        label: 'Scolarité',
        icon: GraduationCap,
        modules: [
            ['preinscriptions', 'Préinscriptions', 'Dossiers de préinscription des candidats.'],
            ['reactivations', 'Réactivations', "Demandes de réactivation d'anciens étudiants."],
            ['etudiants', 'Étudiants', 'Fiches et dossiers des étudiants.'],
            ['inscriptions', 'Inscriptions', 'Inscriptions et réinscriptions par année.'],
            ['classes', 'Niveaux & classes', 'Niveaux, classes et affectations.'],
            ['payments', 'Écolage (gestion)', 'Vérifier et valider les versements déclarés par les étudiants.'],
            ['reinscription', 'Réinscription en ligne', "Dépôt du dossier de réinscription par l'étudiant."],
        ],
    },
    {
        key: 'communaute',
        label: 'Communauté',
        icon: MessagesSquare,
        modules: [
            ['community', 'Fil communautaire', 'Publications, commentaires et réactions.'],
            ['stories', 'Stories', 'Stories éphémères visibles par la communauté.'],
            ['friends', 'Amis', "Demandes d'amis et liste de contacts."],
            ['messages', 'Messagerie privée', 'Conversations privées entre membres.'],
            ['ecolage', 'Mon écolage', "Page de l'étudiant pour déclarer ses versements."],
            ['groups', 'Groupes de classe', 'Messages, annonces, leçons, présence et modération.'],
        ],
    },
    {
        key: 'contenu',
        label: 'Site public',
        icon: Globe,
        modules: [
            ['quick-edit', 'Contenu du site', 'Textes, icônes et images du site public.'],
            ['hero', "Images de l'accueil", "Diaporama de la page d'accueil."],
            ['news', 'Actualités', 'Articles publiés sur le site.'],
            ['gallery', 'Galerie', 'Albums photos.'],
            ['filieres', 'Filières', 'Filières et formations proposées.'],
            ['enseignants', 'Enseignants', 'Équipe pédagogique affichée sur le site.'],
            ['temoignages', 'Témoignages', 'Avis des étudiants et anciens.'],
            ['partenaires', 'Partenaires', 'Logos et liens des partenaires.'],
            ['organigramme', 'Organigramme', "Structure et responsables de l'institut."],
            ['evenements', 'Événements', 'Calendrier des événements.'],
            ['campus', 'Campus', 'Blocs et photos du campus.'],
            ['documents', 'Documents', 'Documents téléchargeables.'],
        ],
    },
    {
        key: 'systeme',
        label: 'Administration',
        icon: Settings2,
        modules: [
            ['dashboard', 'Tableau de bord', 'Chiffres clés et activité récente.'],
            ['statistics', 'Statistiques', 'Statistiques détaillées.'],
            ['users', 'Utilisateurs', 'Comptes des utilisateurs.'],
            ['roles', 'Rôles & permissions', 'Droits de chaque rôle.'],
            ['activity-log', "Journal d'activité", "Historique des actions de l'administration."],
            ['settings', 'Apparence & réglages', "Couleurs et options de l'interface."],
        ],
    },
];

const ACTIONS = {
    view: 'Consulter',
    create: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    publish: 'Publier',
    manage: 'Gérer',
    access: 'Accéder',
    text: 'Modifier les textes',
    icon: 'Modifier les icônes',
    image: 'Modifier les images',
    layout: 'Modifier la mise en page',
    approve: 'Approuver',
    refuse: 'Refuser',
    export: 'Exporter',
    validate: 'Valider',
    pause: 'Mettre en pause',
};

/** Precise wording for permissions whose generic action label would be vague. */
const PERMISSION_LABELS = {
    'community.view': ['Consulter le fil', 'Voir les publications de la communauté.'],
    'community.post': ['Publier', 'Créer une publication sur le fil.'],
    'community.comment': ['Commenter', 'Répondre aux publications.'],
    'community.react': ['Réagir', "Ajouter une réaction (j'aime…) aux publications."],
    'stories.view': ['Voir les stories', 'Regarder les stories des autres membres.'],
    'stories.create': ['Publier une story', 'Partager une story éphémère.'],
    'friends.manage': ['Gérer ses amis', "Envoyer, accepter ou refuser des demandes d'amis."],
    'messages.view': ['Lire les messages', 'Accéder à la messagerie privée.'],
    'messages.send': ['Envoyer des messages', 'Écrire, transférer et réagir dans les conversations.'],
    'groups.view': ['Voir les groupes', 'Accéder aux groupes de classe dont on est membre.'],
    'groups.create': ['Créer un groupe', 'Ouvrir un nouveau groupe de classe.'],
    'groups.join': ['Rejoindre un groupe', "Entrer dans un groupe avec un code d'invitation."],
    'groups.message': ['Écrire dans le groupe', 'Envoyer des messages et des fichiers dans le groupe.'],
    'groups.announce': ['Publier annonces & leçons', 'Poster annonces, leçons, devoirs et documents.'],
    'groups.presence': ['Feuille de présence', 'Faire l’appel et télécharger la présence.'],
    'groups.moderate': ['Modérer le groupe', 'Ajouter, bannir, nommer un délégué, archiver ou supprimer.'],
    'reinscription.submit': ['Déposer sa réinscription', 'Remplir et soumettre son dossier de réinscription.'],
    'preinscriptions.manage': ['Gérer les dossiers', 'Consulter et traiter les préinscriptions.'],
    'preinscriptions.export': ['Exporter la liste', 'Télécharger les préinscriptions.'],
    'preinscriptions.approve': ['Accepter un dossier', 'Valider un dossier et ouvrir le compte étudiant.'],
    'preinscriptions.refuse': ['Refuser / demander une correction', 'Refuser un dossier ou demander une correction.'],
    'reactivations.manage': ['Consulter les demandes', 'Voir les demandes de réactivation.'],
    'reactivations.approve': ['Approuver', 'Réactiver le compte d’un ancien étudiant.'],
    'reactivations.refuse': ['Refuser', 'Refuser une demande de réactivation.'],
    'reactivations.delete': ['Supprimer', 'Supprimer une demande.'],
    'etudiants.export': ['Exporter en Excel', 'Télécharger la liste filtrée des étudiants.'],
    'etudiants.pause': ['Mettre en pause un compte', "Suspendre ou réactiver l'accès d'un étudiant."],
    'inscriptions.export': ['Exporter la liste', 'Télécharger les inscriptions.'],
    'inscriptions.approve': ['Approuver', 'Valider une inscription.'],
    'inscriptions.refuse': ['Refuser', 'Refuser une inscription.'],
    'ecolage.view': ['Voir mon écolage', 'Consulter ses versements et leur statut.'],
    'ecolage.submit': ['Déclarer un versement', 'Envoyer un reçu et sa carte d’étudiant pour vérification.'],
    'payments.view': ['Consulter les versements', 'Voir les versements déclarés et leurs justificatifs.'],
    'payments.validate': ['Valider un versement', 'Valider après vérification du reçu et de la carte.'],
    'payments.refuse': ['Refuser un versement', 'Refuser avec un motif envoyé à l’étudiant.'],
    'payments.export': ['Exporter en Excel', 'Télécharger la liste des versements.'],
    'payments.delete': ['Supprimer un versement', 'Supprimer définitivement un versement.'],
    'dashboard.view': ['Voir le tableau de bord', 'Accéder à la page d’accueil de la console.'],
};

const ACTION_ORDER = Object.keys(ACTIONS);

function permissionLabel(permission, t) {
    const override = PERMISSION_LABELS[permission];
    if (override) return t(`admin.roles.perm.${permission}`, override[0]);
    const action = permission.split('.')[1];

    return t(`admin.roles.action.${action}`, ACTIONS[action] ?? action);
}

function buildCategories(permissions, t) {
    const byModule = {};
    permissions.forEach((permission) => {
        const [module] = permission.split('.');
        (byModule[module] ??= []).push(permission);
    });

    const known = new Set(CATEGORIES.flatMap((category) => category.modules.map(([key]) => key)));
    const categories = CATEGORIES.map((category) => ({
        key: category.key,
        label: t(`admin.roles.category.${category.key}`, category.label),
        icon: category.icon,
        modules: category.modules
            .filter(([key]) => byModule[key])
            .map(([key, label, hint]) => ({
                key,
                label: t(`admin.roles.module.${key}`, label),
                hint: t(`admin.roles.module.${key}.hint`, hint),
                permissions: [...byModule[key]].sort((a, b) => ACTION_ORDER.indexOf(a.split('.')[1]) - ACTION_ORDER.indexOf(b.split('.')[1])),
            })),
    })).filter((category) => category.modules.length > 0);

    const leftovers = Object.keys(byModule).filter((key) => !known.has(key));
    if (leftovers.length > 0) {
        categories.push({
            key: 'autres',
            label: t('admin.roles.module.other', 'Autres'),
            icon: Layers,
            modules: leftovers.map((key) => ({ key, label: key, hint: '', permissions: byModule[key] })),
        });
    }

    return categories;
}

function ProgressRing({ percent, size = 64, onDark = false }) {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;

    return (
        <span className="relative flex flex-shrink-0 items-center justify-center" style={{ width: size, height: size }}>
            <svg viewBox="0 0 90 90" className="-rotate-90" width={size} height={size}>
                <circle cx="45" cy="45" r={radius} fill="none" strokeWidth="8" className={onDark ? 'stroke-white/25' : 'stroke-admin-hover'} />
                <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={cn('transition-all duration-700 ease-out', onDark ? 'stroke-white' : 'stroke-admin-accent')}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - percent / 100)}
                />
            </svg>
            <span className={cn('absolute font-bold tabular-nums', size >= 70 ? 'text-lg' : 'text-sm', onDark ? 'text-white' : 'text-admin-text')}>{percent}%</span>
        </span>
    );
}

function Switch({ checked, onChange, disabled, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={onChange}
            className={cn(
                'relative h-6 w-11 flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-admin-accent/25',
                checked ? 'bg-gradient-to-r from-admin-accent to-sky-500 shadow-inner shadow-black/10' : 'bg-admin-muted/35',
                disabled && 'cursor-default opacity-70',
            )}
        >
            <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out', checked && 'translate-x-5')} />
        </button>
    );
}

function PermissionRow({ permission, checked, onToggle, locked }) {
    const { t } = useTranslations();
    const label = permissionLabel(permission, t);
    const hint = PERMISSION_LABELS[permission]?.[1];

    return (
        <li
            onClick={locked ? undefined : onToggle}
            className={cn(
                'group flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-300',
                checked
                    ? 'border-admin-accent/30 bg-gradient-to-r from-admin-accent/10 to-transparent'
                    : 'border-admin-border/70 bg-admin-bg/30 hover:border-admin-accent/30 hover:bg-admin-hover/50',
                !locked && 'cursor-pointer hover:-translate-y-px',
            )}
        >
            <span className="min-w-0">
                <span className={cn('block truncate text-sm font-semibold transition-colors', checked ? 'text-admin-text' : 'text-admin-text-secondary')}>{label}</span>
                {hint && <span className="block truncate text-[11px] text-admin-muted">{t(`admin.roles.perm.${permission}.hint`, hint)}</span>}
            </span>
            <span onClick={(event) => event.stopPropagation()}>
                <Switch checked={checked} onChange={onToggle} disabled={locked} label={label} />
            </span>
        </li>
    );
}

function ModuleCard({ module, granted, locked, open, onToggleOpen, onToggleAll, onTogglePermission, index, icon: Icon }) {
    const { t } = useTranslations();
    const total = module.permissions.length;
    const count = module.permissions.filter((permission) => granted.has(permission)).length;
    const all = count === total;
    const share = total ? (count / total) * 100 : 0;

    return (
        <section
            className="group/module relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-sm transition-all duration-300 hover:border-admin-accent/30 hover:shadow-xl hover:shadow-admin-accent/5"
            style={{ animation: `roles-rise 420ms cubic-bezier(.2,.8,.2,1) ${Math.min(index, 8) * 50}ms both` }}
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1 origin-bottom bg-gradient-to-b from-admin-accent to-sky-500 transition-transform duration-700"
                style={{ transform: `scaleY(${share / 100})` }}
            />
            <header className="flex items-center gap-3 p-4 pl-5">
                <button type="button" onClick={onToggleOpen} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span
                        className={cn(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover/module:scale-105',
                            count === 0 ? 'bg-admin-hover text-admin-muted' : 'bg-gradient-to-br from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/30',
                        )}
                    >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-bold text-admin-text">{module.label}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums', all ? 'bg-emerald-500/15 text-emerald-600' : count === 0 ? 'bg-admin-hover text-admin-muted' : 'bg-admin-accent/10 text-admin-accent')}>
                                {count}/{total}
                            </span>
                        </span>
                        {module.hint && <span className="block truncate text-xs text-admin-muted">{module.hint}</span>}
                    </span>
                    <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-admin-muted transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
                </button>
                {!locked && (
                    <button
                        type="button"
                        onClick={onToggleAll}
                        className="flex-shrink-0 rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-text-secondary transition hover:border-admin-accent/50 hover:bg-admin-accent/5 hover:text-admin-accent"
                    >
                        {all ? t('admin.roles.deselect_all', 'Tout retirer') : t('admin.roles.select_all', 'Tout cocher')}
                    </button>
                )}
            </header>
            {open && (
                <ul className="grid grid-cols-1 gap-2 border-t border-admin-border/70 p-4 pl-5 md:grid-cols-2">
                    {module.permissions.map((permission) => (
                        <PermissionRow key={permission} permission={permission} checked={granted.has(permission)} locked={locked} onToggle={() => onTogglePermission(permission)} />
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function Index({ roles, permissions }) {
    const confirmAction = useConfirm();
    const { t } = useTranslations();
    const ROLE_LABELS = roleLabels(t);
    const categories = useMemo(() => buildCategories(permissions, t), [permissions, t]);
    const [selectedId, setSelectedId] = useState(() => roles.find((r) => r.name !== 'super-admin')?.id ?? roles[0]?.id ?? null);
    const selectedRole = roles.find((r) => r.id === selectedId) ?? null;
    const isSuperAdmin = selectedRole?.name === 'super-admin';
    const form = useForm({ permissions: selectedRole ? [...selectedRole.permissions] : [] });
    const [category, setCategory] = useState(() => CATEGORIES[0].key);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [collapsed, setCollapsed] = useState(() => new Set());

    const granted = useMemo(() => (isSuperAdmin ? new Set(permissions) : new Set(form.data.permissions)), [isSuperAdmin, permissions, form.data.permissions]);
    const percent = permissions.length ? Math.round((granted.size / permissions.length) * 100) : 0;
    const original = useMemo(() => new Set(selectedRole?.permissions ?? []), [selectedRole]);
    const added = [...granted].filter((permission) => !original.has(permission)).length;
    const removed = [...original].filter((permission) => !granted.has(permission)).length;
    const dirty = !isSuperAdmin && selectedRole && (added > 0 || removed > 0);

    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (event) => event.preventDefault();
        window.addEventListener('beforeunload', warn);

        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    const term = search.trim().toLowerCase();
    const visibleCategories = useMemo(
        () =>
            categories
                .filter((entry) => category === 'all' || entry.key === category)
                .map((entry) => ({
                    ...entry,
                    modules: entry.modules
                        .map((module) => ({
                            ...module,
                            permissions: module.permissions.filter((permission) => {
                                if (filter === 'granted' && !granted.has(permission)) return false;
                                if (filter === 'missing' && granted.has(permission)) return false;
                                if (!term) return true;

                                return `${module.label} ${permissionLabel(permission, t)} ${permission}`.toLowerCase().includes(term);
                            }),
                        }))
                        .filter((module) => module.permissions.length > 0),
                }))
                .filter((entry) => entry.modules.length > 0),
        [categories, category, filter, term, granted, t],
    );

    async function selectRole(role) {
        if (dirty && !(await confirmAction({ message: t('admin.roles.unsaved_confirm', 'Des modifications ne sont pas enregistrées. Changer de rôle les annulera.'), tone: 'warning', title: 'Modifications non enregistrées', confirmLabel: 'Changer de rôle' }))) return;
        setSelectedId(role.id);
        form.setData('permissions', [...role.permissions]);
        form.clearErrors();
    }

    function toggle(permission) {
        const current = form.data.permissions;
        form.setData('permissions', current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]);
    }

    function toggleModule(module) {
        const current = form.data.permissions;
        const all = module.permissions.every((permission) => current.includes(permission));
        form.setData('permissions', all ? current.filter((p) => !module.permissions.includes(p)) : [...new Set([...current, ...module.permissions])]);
    }

    function toggleOpen(key) {
        setCollapsed((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);

            return next;
        });
    }

    function reset() {
        form.setData('permissions', [...selectedRole.permissions]);
    }

    function save() {
        if (!selectedRole || isSuperAdmin || !dirty || form.processing) return;
        form.put(`/console/roles/${selectedRole.id}`, { preserveScroll: true });
    }

    function submit(e) {
        e.preventDefault();
        save();
    }

    // Ctrl/Cmd + S saves without reaching for the button.
    useEffect(() => {
        function onKey(event) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                save();
            }
        }
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    });

    const allModuleKeys = categories.flatMap((entry) => entry.modules.map((module) => module.key));
    const allCollapsed = collapsed.size >= allModuleKeys.length;

    const filters = [
        ['all', t('admin.roles.filter_all', 'Toutes')],
        ['granted', t('admin.roles.filter_granted', 'Accordées')],
        ['missing', t('admin.roles.filter_missing', 'Non accordées')],
    ];

    const pills = [['all', t('admin.roles.category.all', 'Tout'), Sparkles], ...categories.map((entry) => [entry.key, entry.label, entry.icon])];

    return (
        <AdminLayout title={t('admin.roles.title_full', 'Rôles & permissions')}>
            <style>{'@keyframes roles-rise { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: none; } } @keyframes roles-float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(14px,-10px); } } @media (prefers-reduced-motion: reduce) { section[style*="roles-rise"], .roles-blob { animation: none !important; } }'}</style>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
                <nav className="h-fit space-y-2 lg:sticky lg:top-20" aria-label={t('admin.roles.title', 'Rôles')}>
                    <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-admin-muted">
                        {roles.length} {t('admin.roles.count_suffix', 'rôle(s)')}
                    </p>
                    {roles.map((role) => {
                        const active = role.id === selectedId;
                        const superAdmin = role.name === 'super-admin';
                        const share = superAdmin ? 100 : permissions.length ? Math.round((role.permissions.length / permissions.length) * 100) : 0;

                        return (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => selectRole(role)}
                                aria-current={active ? 'true' : undefined}
                                className={cn(
                                    'group relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300',
                                    active
                                        ? 'border-transparent bg-gradient-to-br from-admin-accent via-admin-accent to-sky-500 text-white shadow-xl shadow-admin-accent/30'
                                        : 'border-admin-border bg-admin-card/80 text-admin-text-secondary backdrop-blur hover:-translate-y-0.5 hover:border-admin-accent/40 hover:shadow-lg',
                                )}
                            >
                                {active && <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />}
                                <span className="relative flex items-center gap-3">
                                    <span className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105', active ? 'bg-white/20 ring-1 ring-white/30' : 'bg-admin-accent/10 text-admin-accent')}>
                                        {superAdmin ? <Lock className="h-5 w-5" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className={cn('block truncate text-sm font-bold', !active && 'text-admin-text')}>{ROLE_LABELS[role.name] ?? role.name}</span>
                                        <span className={cn('flex items-center gap-1 text-[11px]', active ? 'text-white/80' : 'text-admin-muted')}>
                                            <Users className="h-3 w-3" aria-hidden="true" />
                                            {role.users_count} {t('admin.roles.users_suffix', 'utilisateur(s)')}
                                        </span>
                                    </span>
                                    <span className={cn('text-sm font-bold tabular-nums', active ? 'text-white' : 'text-admin-accent')}>{share}%</span>
                                </span>
                                <span className={cn('relative mt-2.5 block h-1 overflow-hidden rounded-full', active ? 'bg-white/25' : 'bg-admin-hover')}>
                                    <span className={cn('block h-full rounded-full transition-all duration-700', active ? 'bg-white' : 'bg-gradient-to-r from-admin-accent to-sky-500')} style={{ width: `${share}%` }} />
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {selectedRole && (
                    <form onSubmit={submit} className="min-w-0 space-y-4 pb-20">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-admin-accent via-admin-accent/90 to-sky-500 p-5 text-white shadow-xl shadow-admin-accent/20">
                            <span className="roles-blob pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" style={{ animation: 'roles-float 9s ease-in-out infinite' }} />
                            <span className="roles-blob pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" style={{ animation: 'roles-float 12s ease-in-out infinite reverse' }} />
                            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                                <span className="flex-shrink-0 rounded-full bg-white/15 p-1.5 ring-1 ring-white/30 backdrop-blur">
                                    <ProgressRing percent={percent} size={80} onDark />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl font-bold tracking-tight">{ROLE_LABELS[selectedRole.name] ?? selectedRole.name}</h2>
                                        {isSuperAdmin && (
                                            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">
                                                <Lock className="h-3 w-3" aria-hidden="true" />
                                                {t('admin.roles.locked', 'Verrouillé')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 max-w-xl text-sm text-white/85">{t(`admin.roles.blurb.${selectedRole.name}`, ROLE_BLURBS[selectedRole.name] ?? '')}</p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                                        <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
                                            {granted.size} / {permissions.length} {t('admin.roles.permissions_suffix', 'permissions')}
                                        </span>
                                        <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
                                            {selectedRole.users_count} {t('admin.roles.users_suffix', 'utilisateur(s)')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky top-16 z-20 space-y-2.5 rounded-2xl border border-admin-border bg-admin-card/85 p-2.5 shadow-lg backdrop-blur-xl">
                            <div className="flex gap-1 overflow-x-auto">
                                {pills.map(([key, label, Icon]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setCategory(key)}
                                        aria-pressed={category === key}
                                        className={cn(
                                            'flex flex-shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-300',
                                            category === key
                                                ? 'bg-gradient-to-r from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/30'
                                                : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-44 flex-1">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('admin.roles.search', 'Rechercher une permission…')}
                                        className="h-9 w-full rounded-xl border border-admin-border bg-admin-bg/50 pl-10 pr-9 text-sm text-admin-text outline-none transition focus:border-admin-accent/60 focus:ring-4 focus:ring-admin-accent/10"
                                    />
                                    {search && (
                                        <button type="button" onClick={() => setSearch('')} aria-label={t('admin.common.clear', 'Effacer')} className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text">
                                            <X className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex rounded-xl bg-admin-hover p-0.5" role="group" aria-label={t('admin.roles.filter', 'Filtrer')}>
                                    {filters.map(([key, label]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFilter(key)}
                                            aria-pressed={filter === key}
                                            className={cn('rounded-[10px] px-3 py-1.5 text-xs font-semibold transition', filter === key ? 'bg-admin-card text-admin-text shadow-sm' : 'text-admin-text-secondary hover:text-admin-text')}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(allModuleKeys))}
                                    className="flex h-9 items-center gap-1.5 rounded-xl border border-admin-border px-3 text-xs font-semibold text-admin-text-secondary transition hover:bg-admin-hover"
                                >
                                    <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
                                    {allCollapsed ? t('admin.roles.expand_all', 'Tout déplier') : t('admin.roles.collapse_all', 'Tout replier')}
                                </button>
                            </div>
                        </div>

                        {visibleCategories.length === 0 ? (
                            <div className="flex flex-col items-center rounded-2xl border border-dashed border-admin-border bg-admin-card py-12 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-admin-accent/10 text-admin-accent">
                                    <Search className="h-7 w-7" aria-hidden="true" />
                                </span>
                                <p className="mt-3 text-sm font-semibold text-admin-text">{t('admin.roles.no_result', 'Aucune permission ne correspond.')}</p>
                            </div>
                        ) : (
                            visibleCategories.map((entry) => (
                                <div key={entry.key} className="space-y-3">
                                    {visibleCategories.length > 1 && (
                                        <h3 className="flex items-center gap-2 px-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-admin-text-secondary">
                                            <entry.icon className="h-4 w-4 text-admin-accent" aria-hidden="true" />
                                            {entry.label}
                                        </h3>
                                    )}
                                    {entry.modules.map((module, index) => (
                                        <ModuleCard
                                            key={module.key}
                                            index={index}
                                            icon={entry.icon}
                                            module={module}
                                            granted={granted}
                                            locked={isSuperAdmin}
                                            open={!collapsed.has(module.key)}
                                            onToggleOpen={() => toggleOpen(module.key)}
                                            onToggleAll={() => toggleModule(module)}
                                            onTogglePermission={toggle}
                                        />
                                    ))}
                                </div>
                            ))
                        )}

                        {!isSuperAdmin && (
                            <div
                                className={cn(
                                    'fixed bottom-5 left-1/2 z-30 flex w-[min(92vw,560px)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-admin-accent/30 bg-admin-card/95 p-2.5 pl-4 shadow-2xl shadow-admin-accent/20 backdrop-blur-xl transition-all duration-500',
                                    dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0',
                                )}
                                role="region"
                                aria-label={t('admin.roles.unsaved', 'Modifications non enregistrées')}
                            >
                                <p className="min-w-0 truncate text-sm">
                                    <span className="font-semibold text-admin-text">{t('admin.roles.unsaved', 'Modifications non enregistrées')}</span>
                                    <span className="ml-2 font-bold text-emerald-500">+{added}</span>
                                    <span className="ml-1.5 font-bold text-rose-500">−{removed}</span>
                                </p>
                                <div className="flex flex-shrink-0 gap-2">
                                    <button
                                        type="button"
                                        onClick={reset}
                                        className="flex h-9 items-center gap-1.5 rounded-xl border border-admin-border px-3.5 text-xs font-semibold text-admin-text-secondary transition hover:bg-admin-hover"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('admin.common.cancel', 'Annuler')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        title="Ctrl + S"
                                        className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-admin-accent to-sky-500 px-4 text-xs font-bold text-white shadow-md shadow-admin-accent/30 transition hover:brightness-110 disabled:opacity-50"
                                    >
                                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('admin.common.save', 'Enregistrer')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}
