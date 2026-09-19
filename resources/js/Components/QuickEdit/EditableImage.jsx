import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import EditImageDialog from './EditImageDialog';

/**
 * A floating pencil button for an "image"-type SiteContent row — render it as
 * a sibling inside whatever container already holds the <img> (or
 * background-image div), positioned with `className` (the container needs
 * `relative` — image markup varies too much across the site for this to also
 * wrap the image itself, unlike EditableText/EditableIcon).
 */
export default function EditableImage({ contentKey, value, className = 'absolute right-3 top-3 z-10' }) {
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
                aria-label="Modifier cette image"
            >
                <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <EditImageDialog open={open} onClose={() => setOpen(false)} contentKey={contentKey} currentValue={value} />
        </>
    );
}
