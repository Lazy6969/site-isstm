import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Check, Palette, PanelLeft, Rows3, SwatchBook, Type } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Label } from '../../../Components/ui/label';
import { Select } from '../../../Components/ui/select';

const densityOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'comfortable', label: 'Confortable' },
];

const sections = [
    { id: 'couleurs-site', label: 'Couleurs du site', icon: Palette },
    { id: 'palette-admin', label: 'Palette admin', icon: SwatchBook },
    { id: 'sidebar-menu', label: 'Sidebar & menu', icon: PanelLeft },
    { id: 'typographie', label: 'Typographie', icon: Type },
    { id: 'densite', label: 'Densité', icon: Rows3 },
];

/** Sticky jump-to-section bar, keeps the active section highlighted while scrolling. */
function QuickNav({ activeId }) {
    return (
        <nav
            aria-label="Accès rapide aux sections"
            className="sticky top-16 z-20 -mx-1 mb-6 overflow-x-auto border-b border-admin-border bg-admin-bg/95 px-1 py-2.5 backdrop-blur-sm"
        >
            <ul className="flex w-max min-w-full gap-1.5 sm:w-auto">
                {sections.map(({ id, label, icon: Icon }) => {
                    const active = activeId === id;
                    return (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                    active
                                        ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground'
                                        : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/**
 * A swatch a null `swatch` renders as a diagonal-stripe "auto" pattern — used
 * by the *_default entries of SiteMenuColor/SiteFooterColor, which don't have
 * a fixed color (they inherit the primary color instead).
 */
function ColorSwatchGrid({ options, value, onChange, checkColorClass = 'text-white' }) {
    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {options.map((color) => {
                const selected = value === color.value;
                return (
                    <button
                        key={color.value}
                        type="button"
                        onClick={() => onChange(color.value)}
                        className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition ${
                            selected ? 'border-admin-accent bg-admin-hover' : 'border-admin-border hover:bg-admin-hover'
                        }`}
                    >
                        <span
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                            style={
                                color.swatch
                                    ? { backgroundColor: color.swatch }
                                    : { background: 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 3px, #fff 3px, #fff 6px)' }
                            }
                        >
                            {selected && <Check className={`h-3.5 w-3.5 ${checkColorClass} mix-blend-difference`} aria-hidden="true" />}
                        </span>
                        <span className="text-admin-text">{color.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default function Appearance({ settings, palettes, chromes, fonts, sitePrimaries, siteAccents, siteMenus, siteFooters }) {
    const form = useForm({
        palette: settings.palette,
        chrome: settings.chrome,
        font: settings.font,
        density: settings.density,
        sitePrimary: settings.sitePrimary,
        siteAccent: settings.siteAccent,
        siteMenu: settings.siteMenu,
        siteFooter: settings.siteFooter,
    });

    const [activeId, setActiveId] = useState(sections[0].id);
    const sectionRefs = useRef({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
        );
        Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    function registerSection(id) {
        return (el) => {
            sectionRefs.current[id] = el;
        };
    }

    function submit(e) {
        e.preventDefault();
        form.put('/console/settings/appearance', { preserveScroll: true });
    }

    return (
        <AdminLayout title="Apparence">
            <form onSubmit={submit} className="max-w-2xl">
                <QuickNav activeId={activeId} />

                <div className="space-y-8">
                <section id="couleurs-site" ref={registerSection('couleurs-site')} className="scroll-mt-32 rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Couleurs du site public</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">
                        Couleur principale, d'accent, du menu et du footer du site (accueil, filières, actualités...) — indépendant de
                        l'apparence de l'administration ci-dessous.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <p className="mb-2 text-xs font-medium text-admin-text-secondary">Couleur principale</p>
                            <ColorSwatchGrid
                                options={sitePrimaries}
                                value={form.data.sitePrimary}
                                onChange={(value) => form.setData('sitePrimary', value)}
                            />
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-admin-text-secondary">Couleur d'accent</p>
                            <ColorSwatchGrid
                                options={siteAccents}
                                value={form.data.siteAccent}
                                onChange={(value) => form.setData('siteAccent', value)}
                                checkColorClass="text-black"
                            />
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-admin-text-secondary">Couleur du menu (barre de navigation)</p>
                            <ColorSwatchGrid
                                options={siteMenus}
                                value={form.data.siteMenu}
                                onChange={(value) => form.setData('siteMenu', value)}
                            />
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-medium text-admin-text-secondary">Couleur du footer</p>
                            <ColorSwatchGrid
                                options={siteFooters}
                                value={form.data.siteFooter}
                                onChange={(value) => form.setData('siteFooter', value)}
                            />
                        </div>
                    </div>
                </section>

                <section id="palette-admin" ref={registerSection('palette-admin')} className="scroll-mt-32 rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Palette de couleurs</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">
                        S'applique à l'ensemble de l'administration, pour tous les utilisateurs.
                    </p>
                    <ColorSwatchGrid options={palettes} value={form.data.palette} onChange={(value) => form.setData('palette', value)} />
                </section>

                <section id="sidebar-menu" ref={registerSection('sidebar-menu')} className="scroll-mt-32 rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-1 text-sm font-semibold text-admin-text">Couleur de la sidebar et du menu</h2>
                    <p className="mb-4 text-sm text-admin-text-secondary">
                        Fond de la barre latérale et du menu horizontal en haut, indépendant de la couleur d'accent.
                    </p>
                    <ColorSwatchGrid
                        options={chromes}
                        value={form.data.chrome}
                        onChange={(value) => form.setData('chrome', value)}
                        checkColorClass="text-admin-text"
                    />
                </section>

                <section id="typographie" ref={registerSection('typographie')} className="scroll-mt-32 rounded-xl border border-admin-border bg-admin-card p-5">
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

                <section id="densite" ref={registerSection('densite')} className="scroll-mt-32 rounded-xl border border-admin-border bg-admin-card p-5">
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
                </div>
            </form>
        </AdminLayout>
    );
}
