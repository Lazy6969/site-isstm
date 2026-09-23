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

export default function Appearance({ settings, palettes, chromes, fonts, sitePrimaries, siteAccents }) {
    const form = useForm({
        palette: settings.palette,
        chrome: settings.chrome,
        font: settings.font,
        density: settings.density,
        sitePrimary: settings.sitePrimary,
        siteAccent: settings.siteAccent,
    });

    function submit(e) {
        e.preventDefault();
        form.put('/console/settings/appearance', { preserveScroll: true });
    }

    return (
        <AdminLayout title="Apparence">
            <form onSubmit={submit} className="max-w-2xl space-y-8">
                <section className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Couleurs du site public</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">
                        Couleur principale et couleur d'accent du site (accueil, filières, actualités...) — indépendant de l'apparence
                        de l'administration ci-dessous.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <p className="mb-2 text-xs font-medium text-admin-text-secondary">Couleur principale</p>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {sitePrimaries.map((color) => {
                                    const selected = form.data.sitePrimary === color.value;
                                    return (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => form.setData('sitePrimary', color.value)}
                                            className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition ${
                                                selected
                                                    ? 'border-admin-accent bg-admin-hover'
                                                    : 'border-admin-border hover:bg-admin-hover'
                                            }`}
                                        >
                                            <span
                                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                                                style={{ backgroundColor: color.swatch }}
                                            >
                                                {selected && <Check className="h-3.5 w-3.5 text-white mix-blend-difference" aria-hidden="true" />}
                                            </span>
                                            <span className="text-admin-text">{color.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-admin-text-secondary">Couleur d'accent</p>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {siteAccents.map((color) => {
                                    const selected = form.data.siteAccent === color.value;
                                    return (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => form.setData('siteAccent', color.value)}
                                            className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition ${
                                                selected
                                                    ? 'border-admin-accent bg-admin-hover'
                                                    : 'border-admin-border hover:bg-admin-hover'
                                            }`}
                                        >
                                            <span
                                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                                                style={{ backgroundColor: color.swatch }}
                                            >
                                                {selected && <Check className="h-3.5 w-3.5 text-black mix-blend-difference" aria-hidden="true" />}
                                            </span>
                                            <span className="text-admin-text">{color.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

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
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Couleur de la sidebar et du menu</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">
                        Fond de la barre latérale et du menu horizontal en haut, indépendant de la couleur d'accent.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {chromes.map((chrome) => {
                            const selected = form.data.chrome === chrome.value;
                            return (
                                <button
                                    key={chrome.value}
                                    type="button"
                                    onClick={() => form.setData('chrome', chrome.value)}
                                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition ${
                                        selected
                                            ? 'border-admin-accent bg-admin-hover'
                                            : 'border-admin-border hover:bg-admin-hover'
                                    }`}
                                >
                                    <span
                                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                                        style={{ backgroundColor: chrome.swatch }}
                                    >
                                        {selected && <Check className="h-3.5 w-3.5 text-admin-text" aria-hidden="true" />}
                                    </span>
                                    <span className="text-admin-text">{chrome.label}</span>
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
