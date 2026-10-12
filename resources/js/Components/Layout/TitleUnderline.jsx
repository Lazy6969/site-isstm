import { usePage } from '@inertiajs/react';

/**
 * The short decorative dash under a section title (see "Nos filières",
 * "Paroles d'étudiants") — gold by default, but a single site-wide color
 * change away via the "Couleur" pencil's own "Soulignement des titres"
 * section, same as the abstract wave background.
 */
export default function TitleUnderline({ className = '' }) {
    const { titleUnderlineColor } = usePage().props;
    const color = titleUnderlineColor || '#d4a017';

    return <span className={`mt-3 block h-1 w-14 rounded-full ${className}`} style={{ backgroundColor: color }} aria-hidden="true" />;
}
