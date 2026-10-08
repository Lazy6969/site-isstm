import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Check, DoorClosed, DoorOpen, Eye, TriangleAlert } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Label } from '../../../Components/ui/label';
import { Input } from '../../../Components/ui/input';
import { Textarea } from '../../../Components/ui/textarea';
import { Badge } from '../../../Components/ui/badge';

/** One template choice card — picking it loads its own default title/message into the form. */
function TemplateCard({ template, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition ${
                selected ? 'border-admin-accent bg-admin-accent/10' : 'border-admin-border hover:bg-admin-hover'
            }`}
        >
            <div className="flex items-center justify-between">
                <span className="font-medium text-admin-text">{template.label}</span>
                {selected && <Check className="h-4 w-4 text-admin-accent" aria-hidden="true" />}
            </div>
            {template.defaultTitle && <span className="text-xs text-admin-muted">{template.defaultTitle}</span>}
        </button>
    );
}

export default function Maintenance({ settings, templates, inscriptionSettings }) {
    const form = useForm({
        enabled: settings.enabled,
        template: settings.template,
        title: settings.title,
        message: settings.message,
    });
    const [previewKey, setPreviewKey] = useState(0);

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

    return (
        <AdminLayout title="Maintenance">
            <p className="mb-5 text-sm text-admin-text-secondary">
                Coupe temporairement l'accès au site public. Le personnel autorisé à gérer ces réglages continue de
                voir le site normalement et peut toujours se connecter pour le rétablir.
            </p>

            <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-admin-border bg-admin-card p-5">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            form.data.enabled ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                        }`}
                    >
                        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-medium text-admin-text">Site public</p>
                        <Badge variant={form.data.enabled ? 'danger' : 'success'}>
                            {form.data.enabled ? 'En maintenance' : 'Accessible à tous'}
                        </Badge>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={toggleEnabled}
                    className={form.data.enabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}
                >
                    {form.data.enabled ? 'Rendre le site accessible' : 'Activer la maintenance'}
                </Button>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                    <div>
                        <Label className="mb-2 block">Message affiché aux visiteurs</Label>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.value}
                                    template={template}
                                    selected={form.data.template === template.value}
                                    onSelect={() => pickTemplate(template)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="maintenance-title">Titre</Label>
                        <Input
                            id="maintenance-title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            className="mt-1.5"
                        />
                        {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                    </div>

                    <div>
                        <Label htmlFor="maintenance-message">Message</Label>
                        <Textarea
                            id="maintenance-message"
                            value={form.data.message}
                            onChange={(e) => form.setData('message', e.target.value)}
                            rows={4}
                            className="mt-1.5"
                        />
                        {form.errors.message && <p className="mt-1 text-sm text-red-500">{form.errors.message}</p>}
                    </div>

                    <Button type="submit" disabled={form.processing} className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90">
                        Enregistrer
                    </Button>
                </div>

                <div className="lg:sticky lg:top-20 lg:self-start">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-admin-muted uppercase">
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Aperçu en direct
                    </p>
                    <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
                        <iframe key={previewKey} src={previewUrl} title="Aperçu de la page de maintenance" className="h-[420px] w-full" />
                    </div>
                    <p className="mt-2 text-xs text-admin-muted">
                        Cet aperçu reflète le formulaire ci-contre, pas encore ce qui est enregistré — testez toutes les
                        combinaisons avant d'activer la maintenance pour de vrai.
                    </p>
                </div>
            </form>

            <hr className="my-8 border-admin-border" />

            <h2 className="mb-1 text-base font-semibold text-admin-text">Préinscription & réactivation</h2>
            <p className="mb-5 text-sm text-admin-text-secondary">
                Ferme temporairement l'accès aux formulaires de préinscription et de réactivation de compte (bouton
                « Ancien étudiant »), indépendamment de la maintenance générale du site. Les dossiers déjà en
                brouillon restent accessibles à leur auteur pour être terminés.
            </p>

            <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-admin-border bg-admin-card p-5">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            inscriptionForm.data.closed
                                ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                        }`}
                    >
                        {inscriptionForm.data.closed ? (
                            <DoorClosed className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <DoorOpen className="h-5 w-5" aria-hidden="true" />
                        )}
                    </span>
                    <div>
                        <p className="font-medium text-admin-text">Préinscription & réactivation</p>
                        <Badge variant={inscriptionForm.data.closed ? 'danger' : 'success'}>
                            {inscriptionForm.data.closed ? 'Fermées' : 'Ouvertes'}
                        </Badge>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={toggleInscriptionsClosed}
                    className={inscriptionForm.data.closed ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}
                >
                    {inscriptionForm.data.closed ? 'Rouvrir les inscriptions' : 'Fermer les inscriptions'}
                </Button>
            </div>

            <form onSubmit={submitInscriptions} className="max-w-lg space-y-4">
                <div>
                    <Label htmlFor="inscriptions-message">Message affiché aux visiteurs lorsque c'est fermé</Label>
                    <Textarea
                        id="inscriptions-message"
                        value={inscriptionForm.data.message}
                        onChange={(e) => inscriptionForm.setData('message', e.target.value)}
                        rows={3}
                        placeholder="Les inscriptions sont actuellement fermées."
                        className="mt-1.5"
                    />
                    {inscriptionForm.errors.message && <p className="mt-1 text-sm text-red-500">{inscriptionForm.errors.message}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={inscriptionForm.processing}
                    className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90"
                >
                    Enregistrer
                </Button>
            </form>
        </AdminLayout>
    );
}
