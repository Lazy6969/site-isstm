import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Full-screen image viewer for a post's photos, opened by clicking any image
 * tile in MediaGrid (see PostCard.jsx) — single photo, small grid, or the
 * "+N" overflow tile of a larger album all open the same viewer, letting a
 * visitor browse every photo past what the grid shows. Mirrors
 * Galerie/Show.jsx's lightbox (prev/next/download/close, arrow-key + Escape
 * support).
 */
export default function PostMediaLightbox({ images, index, onClose, onNavigate }) {
    const current = images[index];

    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length);
            if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length);
            if (e.key === 'Escape') onClose();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [index, images.length, onNavigate, onClose]);

    if (!current) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6" onClick={onClose}>
            <img src={`/storage/${current.path}`} alt="" className="max-h-[80vh] max-w-full rounded-lg object-contain" />

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate((index - 1 + images.length) % images.length);
                        }}
                        aria-label="Image précédente"
                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                    >
                        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate((index + 1) % images.length);
                        }}
                        aria-label="Image suivante"
                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                    >
                        <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <p className="absolute bottom-6 text-sm text-white/70">
                        {index + 1} / {images.length}
                    </p>
                </>
            )}

            <div className="absolute right-6 top-6 flex items-center gap-2">
                <a
                    href={`/storage/${current.path}`}
                    download
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Télécharger"
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Télécharger
                </a>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Fermer
                </button>
            </div>
        </div>
    );
}
