import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ICONS } from './icons';

export default function EditIconDialog({ open, onClose, contentKey, currentValue }) {
    const form = useForm({ key: contentKey, value: currentValue });

    function pick(name) {
        form.setData('value', name);
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choisir une icône</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-6 gap-2">
                    {Object.entries(ICONS).map(([name, Icon]) => {
                        const selected = name === form.data.value;
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => pick(name)}
                                disabled={form.processing}
                                title={name}
                                className={`flex h-12 w-12 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                                    selected
                                        ? 'border-admin-text bg-admin-hover text-admin-text'
                                        : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                }`}
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        );
                    })}
                </div>
                {form.errors.value && <p className="mt-3 text-sm text-red-500">{form.errors.value}</p>}
            </DialogContent>
        </Dialog>
    );
}
