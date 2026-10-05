import { usePage } from '@inertiajs/react';
import EditableImage from './EditableImage';
import { imageStyleToCss } from '../../lib/imageStyle';

/**
 * Optional photo behind a page's navy title banner. Absent by default — every
 * banner keeps looking exactly as before (plain navy) until an admin uploads
 * one via the pencil.
 *
 * The overlay is a neutral black gradient, not the site's theme color: the
 * site's primary color (see SitePrimaryColorPicker.jsx) is meant to tint UI
 * chrome, never an admin's own uploaded photo — a photo should look the same
 * regardless of which of the palette's colors is active. It's also bottom-
 * only and light (0 → 55% black), just enough for the white title/subtitle to
 * stay readable, instead of the near-opaque wash this used to be, which hid
 * most of the photo behind a solid color.
 *
 * The banner's own outer `<div className="bg-isstm-navy ...">` needs
 * `relative overflow-hidden` added for this to fill it correctly, and its
 * inner content wrapper needs `relative z-10` so text sits above the photo.
 */
export default function BannerBackground({ contentKey }) {
    const { content, contentStyles } = usePage().props;
    const path = content?.[contentKey];

    return (
        <>
            {path && (
                <>
                    <img
                        src={`/${path}`}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        style={imageStyleToCss(contentStyles?.[contentKey])}
                    />
                    <div
                        className="absolute inset-0"
                        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }}
                        aria-hidden="true"
                    />
                </>
            )}
            <EditableImage contentKey={contentKey} value={path} className="absolute top-3 right-3 z-20" />
        </>
    );
}
