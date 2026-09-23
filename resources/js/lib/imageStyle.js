export const IMAGE_FILTER_OPTIONS = [
    { value: 'none', label: 'Aucun', css: undefined },
    { value: 'grayscale', label: 'Noir et blanc', css: 'grayscale(1)' },
    { value: 'sepia', label: 'Sépia', css: 'sepia(0.6)' },
    { value: 'blur', label: 'Flou léger', css: 'blur(2px)' },
    { value: 'contrast', label: 'Contraste', css: 'contrast(1.25)' },
    { value: 'vivid', label: 'Éclatant', css: 'saturate(1.6)' },
];

export const IMAGE_POSITION_OPTIONS = ['center', 'top', 'bottom', 'left', 'right'];

function commonProps(style, { includeOpacity = true } = {}) {
    const filter = IMAGE_FILTER_OPTIONS.find((option) => option.value === style.filter);

    return {
        opacity: includeOpacity && style.opacity !== undefined && style.opacity !== null ? style.opacity / 100 : undefined,
        filter: filter?.css,
        borderRadius: style.border_radius ? `${style.border_radius}px` : undefined,
    };
}

/** For an <img> element — position controls its object-position (paired with object-cover/contain). */
export function imageStyleToCss(style, options) {
    if (!style) {
        return undefined;
    }

    return {
        ...commonProps(style, options),
        objectPosition: style.object_position && style.object_position !== 'center' ? style.object_position : undefined,
    };
}

/**
 * For a CSS background-image div — same opacity/filter/radius, but
 * background-position instead. Pass { includeOpacity: false } when the
 * element already uses inline/class opacity for something structural (a
 * crossfade carousel's active/inactive state), so the two don't fight.
 */
export function imageStyleToBackgroundCss(style, options) {
    if (!style) {
        return undefined;
    }

    return {
        ...commonProps(style, options),
        backgroundPosition: style.object_position && style.object_position !== 'center' ? style.object_position : undefined,
    };
}
