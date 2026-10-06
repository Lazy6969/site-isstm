import { useForm } from '@inertiajs/react';
import { DoorClosed, DoorOpen } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Label } from '../../../Components/ui/label';
import { Textarea } from '../../../Components/ui/textarea';
import { Badge } from '../../../Components/ui/badge';

export default function Inscriptions({ settings }) {
    const form = useForm({
        closed: settings.closed,
        message: settings.message,
    });

    function toggleClosed() {
        form.setData('closed', !form.data.closed);
    }

    function submit(e) {
        e.preventDefault();
        form.put('/console/settings/inscriptions', { preserveScroll: true });
    }

    return (
        <AdminLayout title="Inscriptions">
            <p className="mb-5 text-sm text-admin-text-secondary">
                Ferme temporairement l'accès aux formulaires de préinscription et de réactivation de compte (bouton
                « Ancien étudiant »). Les dossiers déjà en brouillon restent accessibles à leur auteur pour être
                terminés.
            </p>

            <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-admin-border bg-admin-card p-5">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            form.data.closed
                                ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                        }`}
                    >
                        {form.data.closed ? <DoorClosed className="h-5 w-5" aria-hidden="true" /> : <DoorOpen className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <div>
                        <p className="font-medium text-admin-text">Préinscription & réactivation</p>
                        <Badge variant={form.data.closed ? 'danger' : 'success'}>{form.data.closed ? 'Fermées' : 'Ouvertes'}</Badge>
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={toggleClosed}
                    className={form.data.closed ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}
                >
                    {form.data.closed ? 'Rouvrir les inscriptions' : 'Fermer les inscriptions'}
                </Button>
            </div>

            <form onSubmit={submit} className="max-w-lg space-y-4">
                <div>
                    <Label htmlFor="inscriptions-message">Message affiché aux visiteurs lorsque c'est fermé</Label>
                    <Textarea
                        id="inscriptions-message"
                        value={form.data.message}
                        onChange={(e) => form.setData('message', e.target.value)}
                        rows={3}
                        placeholder="Les inscriptions sont actuellement fermées."
                        className="mt-1.5"
                    />
                    {form.errors.message && <p className="mt-1 text-sm text-red-500">{form.errors.message}</p>}
                </div>

                <Button type="submit" disabled={form.processing} className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90">
                    Enregistrer
                </Button>
            </form>
        </AdminLayout>
    );
}
