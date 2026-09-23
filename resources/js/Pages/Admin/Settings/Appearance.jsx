import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';

const densityOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'comfortable', label: 'Confortable' },
];

export default function Appearance({ settings, palettes, fonts }) {
    const form = useForm({
        palette: settings.palette,
        font: settings.font,
        density: settings.density,
    });

    function submit(e) {
        e.preventDefault();
        form.put('/console/settings/appearance', { preserveScroll: true });
    }

    return (
        <AdminLayout title="Apparence">
            <form onSubmit={submit} className="max-w-2xl space-y-8">
                <section className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Palette de couleurs</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">
                        S'applique à l'ensemble de l'administration, pour tous les utilisateurs.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {palettes.map((palette) => {
                            const selected = form.data.palette === palette.value;
                            return (
                                <button
                                    key={palette.value}
                                    type="button"
                                    onClick={() => form.setData('palette', palette.value)}
                                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition ${
                                        selected
                                            ? 'border-admin-accent bg-admin-hover'
                                            : 'border-admin-border hover:bg-admin-hover'
                                    }`}
                                >
                                    <span
                                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                                        style={{ backgroundColor: palette.swatch }}
                                    >
                                        {selected && <Check className="h-3.5 w-3.5 text-white mix-blend-difference" aria-hidden="true" />}
                                    </span>
                                    <span className="text-admin-text">{palette.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Typographie</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">Police utilisée dans l'administration uniquement.</p>
                    <Label htmlFor="font">Police</Label>
                    <Select id="font" value={form.data.font} onChange={(e) => form.setData('font', e.target.value)} className="mt-1.5">
                        {fonts.map((font) => (
                            <option key={font.value} value={font.value}>
                                {font.label}
                            </option>
                        ))}
                    </Select>
                </section>

                <section className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Densité</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">Contrôle l'espacement des tableaux et listes.</p>
                    <div className="flex gap-2">
                        {densityOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => form.setData('density', option.value)}
                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                    form.data.density === option.value
                                        ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground'
                                        : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                    >
                        Enregistrer
                    </Button>
                    <p className="text-xs text-admin-muted">Les changements s'appliquent après actualisation de la page.</p>
                </div>
            </form>
        </AdminLayout>
    );
}
