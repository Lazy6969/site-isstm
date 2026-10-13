import { usePage } from '@inertiajs/react';

export const TITLE_UNDERLINE_STYLES = [
    { value: 'dash', label: 'Trait fin' },
    { value: 'bar', label: 'Barre' },
];

/**
 * The decorative stroke under a section title (see "Nos filières",
 * "Paroles d'étudiants") — gold by default, but both its color and style are
 * a single site-wide choice away via the "Couleur" pencil's own
 * "Soulignement des titres" section.
 *
 * 'dash' is a short, thin, centered rule sitting a little below the title.
 * 'bar' is a wider, thicker stroke that sits right against the title's own
 * baseline, closer to a highlighter mark.
 */
export default function TitleUnderline({ className = '' }) {
    const { titleUnderlineColor, titleUnderlineStyle } = usePage().props;
    const color = titleUnderlineColor || '#d4a017';
    const style = titleUnderlineStyle === 'bar' ? 'bar' : 'dash';

    const sizeClass = style === 'bar' ? 'mt-1 h-2 w-20 sm:h-2.5 sm:w-24' : 'mt-3 h-1 w-14';

    return <span className={`block rounded-full ${sizeClass} ${className}`} style={{ backgroundColor: color }} aria-hidden="true" />;
}
