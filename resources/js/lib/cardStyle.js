/**
 * Reuses the same style.bg_color/border_color/border_width/border_radius/shadow
 * fields already whitelisted server-side for buttons (UpdateQuickEditContentRequest) —
 * a card is just another container, so no new backend validation was needed.
 */
export const CARD_SHADOW_OPTIONS = [
    { value: '', label: 'Défaut', css: undefined },
    { value: 'none', label: 'Aucune', css: 'none' },
    { value: 'sm', label: 'Légère', css: '0 1px 2px rgba(0,0,0,0.08)' },
    { value: 'md', label: 'Moyenne', css: '0 4px 12px rgba(0,0,0,0.15)' },
    { value: 'lg', label: 'Marquée', css: '0 12px 32px rgba(0,0,0,0.18)' },
];

/** Applies to a card's own container — one style shared by every card in that grid. */
export function cardContainerStyle(style) {
    if (!style) {
        return undefined;
    }

    const shadow = CARD_SHADOW_OPTIONS.find((option) => option.value === style.shadow);

    return {
        backgroundColor: style.bg_color || undefined,
        borderColor: style.border_color || undefined,
        borderWidth: style.border_width ? `${style.border_width}px` : undefined,
        borderStyle: style.border_width ? 'solid' : undefined,
        borderRadius: style.border_radius !== undefined && style.border_radius !== null ? `${style.border_radius}px` : undefined,
        boxShadow: shadow?.css,
    };
}
