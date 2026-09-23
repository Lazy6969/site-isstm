export const BUTTON_SHADOW_OPTIONS = [
    { value: 'none', label: 'Aucune', css: undefined },
    { value: 'sm', label: 'Légère', css: '0 1px 2px rgba(0,0,0,0.08)' },
    { value: 'md', label: 'Moyenne', css: '0 4px 12px rgba(0,0,0,0.15)' },
    { value: 'lg', label: 'Marquée', css: '0 8px 24px rgba(0,0,0,0.2)' },
];

export const BUTTON_SIZE_OPTIONS = [
    { value: 'sm', label: 'Compact', padding: '0.5rem 1rem', fontSize: '0.8125rem' },
    { value: 'md', label: 'Standard (défaut)', padding: undefined, fontSize: undefined },
    { value: 'lg', label: 'Grand', padding: '1rem 2rem', fontSize: '1rem' },
];

/**
 * Container CSS for an EditableButton. `hovered` lets the caller light up
 * bg_color_hover — inline styles can't express a :hover selector, so the
 * component tracks hover state itself and re-derives this on mouse events.
 */
export function buttonContainerStyle(style, { hovered = false } = {}) {
    if (!style) {
        return undefined;
    }

    const shadow = BUTTON_SHADOW_OPTIONS.find((option) => option.value === style.shadow);
    const size = BUTTON_SIZE_OPTIONS.find((option) => option.value === style.size);
    const background = hovered && style.bg_color_hover ? style.bg_color_hover : style.bg_color;

    return {
        backgroundColor: background || undefined,
        borderRadius: style.border_radius !== undefined && style.border_radius !== null ? `${style.border_radius}px` : undefined,
        borderWidth: style.border_width ? `${style.border_width}px` : undefined,
        borderStyle: style.border_width ? 'solid' : undefined,
        borderColor: style.border_color || undefined,
        boxShadow: shadow?.css,
        padding: size?.padding,
        fontSize: size?.fontSize,
    };
}
