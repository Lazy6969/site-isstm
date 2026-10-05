import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';

/**
 * A pencil button that lives OUTSIDE the content it edits, for two cases
 * EditableText can't handle on its own: a value nested inside a clickable
 * <a> (an interactive element can't contain another one — see ContactCards),
 * or a value with no text of its own to attach a pencil to (a GPS
 * coordinate pair — see ContactMaps). Renders nothing outside quick-edit
 * mode. The caller supplies which dialog opens (EditTextDialog for styled
 * text, EditLinkDialog for a plain shared value) and its props.
 */
export default function ExternalPencil({ className, label = 'Modifier cette information', dialog: Dialog, dialogProps }) {
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
                className={
                    className ??
                    'absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110'
                }
                aria-label={label}
            >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <Dialog open={open} onClose={() => setOpen(false)} {...dialogProps} />
        </>
    );
}
