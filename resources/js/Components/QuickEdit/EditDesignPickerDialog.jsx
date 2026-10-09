import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

export default function EditDesignPickerDialog({ open, onClose, contentKey, title, description, designs, design }) {
    const form = useForm({ key: contentKey, value: title });
    const [selected, setSelected] = useState(design);

    useEffect(() => {
        if (open) {
            form.setData({ key: contentKey, value: title });
            form.clearErrors();
            setSelected(design);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function submit(e) {
        e.preventDefault();
        form.transform((data) => ({ ...data, style: { design: selected } }));
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
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <p className="text-sm text-admin-text-secondary">{description}</p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {designs.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setSelected(item.value)}
                                className={`relative overflow-hidden rounded-xl border-2 bg-slate-100 p-1 text-left transition ${
                                    selected === item.value ? 'border-admin-accent' : 'border-transparent hover:border-admin-border'
                                }`}
                            >
                                <div className="h-16 w-full overflow-hidden rounded-lg bg-white">
                                    <item.Thumbnail />
                                </div>
                                <div className="mt-1.5 flex items-center justify-between px-1 pb-0.5">
                                    <span className="text-xs font-medium text-admin-text">{item.label}</span>
                                    {selected === item.value && <Check className="h-3.5 w-3.5 text-admin-accent" aria-hidden="true" />}
                                </div>
                            </button>
                        ))}
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
