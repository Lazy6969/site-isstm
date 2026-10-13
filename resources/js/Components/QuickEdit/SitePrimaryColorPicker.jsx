import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Check, Minus, Palette, Waves } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ABSTRACT_WAVES_DESIGNS } from '../Layout/AbstractWaves';
import { TITLE_UNDERLINE_STYLES } from '../Layout/TitleUnderline';

/**
 * Fixed pencil-style button (stacked directly above SeoHead's own SEO
 * button — same corner, same look) that swaps the site's primary blue
 * (--color-isstm-navy, used on every banner/button/header across the public
 * site) for one of SitePrimaryColor's fixed options. Global rather than
 * per-page like SeoHead, since the color it changes applies everywhere, not
 * just to the current page.
 *
 * Submits only `sitePrimary` to the existing appearance-settings endpoint —
 * AppearanceSettingsController::update() treats every field as optional
 * specifically so this partial submission never resets the admin's other
 * appearance choices (font, density, accent…).
 */
export default function SitePrimaryColorPicker() {
    const { canEdit, active } = useQuickEdit();
    const { props: pageProps, url } = usePage();
    const { sitePrimaryColor, abstractWavesDesign, titleUnderlineColor, titleUnderlineStyle } = pageProps;
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customColor, setCustomColor] = useState(sitePrimaryColor?.resolvedHex ?? '#003366');
    const [savingWaves, setSavingWaves] = useState(false);
    const [underlineColor, setUnderlineColor] = useState(titleUnderlineColor || '#d4a017');
    const [savingUnderline, setSavingUnderline] = useState(false);
    const [savingUnderlineStyle, setSavingUnderlineStyle] = useState(false);

    // Quick edit mode can stay "on" (it's a persisted toggle) while an admin
    // navigates into /console — the console already has its own full Apparence
    // settings page, so this floating shortcut has no business showing up there.
    if (!canEdit || !active || !sitePrimaryColor || url.startsWith('/console')) {
        return null;
    }

    function pick(value) {
        if (value === sitePrimaryColor.current) {
            setOpen(false);
            return;
        }

        setSaving(true);
        router.put(
            '/console/settings/appearance',
            { sitePrimary: value },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setSaving(false);
                    setOpen(false);
                },
            },
        );
    }

    function pickWaves(value) {
        if (value === abstractWavesDesign) return;

        setSavingWaves(true);
        router.put(
            '/console/settings/appearance',
            { abstractWaves: value },
            { preserveScroll: true, preserveState: true, onFinish: () => setSavingWaves(false) },
        );
    }

    function pickUnderline(value) {
        setSavingUnderline(true);
        router.put(
            '/console/settings/appearance',
            { titleUnderline: value },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setSavingUnderline(false);
                    setUnderlineColor(value || '#d4a017');
                },
            },
        );
    }

    function pickUnderlineStyle(value) {
        if (value === (titleUnderlineStyle ?? 'dash')) return;

        setSavingUnderlineStyle(true);
        router.put(
            '/console/settings/appearance',
            { titleUnderlineStyle: value },
            { preserveScroll: true, preserveState: true, onFinish: () => setSavingUnderlineStyle(false) },
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                // bottom-40: stacked above SeoHead's SEO button, which is itself
                // stacked above the Paramètre FAB (see app.jsx's FloatingAccountGroup).
                className="fixed bottom-40 left-5 z-40 hidden items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-xs font-semibold text-amber-950 shadow-lg ring-2 ring-white transition hover:scale-105 md:flex"
                aria-label="Changer la couleur principale du site"
                title="Changer la couleur principale du site"
            >
                <Palette className="h-4 w-4" aria-hidden="true" />
                Couleur
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                            Couleur principale du site
                        </DialogTitle>
                        <DialogDescription>
                            Remplace le bleu marine utilisé sur les bannières, boutons et en-têtes de tout le site public.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {sitePrimaryColor.options.map((color) => {
                            const selected = color.value === sitePrimaryColor.current;
                            return (
                                <button
                                    key={color.value}
                                    type="button"
                                    disabled={saving}
                                    onClick={() => pick(color.value)}
                                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        selected
                                            ? 'border-isstm-navy bg-isstm-navy/5 dark:border-isstm-gold dark:bg-isstm-gold/10'
                                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span
                                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                                        style={{ backgroundColor: color.swatch }}
                                    >
                                        {selected && <Check className="h-3.5 w-3.5 text-white mix-blend-difference" aria-hidden="true" />}
                                    </span>
                                    <span className="text-slate-700 dark:text-slate-200">{color.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
                        <input
                            type="color"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            disabled={saving}
                            className="h-9 w-12 cursor-pointer rounded border border-black/10 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Choisir une couleur personnalisée"
                        />
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">Couleur personnalisée</span>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => pick(customColor)}
                            className="rounded-md bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Appliquer
                        </button>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                            <Waves className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                            Fond décoratif
                        </p>
                        <p className="mb-2.5 text-xs text-admin-text-secondary">
                            Un motif discret derrière les sections claires du site public (sauf la communauté), teinté
                            avec la couleur ci-dessus.
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {ABSTRACT_WAVES_DESIGNS.map((design) => {
                                const selected = design.value === (abstractWavesDesign ?? 'none');
                                return (
                                    <button
                                        key={design.value}
                                        type="button"
                                        disabled={savingWaves}
                                        onClick={() => pickWaves(design.value)}
                                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                            selected
                                                ? 'border-isstm-navy bg-isstm-navy/5 dark:border-isstm-gold dark:bg-isstm-gold/10'
                                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {selected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-isstm-navy dark:text-isstm-gold" aria-hidden="true" />}
                                        <span className="text-slate-700 dark:text-slate-200">{design.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                            <Minus className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                            Soulignement des titres
                        </p>
                        <p className="mb-2.5 text-xs text-admin-text-secondary">
                            Le trait sous les titres de section (« Nos filières », « Paroles d'étudiants »…). Doré par
                            défaut.
                        </p>
                        <div className="mb-2.5 grid grid-cols-2 gap-2">
                            {TITLE_UNDERLINE_STYLES.map((styleOption) => {
                                const selected = styleOption.value === (titleUnderlineStyle ?? 'dash');
                                return (
                                    <button
                                        key={styleOption.value}
                                        type="button"
                                        disabled={savingUnderlineStyle}
                                        onClick={() => pickUnderlineStyle(styleOption.value)}
                                        className={`flex flex-col items-center gap-2 rounded-lg border px-2.5 py-3 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                            selected
                                                ? 'border-isstm-navy bg-isstm-navy/5 dark:border-isstm-gold dark:bg-isstm-gold/10'
                                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="text-slate-500 dark:text-slate-300">Titre</span>
                                        <span
                                            className={`block rounded-full bg-isstm-gold ${styleOption.value === 'bar' ? 'h-2 w-10' : 'h-1 w-6'}`}
                                        />
                                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                            {selected && <Check className="h-3 w-3 text-isstm-navy dark:text-isstm-gold" aria-hidden="true" />}
                                            {styleOption.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
                            <input
                                type="color"
                                value={underlineColor}
                                onChange={(e) => setUnderlineColor(e.target.value)}
                                disabled={savingUnderline}
                                className="h-9 w-12 cursor-pointer rounded border border-black/10 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Choisir la couleur du soulignement des titres"
                            />
                            <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">Couleur</span>
                            <button
                                type="button"
                                disabled={savingUnderline}
                                onClick={() => pickUnderline('')}
                                className="rounded-md bg-admin-hover px-3 py-1.5 text-xs font-semibold text-admin-text transition hover:bg-admin-hover/70 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Doré (défaut)
                            </button>
                            <button
                                type="button"
                                disabled={savingUnderline}
                                onClick={() => pickUnderline(underlineColor)}
                                className="rounded-md bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
