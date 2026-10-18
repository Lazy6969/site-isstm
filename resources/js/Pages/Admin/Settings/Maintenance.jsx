import { useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Check, DoorClosed, DoorOpen, Eye, GraduationCap, Globe, Save, Wrench } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Label } from '../../../Components/ui/label';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import { cn } from '../../../lib/utils';

/** Big on/off switch used by the three sections — same toggling logic as before, new look. */
function PowerSwitch({ on, onChange, labelOn, labelOff, tone }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={on ? labelOn : labelOff}
            onClick={onChange}
            className={cn(
                'group relative h-9 w-[4.5rem] flex-shrink-0 rounded-full p-1 shadow-inner transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-admin-accent/25',
                on ? tone.on : tone.off,
            )}
        >
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-out', on && 'translate-x-9')}>
                <span className={cn('h-2 w-2 rounded-full transition-colors', on ? tone.dotOn : tone.dotOff)} />
            </span>
        </button>
    );
}

const SWITCH_TONES = {
    // "on" means the thing is closed / in maintenance → warning colours
    alert: {
        on: 'bg-gradient-to-r from-rose-500 to-orange-500',
        off: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        dotOn: 'bg-rose-500',
        dotOff: 'bg-emerald-500',
    },
    // "on" means open → positive colours
    open: {
        on: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        off: 'bg-gradient-to-r from-rose-500 to-orange-500',
        dotOn: 'bg-emerald-500',
        dotOff: 'bg-rose-500',
    },
};

/** One status tile at the top: doubles as the tab selector. */
function StatusTile({ icon: Icon, title, state, good, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cn(
                'group relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
                active ? 'border-admin-accent bg-admin-card ring-2 ring-admin-accent/20' : 'border-admin-border bg-admin-card',
            )}
        >
            <span
                className={cn(
                    'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl transition group-hover:scale-125',
                    good ? 'from-emerald-500/25' : 'from-rose-500/25',
                )}
            />
            <div className="relative flex items-center gap-3">
                <span
                    className={cn(
                        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-md transition group-hover:rotate-6',
                        good ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30' : 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-rose-500/30',
                    )}
                >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-admin-text">{title}</p>
                    <p className={cn('mt-0.5 flex items-center gap-1.5 text-xs font-semibold', good ? 'text-emerald-600' : 'text-rose-600')}>
                        <span className="relative flex h-2 w-2">
                            <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', good ? 'bg-emerald-500' : 'bg-rose-500')} />
                            <span className={cn('relative inline-flex h-2 w-2 rounded-full', good ? 'bg-emerald-500' : 'bg-rose-500')} />
                        </span>
                        {state}
                    </p>
                </div>
            </div>
        </button>
    );
}

/** Header of a section: icon, title, explanation, and the switch on the right. */
function SectionHeader({ icon: Icon, title, description, switchNode, statusNode }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
            <span className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-admin-accent/15 to-transparent blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-accent to-sky-500 text-white shadow-lg shadow-admin-accent/25">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-admin-text">{title}</h2>
                        <p className="mt-0.5 max-w-xl text-sm text-admin-text-secondary">{description}</p>
                        {statusNode && <div className="mt-2">{statusNode}</div>}
                    </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 sm:flex-col sm:items-end">{switchNode}</div>
            </div>
        </div>
    );
}

function StatePill({ good, children }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset', good ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25' : 'bg-rose-500/10 text-rose-600 ring-rose-500/25')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', good ? 'bg-emerald-500' : 'bg-rose-500')} />
            {children}
        </span>
    );
}

function SaveButton({ processing, dirty }) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-admin-accent to-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-60"
            >
                <Save className="h-4 w-4" aria-hidden="true" />
                Enregistrer
            </button>
            {dirty && <span className="text-xs font-semibold text-amber-600">Modifications non enregistrées</span>}
        </div>
    );
}

