import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import EditVideoDialog from './EditVideoDialog';

/**
 * A floating pencil for a "video"-type SiteContent row — same sibling
 * pattern as EditableImage (the container needs `relative`), since video
 * markup also varies too much across the site to wrap it directly.
 */
export default function EditableVideo({ contentKey, value, className = 'absolute right-3 top-3 z-10' }) {
    const { canEdit, active } = useQuickEdit();
    const [open, setOpen] = useState(false);

    if (!canEdit || !active) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`${className} flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110`}
                aria-label="Modifier cette vidéo"
            >
                <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <EditVideoDialog open={open} onClose={() => setOpen(false)} contentKey={contentKey} currentValue={value} />
        </>
    );
}
