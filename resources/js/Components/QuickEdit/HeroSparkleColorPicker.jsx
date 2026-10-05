import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Pencil, Sparkle } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

/**
 * Pencil badge sitting over the hero's title/subtitle block, letting an admin
 * override the twinkling sparkles' color independently of the site primary
 * color (see Hero.jsx) — only rendered on the homepage, since that's the only
 * place the sparkles exist. Saves through the same appearance-settings
 * endpoint as SitePrimaryColorPicker, under a different field.
 */
export default function HeroSparkleColorPicker({ value, resolvedDefault }) {
    const { canEdit, active } = useQuickEdit();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [color, setColor] = useState(value || resolvedDefault || '#003366');

    if (!canEdit || !active) {
        return null;
    }

    function openDialog() {
        setColor(value || resolvedDefault || '#003366');
        setOpen(true);
    }

    function save(nextValue) {
        setSaving(true);
        router.put(
            '/console/settings/appearance',
            { heroSparkleColor: nextValue },
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
                onClick={openDialog}
                className="absolute -top-3 -right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                aria-label="Changer la couleur des étincelles"
                title="Changer la couleur des étincelles"
            >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkle className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                            Couleur des étincelles
                        </DialogTitle>
                        <DialogDescription>
                            Par défaut, les étincelles suivent la couleur principale du site. Choisis-en une autre ici si tu préfères.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={color}
                            disabled={saving}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded border border-black/10 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Choisir une couleur d'étincelle personnalisée"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">{color}</span>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            disabled={saving || !value}
                            onClick={() => save(null)}
                            className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                        >
                            Automatique
                        </Button>
                        <Button
                            type="button"
                            disabled={saving}
                            onClick={() => save(color)}
                            className="bg-isstm-navy text-white hover:brightness-110"
                        >
                            Appliquer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