/** One template choice card — picking it loads its own default title/message into the form. */
function TemplateCard({ template, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                'group relative flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                selected ? 'border-admin-accent bg-gradient-to-br from-admin-accent/10 to-sky-500/5 shadow-md shadow-admin-accent/10 ring-1 ring-admin-accent/30' : 'border-admin-border bg-admin-card hover:border-admin-accent/40',
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-admin-text">{template.label}</span>
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full transition', selected ? 'bg-admin-accent text-admin-accent-foreground' : 'border border-admin-border')}>
                    {selected && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
                </span>
            </div>
            {template.defaultTitle && <span className="text-xs text-admin-muted">{template.defaultTitle}</span>}
        </button>
    );
}

function Counter({ value, max }) {
    return (
        <span className={cn('text-[11px] tabular-nums', value > max * 0.9 ? 'text-amber-600' : 'text-admin-muted')}>
            {value}/{max}
        </span>
    );
}

export default function Maintenance({ settings, templates, inscriptionSettings, admissionsOpen }) {
    const form = useForm({
        enabled: settings.enabled,
        template: settings.template,
        title: settings.title,
        message: settings.message,
    });
    const [previewKey, setPreviewKey] = useState(0);
    const [tab, setTab] = useState('maintenance');

    const inscriptionForm = useForm({
        closed: inscriptionSettings.closed,
        message: inscriptionSettings.message,
    });

    function toggleInscriptionsClosed() {
        inscriptionForm.setData('closed', !inscriptionForm.data.closed);
    }

    function submitInscriptions(e) {
        e.preventDefault();
        inscriptionForm.put('/console/settings/maintenance/inscriptions', { preserveScroll: true });
    }

    // A single boolean with nothing else to configure — toggling it takes
    // effect immediately (like a light switch), unlike the maintenance/
    // inscriptions toggles above which stage into their own form's "Enregistrer".
    const [admissionsOpenState, setAdmissionsOpenState] = useState(admissionsOpen);

    function toggleAdmissionsOpen() {
        const next = !admissionsOpenState;
        setAdmissionsOpenState(next);
        router.put('/console/settings/maintenance/admissions', { open: next }, { preserveScroll: true });
    }

    function pickTemplate(template) {
        form.setData({
            ...form.data,
            template: template.value,
            title: template.defaultTitle,
            message: template.defaultMessage,
        });
    }

    const previewUrl = useMemo(() => {
        const params = new URLSearchParams({
            template: form.data.template,
            title: form.data.title,
            message: form.data.message,
        });

        return `/console/settings/maintenance/preview?${params.toString()}`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.template, form.data.title, form.data.message]);

    function submit(e) {
        e.preventDefault();
        form.put('/console/settings/maintenance', {
            preserveScroll: true,
            onSuccess: () => setPreviewKey((key) => key + 1),
        });
    }

    function toggleEnabled() {
        form.setData('enabled', !form.data.enabled);
    }

    const maintenanceDirty =
        form.data.enabled !== settings.enabled || form.data.template !== settings.template || form.data.title !== settings.title || form.data.message !== settings.message;
    const inscriptionsDirty = inscriptionForm.data.closed !== inscriptionSettings.closed || inscriptionForm.data.message !== inscriptionSettings.message;

    const tiles = [
        { key: 'maintenance', icon: Globe, title: 'Site public', state: form.data.enabled ? 'En maintenance' : 'Accessible à tous', good: !form.data.enabled },
        { key: 'inscriptions', icon: inscriptionForm.data.closed ? DoorClosed : DoorOpen, title: 'Préinscription & réactivation', state: inscriptionForm.data.closed ? 'Fermées' : 'Ouvertes', good: !inscriptionForm.data.closed },
        { key: 'admissions', icon: GraduationCap, title: 'Admissions', state: admissionsOpenState ? 'Ouvertes' : 'Fermées', good: admissionsOpenState },
    ];

    return (
        <AdminLayout title="Maintenance">
            <div className="relative -mt-2 mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-admin-accent via-admin-accent/90 to-sky-500 p-5 text-white shadow-lg shadow-admin-accent/20 sm:p-6">
                <span className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
                <span className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
                <div className="relative flex items-center gap-4">
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                        <Wrench className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-lg font-bold sm:text-xl">Maintenance & accès au site</h2>
                        <p className="mt-0.5 max-w-2xl text-sm text-white/85">
                            Coupe temporairement l'accès au site public. Le personnel autorisé à gérer ces réglages continue de voir le site normalement et peut toujours se connecter pour le rétablir.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                {tiles.map((tile) => (
                    <StatusTile key={tile.key} icon={tile.icon} title={tile.title} state={tile.state} good={tile.good} active={tab === tile.key} onClick={() => setTab(tile.key)} />
                ))}
            </div>

            {tab === 'maintenance' && (
                <div className="space-y-5">
                    <SectionHeader
                        icon={Globe}
                        title="Mode maintenance"
                        description="Affiche une page d'information à la place du site pour tous les visiteurs."
                        statusNode={<StatePill good={!form.data.enabled}>{form.data.enabled ? 'En maintenance' : 'Accessible à tous'}</StatePill>}
                        switchNode={
                            <>
                                <PowerSwitch on={form.data.enabled} onChange={toggleEnabled} labelOn="Rendre le site accessible" labelOff="Activer la maintenance" tone={SWITCH_TONES.alert} />
                                <span className="text-xs font-semibold text-admin-text-secondary">{form.data.enabled ? 'Rendre le site accessible' : 'Activer la maintenance'}</span>
                            </>
                        }
                    />

                    <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
                        <div className="space-y-5 rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
                            <div>
                                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-admin-text-secondary">Message affiché aux visiteurs</Label>
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    {templates.map((template) => (
                                        <TemplateCard key={template.value} template={template} selected={form.data.template === template.value} onSelect={() => pickTemplate(template)} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="maintenance-title">Titre</Label>
                                    <Counter value={form.data.title?.length ?? 0} max={120} />
                                </div>
                                <Input id="maintenance-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-1.5 rounded-xl" />
                                {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="maintenance-message">Message</Label>
                                    <Counter value={form.data.message?.length ?? 0} max={1000} />
                                </div>
                                <Textarea id="maintenance-message" value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} rows={4} className="mt-1.5 rounded-xl" />
                                {form.errors.message && <p className="mt-1 text-sm text-red-500">{form.errors.message}</p>}
                            </div>

                            <SaveButton processing={form.processing} dirty={maintenanceDirty} />
                        </div>

                        <div className="lg:sticky lg:top-20 lg:self-start">
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-admin-text-secondary">
                                <Eye className="h-3.5 w-3.5 text-admin-accent" aria-hidden="true" />
                                Aperçu en direct
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-lg">
                                <div className="flex items-center gap-1.5 border-b border-admin-border bg-admin-hover/60 px-3 py-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                    <span className="ml-2 flex-1 truncate rounded-md bg-admin-card px-2 py-0.5 text-[10px] text-admin-muted">votre-site/</span>
                                </div>
                                <iframe key={previewKey} src={previewUrl} title="Aperçu de la page de maintenance" className="h-[420px] w-full" />
                            </div>
                            <p className="mt-2 text-xs text-admin-muted">
                                Cet aperçu reflète le formulaire ci-contre, pas encore ce qui est enregistré — testez toutes les combinaisons avant d'activer la maintenance pour de vrai.
                            </p>
                        </div>
                    </form>
                </div>
            )}

            {tab === 'inscriptions' && (
                <div className="space-y-5">
                    <SectionHeader
                        icon={inscriptionForm.data.closed ? DoorClosed : DoorOpen}
                        title="Préinscription & réactivation"
                        description="Ferme temporairement l'accès aux formulaires de préinscription et de réactivation de compte (bouton « Ancien étudiant »), indépendamment de la maintenance générale du site. Les dossiers déjà en brouillon restent accessibles à leur auteur pour être terminés."
                        statusNode={<StatePill good={!inscriptionForm.data.closed}>{inscriptionForm.data.closed ? 'Fermées' : 'Ouvertes'}</StatePill>}
                        switchNode={
                            <>
                                <PowerSwitch on={inscriptionForm.data.closed} onChange={toggleInscriptionsClosed} labelOn="Rouvrir les inscriptions" labelOff="Fermer les inscriptions" tone={SWITCH_TONES.alert} />
                                <span className="text-xs font-semibold text-admin-text-secondary">{inscriptionForm.data.closed ? 'Rouvrir les inscriptions' : 'Fermer les inscriptions'}</span>
                            </>
                        }
                    />

                    <form onSubmit={submitInscriptions} className="max-w-2xl space-y-4 rounded-2xl border border-admin-border bg-admin-card p-5 shadow-sm">
                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="inscriptions-message">Message affiché aux visiteurs lorsque c'est fermé</Label>
                                <Counter value={inscriptionForm.data.message?.length ?? 0} max={500} />
                            </div>
                            <Textarea
                                id="inscriptions-message"
                                value={inscriptionForm.data.message}
                                onChange={(e) => inscriptionForm.setData('message', e.target.value)}
                                rows={3}
                                placeholder="Les inscriptions sont actuellement fermées."
                                className="mt-1.5 rounded-xl"
                            />
                            {inscriptionForm.errors.message && <p className="mt-1 text-sm text-red-500">{inscriptionForm.errors.message}</p>}
                        </div>

                        <SaveButton processing={inscriptionForm.processing} dirty={inscriptionsDirty} />
                    </form>
                </div>
            )}

            {tab === 'admissions' && (
                <div className="space-y-5">
                    <SectionHeader
                        icon={GraduationCap}
                        title="Admissions"
                        description="Bascule la bannière « Admissions ouvertes / fermées » affichée sur l'accueil. Le titre, le texte et l'image de chaque état se modifient directement sur la page via le crayon."
                        statusNode={<StatePill good={admissionsOpenState}>{admissionsOpenState ? 'Ouvertes' : 'Fermées'}</StatePill>}
                        switchNode={
                            <>
                                <PowerSwitch on={admissionsOpenState} onChange={toggleAdmissionsOpen} labelOn="Marquer comme fermées" labelOff="Marquer comme ouvertes" tone={SWITCH_TONES.open} />
                                <span className="text-xs font-semibold text-admin-text-secondary">{admissionsOpenState ? 'Marquer comme fermées' : 'Marquer comme ouvertes'}</span>
                            </>
                        }
                    />
                    <p className="rounded-2xl border border-dashed border-admin-border bg-admin-card px-4 py-3 text-xs text-admin-text-secondary">
                        Ce réglage s'applique immédiatement : il n'y a pas de bouton « Enregistrer ».
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
