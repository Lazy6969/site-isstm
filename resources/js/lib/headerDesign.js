/**
 * 5 safe, bar-level visual variants for the site header (Header.jsx on the
 * homepage, SiteHeader.jsx on every inner page), driven by the shared
 * `header_design` content key — layered on top of the existing structure
 * without ever touching nav items, dropdowns, search, dark mode, the
 * language switcher or the mobile tab bar, which stay byte-identical across
 * every design. Each helper only ever adds classes that don't already exist
 * on the element elsewhere (no background-color here, since Header.jsx's own
 * transparent/scrolled toggle already owns that and two conflicting
 * Tailwind background utilities don't compose predictably).
 */

export function headerBorderClass(design) {
    return design === '2' ? 'border-b-2 border-isstm-gold' : '';
}

export function headerShowsTopAccent(design) {
    return design === '3';
}

export function headerPaddingClass(design) {
    return design === '4' ? 'py-2' : 'py-3';
}

export function headerLogoSizeClass(design) {
    return design === '4' ? 'h-9' : 'h-11 sm:h-12';
}

export function headerBrandDividerClass(design) {
    return design === '5' ? 'border-r border-white/25 pr-3.5 sm:pr-5' : '';
}
