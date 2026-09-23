import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { textStyleToCss } from '../../lib/textStyle';
import EditTextDialog from './EditTextDialog';

/**
 * Wraps a piece of site content (from the `content` shared prop, keyed by
 * SiteContent.content_key) so a super admin can edit it in place while quick
 * edit mode is on. Renders exactly `children` for everyone else — visitors
 * never see a pencil, and the edit itself is re-checked server-side regardless.
 */
export default function EditableText({ contentKey, as: Tag = 'span', className, children }) {
    const { canEdit, active } = useQuickEdit();
    const { contentStyles } = usePage().props;
    const [open, setOpen] = useState(false);
    const style = contentStyles?.[contentKey];
    const inlineStyle = textStyleToCss(style);

    if (!canEdit || !active) {
        return (
            <Tag className={className} style={inlineStyle}>
                {children}
            </Tag>
        );
    }

    return (
        <>
            <Tag className={className} style={inlineStyle}>
                {children}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="ml-2 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 align-middle text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                    aria-label="Modifier ce contenu"
                >
                    <Pencil className="h-3 w-3" aria-hidden="true" />
                </button>
            </Tag>
            <EditTextDialog
                open={open}
                onClose={() => setOpen(false)}
                contentKey={contentKey}
                initialValue={typeof children === 'string' ? children : ''}
                initialStyle={style}
            />
        </>
    );
}
