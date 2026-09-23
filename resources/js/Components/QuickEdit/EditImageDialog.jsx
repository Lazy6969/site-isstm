import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { IMAGE_FILTER_OPTIONS, IMAGE_POSITION_OPTIONS, imageStyleToCss } from '../../lib/imageStyle';

const DEFAULT_STYLE = {
    opacity: 100,
    filter: 'none',
    border_radius: 0,
    object_position: 'center',
};

const POSITION_LABELS = { center: 'Centre', top: 'Haut', bottom: 'Bas', left: 'Gauche', right: 'Droite' };

/**
 * Strips defaults so an untouched dialog submits `style: null` rather than a
 * no-op object — mirrors EditTextDialog's toStylePayload().
 */
function toStylePayload(style) {
    const payload = {};
    if (Number(style.opacity) !== DEFAULT_STYLE.opacity) payload.opacity = Number(style.opacity);
    if (style.filter !== DEFAULT_STYLE.filter) payload.filter = style.filter;
    if (Number(style.border_radius) !== DEFAULT_STYLE.border_radius) payload.border_radius = Number(style.border_radius);
    if (style.object_position !== DEFAULT_STYLE.object_position) payload.object_position = style.object_position;

    return Object.keys(payload).length > 0 ? payload : null;
}

export default function EditImageDialog({ open, onClose, contentKey, currentValue, initialStyle }) {
    const form = useForm({ key: contentKey, file: null });
    const [preview, setPreview] = useState(null);
    const [style, setStyle] = useState({ ...DEFAULT_STYLE, ...initialStyle });

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, file: null });
            form.clearErrors();
            setPreview(null);
            setStyle({ ...DEFAULT_STYLE, ...initialStyle });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function patchStyle(patch) {
        setStyle((current) => ({ ...current, ...patch }));
    }

    function onFileChange(e) {
        const file = e.target.files?.[0] ?? null;
        form.setData('file', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, style: toStylePayload(style) }));
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Modifier l'image</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <img
                        src={preview ?? `/${currentValue}`}
                        alt=""
                        className="h-40 w-full border border-admin-border object-cover"
                        style={imageStyleToCss(style)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                    />
                    {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}

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

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="space-y-1">
                                <Label htmlFor="qei-opacity">Opacité ({style.opacity}%)</Label>
                                <input
                                    id="qei-opacity"
                                    type="range"
                                    min={10}
                                    max={100}
                                    value={style.opacity}
                                    onChange={(e) => patchStyle({ opacity: e.target.value })}
                                    className="h-10 w-full accent-admin-text"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qei-radius">Arrondi ({style.border_radius}px)</Label>
                                <input
                                    id="qei-radius"
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={style.border_radius}
                                    onChange={(e) => patchStyle({ border_radius: e.target.value })}
                                    className="h-10 w-full accent-admin-text"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qei-filter">Effet</Label>
                                <Select id="qei-filter" value={style.filter} onChange={(e) => patchStyle({ filter: e.target.value })}>
                                    {IMAGE_FILTER_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qei-position">Position</Label>
                                <Select
                                    id="qei-position"
                                    value={style.object_position}
                                    onChange={(e) => patchStyle({ object_position: e.target.value })}
                                >
                                    {IMAGE_POSITION_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {POSITION_LABELS[option]}
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
