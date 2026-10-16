/**
 * lucide-react dropped brand/logo glyphs, so the real Facebook "f" mark is
 * hand-drawn here rather than pulled from an icon package — kept as its own
 * component so it drops into any `icon:`/`<Icon />` slot built for lucide
 * icons (same `className`/`aria-hidden` props, `fill="currentColor"` so it
 * inherits color like the rest of that set).
 */
export default function FacebookIcon({ className = '', ...props }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.99-.088.677h-3.445v8.345C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
    );
}
