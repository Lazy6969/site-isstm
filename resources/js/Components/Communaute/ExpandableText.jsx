import { useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

const TRUNCATE_LENGTH = 300;

/**
 * Post/comment body text — long text (> TRUNCATE_LENGTH) is clipped with a
 * "Voir plus" toggle instead of stretching the card indefinitely.
 */
export default function ExpandableText({ text, className }) {
    const { t } = useTranslations();
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > TRUNCATE_LENGTH;
    const shown = expanded || !isLong ? text : `${text.slice(0, TRUNCATE_LENGTH).trimEnd()}…`;

    return (
        <p className={className}>
            {shown}
            {isLong && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="ml-1 font-semibold text-isstm-navy hover:underline dark:text-white"
                >
                    {expanded ? t('communaute.voir_moins', 'Voir moins') : t('communaute.voir_plus', 'Voir plus')}
                </button>
            )}
        </p>
    );
}
