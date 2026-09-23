import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, RotateCcw, Strikethrough, Underline } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { ALIGN_OPTIONS, FONT_OPTIONS, TEXT_TRANSFORM_OPTIONS } from '../../lib/textStyle';

const DEFAULT_STYLE = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: 'left',
    font_size: '',
    color: '',
    font: 'sans',
    line_height: '',
    letter_spacing: '',
    text_transform: 'none',
};

const ALIGN_ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify };

/**
 * Strips defaults so only the fields the admin actually changed are sent —
 * an untouched dialog submits `style: null` rather than a no-op object, and
 * contentStyles (see HandleInertiaRequests) only lists content that's really
 * been formatted.
 */
function toStylePayload(style) {
    const payload = {};
    if (style.bold) payload.bold = true;
    if (style.italic) payload.italic = true;
    if (style.underline) payload.underline = true;
    if (style.strikethrough) payload.strikethrough = true;
    if (style.align !== DEFAULT_STYLE.align) payload.align = style.align;
    if (style.font_size !== '') payload.font_size = Number(style.font_size);
    if (style.color !== '') payload.color = style.color;
    if (style.font !== DEFAULT_STYLE.font) payload.font = style.font;
    if (style.line_height !== '') payload.line_height = Number(style.line_height);
    if (style.letter_spacing !== '') payload.letter_spacing = Number(style.letter_spacing);
    if (style.text_transform !== DEFAULT_STYLE.text_transform) payload.text_transform = style.text_transform;

    return Object.keys(payload).length > 0 ? payload : null;
}

function toggleButtonClass(active) {
    return active ? 'bg-admin-text text-admin-bg' : 'bg-admin-hover text-admin-text hover:bg-admin-hover/70';
}

export default function EditTextDialog({ open, onClose, contentKey, initialValue, initialStyle }) {
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
                    <DialogTitle>Modifier ce contenu</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <Textarea
                        value={form.data.value}
                        onChange={(e) => form.setData('value', e.target.value)}
                        rows={5}
                        autoFocus
                    />
                    {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}

                    <div className="space-y-3 rounded-lg border border-admin-border bg-admin-surface p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => patchStyle({ bold: !style.bold })}
                                className={toggleButtonClass(style.bold)}
                                aria-pressed={style.bold}
                                aria-label="Gras"
                            >
                                <Bold className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => patchStyle({ italic: !style.italic })}
                                className={toggleButtonClass(style.italic)}
                                aria-pressed={style.italic}
                                aria-label="Italique"
                            >
                                <Italic className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => patchStyle({ underline: !style.underline })}
                                className={toggleButtonClass(style.underline)}
                                aria-pressed={style.underline}
                                aria-label="Souligné"
                            >
                                <Underline className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                onClick={() => patchStyle({ strikethrough: !style.strikethrough })}
                                className={toggleButtonClass(style.strikethrough)}
                                aria-pressed={style.strikethrough}
                                aria-label="Barré"
                            >
                                <Strikethrough className="h-4 w-4" aria-hidden="true" />
                            </Button>

                            <span className="mx-1 h-6 w-px bg-admin-border" aria-hidden="true" />

                            {ALIGN_OPTIONS.map((option) => {
                                const Icon = ALIGN_ICONS[option];
                                return (
                                    <Button
                                        key={option}
                                        type="button"
                                        size="icon"
                                        onClick={() => patchStyle({ align: option })}
                                        className={toggleButtonClass(style.align === option)}
                                        aria-pressed={style.align === option}
                                        aria-label={`Alignement ${option}`}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                );
                            })}

                            <Button
                                type="button"
                                size="icon"
                                onClick={() => setStyle(DEFAULT_STYLE)}
                                className="ml-auto bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                                aria-label="Réinitialiser la mise en forme"
                                title="Réinitialiser la mise en forme"
                            >
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label htmlFor="qe-font">Police</Label>
                                <Select id="qe-font" value={style.font} onChange={(e) => patchStyle({ font: e.target.value })}>
                                    {FONT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qe-font-size">Taille (px)</Label>
                                <Input
                                    id="qe-font-size"
                                    type="number"
                                    min={10}
                                    max={96}
                                    placeholder="défaut"
                                    value={style.font_size}
                                    onChange={(e) => patchStyle({ font_size: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qe-color">Couleur</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="qe-color"
                                        type="color"
                                        className="h-10 w-12 px-1"
                                        value={style.color || '#000000'}
                                        onChange={(e) => patchStyle({ color: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => patchStyle({ color: '' })}
                                        className="bg-admin-hover text-admin-text-secondary hover:bg-admin-hover/70"
                                    >
                                        Défaut
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qe-line-height">Interligne</Label>
                                <Input
                                    id="qe-line-height"
                                    type="number"
                                    step={0.1}
                                    min={1}
                                    max={3}
                                    placeholder="défaut"
                                    value={style.line_height}
                                    onChange={(e) => patchStyle({ line_height: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qe-letter-spacing">Espacement (em)</Label>
                                <Input
                                    id="qe-letter-spacing"
                                    type="number"
                                    step={0.01}
                                    min={-0.05}
                                    max={0.5}
                                    placeholder="défaut"
                                    value={style.letter_spacing}
                                    onChange={(e) => patchStyle({ letter_spacing: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qe-text-transform">Transformation</Label>
                                <Select
                                    id="qe-text-transform"
                                    value={style.text_transform}
                                    onChange={(e) => patchStyle({ text_transform: e.target.value })}
                                >
                                    {TEXT_TRANSFORM_OPTIONS.map((option) => (
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
