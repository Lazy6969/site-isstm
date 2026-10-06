import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

/** Full-screen photo viewer: arrows / keyboard to browse, Esc to close. */
export default function PhotoLightbox({ images, startIndex, title, onClose }) {
    const { t } = useTranslations();
    const [index, setIndex] = useState(startIndex);
    const count = images.length;

    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
            if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
        }
        window.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [count, onClose]);

    return (
        <div className="animate-in fade-in-0 fixed inset-0 z-[100] flex flex-col bg-black/95 duration-200" role="dialog" aria-modal="true" aria-label={title}>
            <div className="flex items-center justify-between px-5 py-4 text-white">
                <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-white/60">
                        {index + 1} / {count}
                    </p>
                </div>
                <button type="button" onClick={onClose} aria-label={t('admin.common.cancel', 'Annuler')} className="rounded-full bg-white/10 p-2 transition hover:bg-white/25">
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={onClose}>
                {count > 1 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex((i) => (i - 1 + count) % count);
                        }}
                        aria-label={t('admin.activity_log.previous', 'Précédent')}
                        className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
                    >
                        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                    </button>
                )}
                <img key={index} src={`/${images[index]}`} alt="" onClick={(e) => e.stopPropagation()} className="animate-in fade-in-0 zoom-in-95 max-h-full max-w-full rounded-lg object-contain shadow-2xl duration-300" />
                {count > 1 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex((i) => (i + 1) % count);
                        }}
                        aria-label={t('admin.activity_log.next', 'Suivant')}
                        className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
                    >
                        <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </button>
                )}
            </div>

            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
                {images.map((image, i) => (
                    <button
                        key={image}
                        type="button"
                        onClick={() => setIndex(i)}
                        className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${i === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                        <img src={`/${image}`} alt="" className="h-full w-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
