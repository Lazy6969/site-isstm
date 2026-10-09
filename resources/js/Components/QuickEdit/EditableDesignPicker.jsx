import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { LayoutTemplate } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import EditDesignPickerDialog from './EditDesignPickerDialog';

/**
 * One pencil for an entire section (stats, mission & vision, ...) whose
 * `style.design` picks which of several layouts to render — like
 * EditableCardStyle, the choice applies to the whole section at once, so
 * this sits on the section itself rather than on an individual item.
 * `designs` is an array of { value, label, Thumbnail } describing the
 * choices offered in the dialog.
 */
export default function EditableDesignPicker({ contentKey, title, description, designs, className = '' }) {
    const { canEdit, active } = useQuickEdit();
    const { contentStyles } = usePage().props;
    const [open, setOpen] = useState(false);

    if (!canEdit || !active) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110 ${className}`}
                aria-label={title}
                title={title}
            >
                <LayoutTemplate className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <EditDesignPickerDialog
                open={open}
                onClose={() => setOpen(false)}
                contentKey={contentKey}
                title={title}
                description={description}
                designs={designs}
                design={contentStyles?.[contentKey]?.design ?? '1'}
            />
        </>
    );
}
