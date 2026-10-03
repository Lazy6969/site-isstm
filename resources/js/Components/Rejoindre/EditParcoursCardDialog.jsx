import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { ICONS, getIcon } from '../QuickEdit/icons';

const BLUR_OPTIONS = [
    { value: 'none', label: 'Aucun' },
    { value: 'sm', label: 'Léger' },
    { value: 'md', label: 'Moyen' },
    { value: 'lg', label: 'Fort' },
    { value: 'xl', label: 'Très fort' },
];

const DEFAULT_STYLE = { icon: '', blur: 'md' };

/**
 * Edits one "Rejoindre" hero card — text, icon and the blur intensity of its
 * frosted-glass background. Position/size are fixed (see HeroParcoursCards.jsx),
 * not editable here.
 */
export default function EditParcoursCardDialog({ open, onClose, contentKey, initialLabel, initialStyle, defaultIcon }) {
    const form = useForm({ key: contentKey, value: initialLabel, style: {} });
    const [style, setStyle] = useState({ ...DEFAULT_STYLE, icon: defaultIcon, ...initialStyle });

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, value: initialLabel, style: {} });
            form.clearErrors();
            setStyle({ ...DEFAULT_STYLE, icon: defaultIcon, ...initialStyle });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function patchStyle(patch) {
        setStyle((current) => ({ ...current, ...patch }));
    }

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, style }));
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: onClose,
        });
    }

    const PreviewIcon = getIcon(style.icon || defaultIcon);

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Modifier cette carte</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="epc-value">Texte</Label>
                        <Input id="epc-value" value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} autoFocus />
                        {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label>Logo</Label>
                        <div className="grid grid-cols-8 gap-1.5 rounded-lg border border-admin-border p-2">
                            {Object.keys(ICONS).map((name) => {
                                const Icon = ICONS[name];
                                const selected = (style.icon || defaultIcon) === name;
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => patchStyle({ icon: name })}
                                        title={name}
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                            selected
                                                ? 'border-admin-accent bg-admin-accent/10 text-admin-accent'
                                                : 'border-transparent text-admin-text-secondary hover:bg-admin-hover'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="epc-blur">Flou du fond</Label>
                            <Select id="epc-blur" value={style.blur} onChange={(e) => patchStyle({ blur: e.target.value })}>
                                {BLUR_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex items-end justify-center rounded-lg border border-admin-border bg-admin-surface p-2">
                            <div
                                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-white/40 text-white"
                                style={{ backgroundColor: '#003366', backdropFilter: `blur(${{ none: 0, sm: 4, md: 10, lg: 18, xl: 28 }[style.blur]}px)` }}
                            >
                                <PreviewIcon className="h-4 w-4" aria-hidden="true" />
                                <span className="text-xs">Aperçu</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
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
