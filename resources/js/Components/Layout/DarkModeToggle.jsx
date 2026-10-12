import { usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useDarkMode } from '../../lib/useDarkMode';
import { useTranslations } from '../../lib/useTranslations';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { getIcon } from '../QuickEdit/icons';
import EditIconDialog from '../QuickEdit/EditIconDialog';

/**
 * The icon pencil is a sibling of the toggle <button>, not nested inside it
 * (unlike EditableIcon's usual all-in-one markup) — the toggle is already a
 * button, and a button nested inside another button is both invalid HTML and
 * would fire the dark-mode toggle every time the pencil is clicked.
 */
export default function DarkModeToggle({ className = '' }) {
    const [dark, setDark] = useDarkMode();
    const { t } = useTranslations();
    const { content } = usePage().props;
    const { canEdit, active } = useQuickEdit();
    const [dialogOpen, setDialogOpen] = useState(false);
    const label = dark ? t('theme.mode_clair', 'Mode clair') : t('theme.mode_sombre', 'Mode sombre');

    // Each state has its own independently editable icon, since the two
    // never show at the same time (see seedIcons() in HomeContentSeeder).
    const iconKey = dark ? 'header_icone_mode_clair' : 'header_icone_mode_sombre';
    const iconValue = content?.[iconKey];
    const Icon = getIcon(iconValue ?? (dark ? 'Sun' : 'Moon'));
    const editable = canEdit && active;

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onClick={() => setDark((value) => !value)}
                title={label}
                aria-label={label}
                className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 ${className}`}
            >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            {editable && (
                <>
                    <button
                        type="button"
                        onClick={() => setDialogOpen(true)}
                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                        aria-label="Changer cette icône"
                    >
                        <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                    <EditIconDialog open={dialogOpen} onClose={() => setDialogOpen(false)} contentKey={iconKey} currentValue={iconValue} />
                </>
            )}
        </span>
    );
}
