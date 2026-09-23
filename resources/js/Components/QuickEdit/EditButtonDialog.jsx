import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { BUTTON_SHADOW_OPTIONS, BUTTON_SIZE_OPTIONS, buttonContainerStyle } from '../../lib/buttonStyle';

const DEFAULT_STYLE = {
    bg_color: '',
    bg_color_hover: '',
    border_color: '',
    border_width: 0,
    border_radius: '',
    shadow: 'none',
    size: 'md',
};

function toStylePayload(style) {
    const payload = {};
    if (style.bg_color !== '') payload.bg_color = style.bg_color;
    if (style.bg_color_hover !== '') payload.bg_color_hover = style.bg_color_hover;
    if (style.border_color !== '') payload.border_color = style.border_color;
    if (Number(style.border_width) !== 0) payload.border_width = Number(style.border_width);
    if (style.border_radius !== '') payload.border_radius = Number(style.border_radius);
    if (style.shadow !== DEFAULT_STYLE.shadow) payload.shadow = style.shadow;
    if (style.size !== DEFAULT_STYLE.size) payload.size = style.size;

    return Object.keys(payload).length > 0 ? payload : null;
}

export default function EditButtonDialog({ open, onClose, contentKey, initialValue, initialStyle }) {
    const form = useForm({ key: contentKey, value: initialValue });
    const [style, setStyle] = useState({ ...DEFAULT_STYLE, ...initialStyle });

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, value: initialValue });
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
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Modifier ce bouton</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="qeb-value">Texte</Label>
                        <Input id="qeb-value" value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} autoFocus />
                        {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                    </div>

                    <div
                        className="flex items-center justify-center rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition"
                        style={buttonContainerStyle(style)}
                    >
                        {form.data.value || 'Aperçu'}
                    </div>

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
                                <Label htmlFor="qeb-bg">Couleur de fond</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="qeb-bg"
                                        type="color"
                                        className="h-10 w-12 px-1"
                                        value={style.bg_color || '#003366'}
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
                                <Label htmlFor="qeb-bg-hover">Couleur au survol</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="qeb-bg-hover"
                                        type="color"
                                        className="h-10 w-12 px-1"
                                        value={style.bg_color_hover || '#003366'}
                                        onChange={(e) => patchStyle({ bg_color_hover: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => patchStyle({ bg_color_hover: '' })}
                                        className="bg-admin-hover text-admin-text-secondary hover:bg-admin-hover/70"
                                    >
                                        Défaut
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qeb-size">Taille</Label>
                                <Select id="qeb-size" value={style.size} onChange={(e) => patchStyle({ size: e.target.value })}>
                                    {BUTTON_SIZE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qeb-border-color">Couleur de bordure</Label>
                                <Input
                                    id="qeb-border-color"
                                    type="color"
                                    className="h-10 w-12 px-1"
                                    value={style.border_color || '#000000'}
                                    onChange={(e) => patchStyle({ border_color: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qeb-border-width">Épaisseur bordure (px)</Label>
                                <Input
                                    id="qeb-border-width"
                                    type="number"
                                    min={0}
                                    max={6}
                                    value={style.border_width}
                                    onChange={(e) => patchStyle({ border_width: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qeb-radius">Rayon (px)</Label>
                                <Input
                                    id="qeb-radius"
                                    type="number"
                                    min={0}
                                    max={50}
                                    placeholder="défaut"
                                    value={style.border_radius}
                                    onChange={(e) => patchStyle({ border_radius: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qeb-shadow">Ombre</Label>
                                <Select id="qeb-shadow" value={style.shadow} onChange={(e) => patchStyle({ shadow: e.target.value })}>
                                    {BUTTON_SHADOW_OPTIONS.map((option) => (
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
