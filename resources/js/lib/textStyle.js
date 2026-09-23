/**
 * Font choices for quick-edit text formatting. Restricted to faces already
 * loaded on every page (see resources/views/app.blade.php + app.css) instead
 * of an arbitrary Google Fonts picker, so a saved choice always renders.
 */
export const FONT_OPTIONS = [
    { value: 'sans', label: 'Standard', css: 'var(--font-sans)' },
    { value: 'script', label: 'Manuscrite', css: 'var(--font-script)' },
    { value: 'lora', label: 'Serif (Lora)', css: 'var(--font-lora)' },
    { value: 'admin-accent', label: 'Accent du site', css: 'var(--font-admin-sans)' },
];

export const TEXT_TRANSFORM_OPTIONS = [
    { value: 'none', label: 'Aucune' },
    { value: 'uppercase', label: 'MAJUSCULES' },
    { value: 'lowercase', label: 'minuscules' },
    { value: 'capitalize', label: 'Premières Lettres' },
];

export const ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'];

/**
 * Converts a saved `style` JSON blob (from site_contents.style) into a React
 * inline style object. Returns undefined for no style, so callers can spread
 * it straight onto an element without an empty style attribute.
 */
export function textStyleToCss(style) {
    if (!style) {
        return undefined;
    }

    const font = FONT_OPTIONS.find((option) => option.value === style.font);
    const decorations = [style.underline && 'underline', style.strikethrough && 'line-through'].filter(Boolean);

    return {
        fontWeight: style.bold ? 700 : undefined,
        fontStyle: style.italic ? 'italic' : undefined,
        textDecorationLine: decorations.length > 0 ? decorations.join(' ') : undefined,
        textAlign: style.align || undefined,
        fontSize: style.font_size ? `${style.font_size}px` : undefined,
        color: style.color || undefined,
        fontFamily: font?.css,
        lineHeight: style.line_height ?? undefined,
        letterSpacing: style.letter_spacing !== undefined && style.letter_spacing !== null ? `${style.letter_spacing}em` : undefined,
        textTransform: style.text_transform && style.text_transform !== 'none' ? style.text_transform : undefined,
    };
}
