import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Lock, ShieldCheck, Users, Save, Lightbulb } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

function roleLabels(t) {
    return {
        'super-admin': t('admin.roles.super_admin', 'Super Admin'),
        enseignant: t('admin.roles.enseignant', 'Enseignant'),
        scolarite: t('admin.roles.scolarite', 'Scolarité'),
        'responsable-materiel': t('admin.roles.materiel', 'Matériel'),
        etudiant: t('admin.roles.etudiant', 'Étudiant'),
    };
}

/**
 * Feature areas of the console, in the order of the sidebar, each with the
 * permission module it controls. A module unknown here still appears (under
 * "Autres") so a new permission is never hidden.
 */
const MODULES = [
    ['dashboard', 'Tableau de bord', 'Voir les chiffres clés et l’activité récente.'],
    ['statistics', 'Statistiques', 'Consulter les statistiques détaillées.'],
    ['preinscriptions', 'Préinscriptions', 'Traiter les dossiers de préinscription des candidats.'],
    ['etudiants', 'Étudiants', 'Fiches et dossiers des étudiants.'],
    ['inscriptions', 'Inscriptions', 'Inscriptions et réinscriptions par année.'],
    ['classes', 'Niveaux & classes', 'Niveaux, classes et affectations.'],
    ['quick-edit', 'Contenu du site', 'Modifier les textes, icônes et images du site public.'],
    ['hero', "Images de l'accueil", "Diaporama de la page d'accueil."],
    ['news', 'Actualités', 'Articles publiés sur le site.'],
    ['gallery', 'Galerie', 'Albums photos.'],
    ['filieres', 'Filières', 'Filières et formations proposées.'],
    ['enseignants', 'Enseignants', "Équipe pédagogique affichée sur le site."],
    ['temoignages', 'Témoignages', 'Avis des étudiants et anciens.'],
    ['partenaires', 'Partenaires', 'Logos et liens des partenaires.'],
    ['organigramme', 'Organigramme', "Structure et responsables de l'institut."],
    ['evenements', 'Événements', 'Calendrier des événements.'],
    ['campus', 'Campus', 'Blocs et photos du campus.'],
    ['documents', 'Documents', 'Documents téléchargeables.'],
    ['users', 'Utilisateurs', 'Comptes des utilisateurs.'],
    ['roles', 'Rôles & permissions', 'Droits de chaque rôle.'],
    ['activity-log', "Journal d'activité", "Historique des actions de l'administration."],
    ['settings', 'Apparence & réglages', "Couleurs et options de l'interface."],
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
};

const ACTION_ORDER = Object.keys(ACTIONS);

function buildSections(permissions, t) {
    const byModule = {};
    permissions.forEach((permission) => {
        const [module] = permission.split('.');
        (byModule[module] ??= []).push(permission);
    });

    const known = MODULES.filter(([key]) => byModule[key]).map(([key, label, hint]) => ({
        key,
        label: t(`admin.roles.module.${key}`, label),
        hint: t(`admin.roles.module.${key}.hint`, hint),
        permissions: byModule[key],
    }));
    const leftovers = Object.keys(byModule)
        .filter((key) => !MODULES.some(([known]) => known === key))
        .map((key) => ({ key, label: `${t('admin.roles.module.other', 'Autres')} — ${key}`, hint: '', permissions: byModule[key] }));

    return [...known, ...leftovers].map((section) => ({
        ...section,
        permissions: [...section.permissions].sort((a, b) => ACTION_ORDER.indexOf(a.split('.')[1]) - ACTION_ORDER.indexOf(b.split('.')[1])),
    }));
}

function actionLabel(permission, t) {
    const action = permission.split('.')[1];
    return t(`admin.roles.action.${action}`, ACTIONS[action] ?? action);
}

