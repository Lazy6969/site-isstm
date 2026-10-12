/** Tiny CSS mockups for the header design-picker dialog — shared by
 * Header.jsx (homepage) and SiteHeader.jsx (inner pages), since both read
 * the same `header_design` content key. */

function ClassicThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-isstm-navy p-2">
            <span className="h-4 w-4 flex-shrink-0 rounded-full bg-isstm-gold" />
            <span className="h-4 w-px bg-white/30" />
            <div className="flex-1 space-y-1">
                <span className="block h-1 w-3/4 rounded-full bg-white/70" />
            </div>
            <div className="flex gap-1">
                <span className="h-1 w-3 rounded-full bg-white/40" />
                <span className="h-1 w-3 rounded-full bg-white/40" />
            </div>
        </div>
    );
}

function GoldBorderThumbnail() {
    return (
        <div className="flex h-full w-full flex-col justify-end bg-isstm-navy p-2">
            <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 flex-shrink-0 rounded-full bg-isstm-gold" />
                <span className="block h-1 w-1/2 rounded-full bg-white/70" />
            </div>
            <span className="mt-1.5 block h-[3px] w-full rounded-full bg-isstm-gold" />
        </div>
    );
}

function TopAccentThumbnail() {
    return (
        <div className="flex h-full w-full flex-col bg-isstm-navy">
            <span className="block h-[3px] w-full bg-isstm-gold" />
            <div className="flex flex-1 items-center gap-1.5 p-2">
                <span className="h-4 w-4 flex-shrink-0 rounded-full bg-isstm-gold" />
                <span className="block h-1 w-1/2 rounded-full bg-white/70" />
            </div>
        </div>
    );
}

function CompactThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1 bg-isstm-navy px-2 py-3">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-isstm-gold" />
            <span className="block h-0.5 w-1/2 rounded-full bg-white/70" />
        </div>
    );
}

function DividersThumbnail() {
    return (
        <div className="flex h-full w-full items-center gap-1.5 bg-isstm-navy p-2">
            <span className="h-4 w-4 flex-shrink-0 rounded-full bg-isstm-gold" />
            <span className="block h-1 w-1/4 rounded-full bg-white/70" />
            <span className="h-4 w-px bg-white/30" />
            <span className="block h-1 flex-1 rounded-full bg-white/40" />
            <span className="h-4 w-px bg-white/30" />
            <span className="block h-1 w-1/6 rounded-full bg-white/40" />
        </div>
    );
}

export const HEADER_DESIGN_OPTIONS = [
    { value: '1', label: 'Classique', Thumbnail: ClassicThumbnail },
    { value: '2', label: 'Bordure dorée', Thumbnail: GoldBorderThumbnail },
    { value: '3', label: 'Liseré supérieur', Thumbnail: TopAccentThumbnail },
    { value: '4', label: 'Compact', Thumbnail: CompactThumbnail },
    { value: '5', label: 'Séparateurs', Thumbnail: DividersThumbnail },
];
