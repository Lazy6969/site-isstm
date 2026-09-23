import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { buttonContainerStyle } from '../../lib/buttonStyle';
import EditButtonDialog from './EditButtonDialog';

/**
 * A CTA button whose label AND container styling (background, hover, border,
 * radius, shadow, size) are both editable from one combined pencil — unlike
 * EditableText/EditableImage, this component owns the actual <Link>/<a> markup
 * itself, since the style applies to the container, not just a sibling.
 * `href` isn't editable here (link/target stay a later phase, see plan).
 */
export default function EditableButton({ contentKey, href, defaultLabel, className, icon: Icon, external = false }) {
    const { canEdit, active } = useQuickEdit();
    const { content, contentStyles } = usePage().props;
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);

    const label = content[contentKey] ?? defaultLabel;
    const style = contentStyles?.[contentKey];
    const containerStyle = buttonContainerStyle(style, { hovered });

    const body = (
        <>
            {label}
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
        </>
    );

    const commonProps = {
        className,
        style: containerStyle,
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
    };

    const button = external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
            {body}
        </a>
    ) : (
        <Link href={href} {...commonProps}>
            {body}
        </Link>
    );

    if (!canEdit || !active) {
        return button;
    }

    return (
        <span className="relative inline-flex">
            {button}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                aria-label="Modifier ce bouton"
            >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <EditButtonDialog
                open={open}
                onClose={() => setOpen(false)}
                contentKey={contentKey}
                initialValue={label}
                initialStyle={style}
            />
        </span>
    );
}
