import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { getIcon } from './icons';
import EditIconDialog from './EditIconDialog';

/**
 * Same idea as EditableText, but for a SiteContent row storing an icon name
 * (see App\SiteIcon). Renders the chosen Lucide icon either way — the pencil
 * only appears in quick edit mode, for users with quick-edit.icon.
 */
export default function EditableIcon({ contentKey, value, className }) {
    const { canEdit, active } = useQuickEdit();
    const [open, setOpen] = useState(false);
    const Icon = getIcon(value);

    if (!canEdit || !active) {
        return <Icon className={className} aria-hidden="true" />;
    }

    return (
        <span className="relative inline-flex">
            <Icon className={className} aria-hidden="true" />
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                aria-label="Changer cette icône"
            >
                <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
            <EditIconDialog open={open} onClose={() => setOpen(false)} contentKey={contentKey} currentValue={value} />
        </span>
    );
}