function PermissionCard({ permission, checked, onToggle }) {
    const { t } = useTranslations();
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={onToggle}
            className={`group relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                checked
                    ? 'border-admin-accent bg-admin-accent/10 text-admin-accent shadow-sm shadow-admin-accent/10'
                    : 'border-admin-border bg-admin-bg/40 text-admin-text-secondary hover:border-admin-accent/40 hover:text-admin-text'
            }`}
        >
            <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                    checked ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground' : 'border-admin-muted/60'
                }`}
            >
                {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
            </span>
            <span className="truncate">{actionLabel(permission, t)}</span>
        </button>
    );
}

export default function Index({ roles, permissions }) {
    const { t } = useTranslations();
    const ROLE_LABELS = roleLabels(t);
    const sections = useMemo(() => buildSections(permissions, t), [permissions, t]);
    const [selectedId, setSelectedId] = useState(() => roles.find((r) => r.name !== 'super-admin')?.id ?? roles[0]?.id ?? null);
    const selectedRole = roles.find((r) => r.id === selectedId) ?? null;
    const isSuperAdmin = selectedRole?.name === 'super-admin';
    const form = useForm({ permissions: selectedRole ? [...selectedRole.permissions] : [] });

    const granted = isSuperAdmin ? permissions.length : form.data.permissions.length;
    const percent = permissions.length ? Math.round((granted / permissions.length) * 100) : 0;
    const dirty = !isSuperAdmin && selectedRole && [...form.data.permissions].sort().join('|') !== [...selectedRole.permissions].sort().join('|');

    function selectRole(role) {
        setSelectedId(role.id);
        form.setData('permissions', [...role.permissions]);
        form.clearErrors();
    }

    function toggle(permission) {
        const current = form.data.permissions;
        form.setData('permissions', current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]);
    }

    function toggleSection(section) {
        const current = form.data.permissions;
        const allChecked = section.permissions.every((p) => current.includes(p));
        form.setData(
            'permissions',
            allChecked ? current.filter((p) => !section.permissions.includes(p)) : [...new Set([...current, ...section.permissions])],
        );
    }

    function reset() {
        form.setData('permissions', [...selectedRole.permissions]);
    }

    function submit(e) {
        e.preventDefault();
        form.put(`/console/roles/${selectedRole.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title={t('admin.roles.title_full', 'Rôles & permissions')}>
            <p className="-mt-3 mb-6 text-sm text-admin-text-secondary">
                {t('admin.roles.intro', 'Choisissez un rôle, puis cochez ce qu’il peut faire dans chaque partie du site.')}
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                <nav className="admin-card h-fit p-2 lg:sticky lg:top-20" aria-label={t('admin.roles.title', 'Rôles')}>
                    <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-admin-muted">
                        {roles.length} {t('admin.roles.count_suffix', 'rôle(s)')}
                    </p>
                    <ul className="space-y-1">
                        {roles.map((role) => {
                            const active = role.id === selectedId;
                            const superAdmin = role.name === 'super-admin';
                            return (
                                <li key={role.id}>
                                    <button
                                        type="button"
                                        onClick={() => selectRole(role)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                            active
                                                ? 'bg-gradient-to-r from-admin-accent to-admin-accent/80 text-admin-accent-foreground shadow-md shadow-admin-accent/25'
                                                : 'text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                        }`}
                                    >
                                        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${active ? 'bg-white/20' : 'bg-admin-accent/15 text-admin-accent'}`}>
                                            {superAdmin ? <Lock className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">{ROLE_LABELS[role.name] ?? role.name}</span>
                                            <span className={`flex items-center gap-1 text-xs ${active ? 'text-white/80' : 'text-admin-muted'}`}>
                                                <Users className="h-3 w-3" aria-hidden="true" />
                                                {role.users_count} · {superAdmin ? t('admin.roles.all_permissions', 'Toutes') : `${role.permissions.length}/${permissions.length}`}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {selectedRole && (
                    <form onSubmit={submit} className="min-w-0 space-y-5">
                        <div className="admin-card p-5">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-semibold text-admin-text">{ROLE_LABELS[selectedRole.name] ?? selectedRole.name}</span>
                                <span className="text-admin-muted">
                                    {granted} / {permissions.length} · {percent}%
                                </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-admin-hover">
                                <div className="h-full rounded-full bg-admin-accent transition-all duration-500" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="mt-4 flex items-start gap-3 rounded-xl bg-admin-accent/10 p-3.5 text-sm">
                                <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-admin-accent" aria-hidden="true" />
                                <p className="text-admin-text-secondary">
                                    {isSuperAdmin
                                        ? t('admin.roles.super_admin_note', 'Le Super Admin a toujours toutes les permissions : elles ne sont pas modifiables.')
                                        : t('admin.roles.tip', 'Consulter est nécessaire pour voir une page ; Ajouter, Modifier et Supprimer contrôlent les actions dessus.')}
                                </p>
                            </div>
                        </div>

                        {sections.map((section, index) => {
                            const checkedCount = isSuperAdmin ? section.permissions.length : section.permissions.filter((p) => form.data.permissions.includes(p)).length;
                            const allChecked = checkedCount === section.permissions.length;
                            return (
                                <section key={section.key} className="admin-card p-5">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-admin-accent text-sm font-semibold text-admin-accent">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <h2 className="text-base font-semibold text-admin-text">{section.label}</h2>
                                                {section.hint && <p className="text-xs text-admin-muted">{section.hint}</p>}
                                            </div>
                                        </div>
                                        {!isSuperAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => toggleSection(section)}
                                                className="flex-shrink-0 rounded-lg border border-admin-border px-2.5 py-1 text-xs font-medium text-admin-text-secondary transition hover:border-admin-accent/50 hover:text-admin-accent"
                                            >
                                                {allChecked ? t('admin.roles.deselect_all', 'Tout retirer') : t('admin.roles.select_all', 'Tout cocher')} ({checkedCount}/{section.permissions.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                                        {section.permissions.map((permission) => (
                                            <div key={permission} className={isSuperAdmin ? 'pointer-events-none opacity-90' : ''}>
                                                <PermissionCard
                                                    permission={permission}
                                                    checked={isSuperAdmin || form.data.permissions.includes(permission)}
                                                    onToggle={() => toggle(permission)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                        {!isSuperAdmin && (
                            <div className="admin-card sticky bottom-4 z-10 flex items-center justify-between gap-3 p-3 shadow-xl">
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={!dirty}
                                    className="flex items-center gap-2 rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover disabled:opacity-40"
                                >
                                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                    {t('admin.common.cancel', 'Annuler')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing || !dirty}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-5 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" aria-hidden="true" />
                                    {t('admin.common.save', 'Enregistrer')}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}
