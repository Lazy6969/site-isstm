import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { CARD_SHADOW_OPTIONS, cardContainerStyle } from '../../lib/cardStyle';

const DEFAULT_STYLE = {
    bg_color: '',
    border_color: '',
    border_width: 0,
    border_radius: '',
    shadow: '',
};

function toStylePayload(style) {
    const payload = {};
    if (style.bg_color !== '') payload.bg_color = style.bg_color;
    if (style.border_color !== '') payload.border_color = style.border_color;
    if (Number(style.border_width) !== 0) payload.border_width = Number(style.border_width);
    if (style.border_radius !== '') payload.border_radius = Number(style.border_radius);
    if (style.shadow !== '') payload.shadow = style.shadow;

    return Object.keys(payload).length > 0 ? payload : null;
}

/**
 * One style shared by every card in a grid (filières, actualités, bourse,
 * équipe) — there's no single content_key per card to attach a pencil to, so
 * this edits a dedicated *_carte content row whose `value` is never displayed,
 * only its `style` column is used (see cardContainerStyle, lib/cardStyle.js).
 */
export default function EditCardStyleDialog({ open, onClose, contentKey, initialStyle }) {
    const form = useForm({ key: contentKey, value: 'Style des cartes' });
    const [style, setStyle] = useState({ ...DEFAULT_STYLE, ...initialStyle });

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, value: 'Style des cartes' });
            form.clearErrors();
            setStyle({ ...DEFAULT_STYLE, ...initialStyle });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function patchStyle(patch) {
        setStyle((current) => ({ ...current, ...patch }));
    }

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, style: toStylePayload(style) }));
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Style des cartes</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <p className="text-sm text-admin-text-secondary">S'applique à toutes les cartes de cette section.</p>

                    <div className="h-24 rounded-2xl border border-slate-100 bg-white shadow-sm" style={cardContainerStyle(style)} />

                    <div className="space-y-3 rounded-lg border border-admin-border bg-admin-surface p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-admin-text-secondary">Mise en forme</p>
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => setStyle(DEFAULT_STYLE)}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                                aria-label="Réinitialiser la mise en forme"
                                title="Réinitialiser la mise en forme"
                            >
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label htmlFor="qec-bg">Couleur de fond</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="qec-bg"
                                        type="color"
                                        className="h-10 w-12 px-1"
                                        value={style.bg_color || '#ffffff'}
                                        onChange={(e) => patchStyle({ bg_color: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => patchStyle({ bg_color: '' })}
                                        className="bg-admin-hover text-admin-text-secondary hover:bg-admin-hover/70"
                                    >
                                        Défaut
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qec-border-color">Couleur de bordure</Label>
                                <Input
                                    id="qec-border-color"
                                    type="color"
                                    className="h-10 w-12 px-1"
                                    value={style.border_color || '#000000'}
                                    onChange={(e) => patchStyle({ border_color: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qec-border-width">Épaisseur (px)</Label>
                                <Input
                                    id="qec-border-width"
                                    type="number"
                                    min={0}
                                    max={6}
                                    value={style.border_width}
                                    onChange={(e) => patchStyle({ border_width: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qec-radius">Rayon (px)</Label>
                                <Input
                                    id="qec-radius"
                                    type="number"
                                    min={0}
                                    max={50}
                                    placeholder="défaut"
                                    value={style.border_radius}
                                    onChange={(e) => patchStyle({ border_radius: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qec-shadow">Ombre</Label>
                                <Select id="qec-shadow" value={style.shadow} onChange={(e) => patchStyle({ shadow: e.target.value })}>
                                    {CARD_SHADOW_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
