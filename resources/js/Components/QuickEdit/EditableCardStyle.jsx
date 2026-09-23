import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { PaintBucket } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import EditCardStyleDialog from './EditCardStyleDialog';

/**
 * One pencil per card grid (filières, actualités, bourse, équipe) — styling
 * applies to every card in that section at once (see cardContainerStyle,
 * lib/cardStyle.js), so the pencil sits next to the section heading rather
 * than on each individual card.
 */
export default function EditableCardStyle({ contentKey, className = '' }) {
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
                aria-label="Modifier le style des cartes"
                title="Modifier le style des cartes"
            >
                <PaintBucket className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <EditCardStyleDialog
                open={open}
                onClose={() => setOpen(false)}
                contentKey={contentKey}
                initialStyle={contentStyles?.[contentKey]}
            />
        </>
    );
}
