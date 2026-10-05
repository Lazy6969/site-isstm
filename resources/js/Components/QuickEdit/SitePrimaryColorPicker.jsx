import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Check, Palette } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

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
    const { sitePrimaryColor } = pageProps;
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customColor, setCustomColor] = useState(sitePrimaryColor?.resolvedHex ?? '#003366');

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
                </DialogContent>
            </Dialog>
        </>
    );
}
