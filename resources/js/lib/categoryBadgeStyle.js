/**
 * A news category's admin-picked color (news_categories.color), applied as a
 * soft 10%-alpha background with solid text — same look as the default
 * bg-isstm-navy/10 badge, just per-category instead of one color for all.
 * Falls back to undefined (the default Tailwind classes) when no color is set.
 */
export function categoryBadgeStyle(color) {
    if (!color) {
        return undefined;
    }

    return { backgroundColor: `${color}1a`, color };
}
