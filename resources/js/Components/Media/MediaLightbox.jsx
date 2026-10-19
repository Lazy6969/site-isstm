import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Full-screen image viewer — opened by clicking a photo in the fil
 * communautaire (MediaGrid, see PostCard.jsx) or an image attached to a chat
 * message (AttachmentPreview.jsx, Messages/Index.jsx), so neither context
 * forces the browser's own download-on-click behavior just to look at a
 * picture up close. `images` takes any array of `{ path }` objects; a
 * single-image call (messages) passes a one-item array and no next/previous
 * controls render.
 *
 * Rendered through a portal to document.body: left in place, a post Card's
 * own `:hover { transform: … }` (see app.css, .community-shell rounded-2xl
 * cards) would make this `fixed` overlay a descendant of a transformed
 * ancestor — CSS then scopes `position: fixed` to that ancestor's box
 * instead of the viewport, and the "full-screen" lightbox would only ever
 * cover the card it was opened from.
 */
export default function MediaLightbox({ images, index, onClose, onNavigate, downloadName }) {
    const { t } = useTranslations();
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

    return createPortal(
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90" onClick={onClose}>
            <img src={`/storage/${current.path}`} alt="" className="max-h-screen max-w-screen object-contain" />

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate((index - 1 + images.length) % images.length);
                        }}
                        aria-label={t('media.image_precedente', 'Image précédente')}
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
                        aria-label={t('media.image_suivante', 'Image suivante')}
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
                    download={downloadName ?? current.original_name ?? true}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('media.telecharger', 'Télécharger')}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('media.telecharger', 'Télécharger')}
                </a>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('media.fermer', 'Fermer')}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                    {t('media.fermer', 'Fermer')}
                </button>
            </div>
        </div>,
        document.body,
    );
}
