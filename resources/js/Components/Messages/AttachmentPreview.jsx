import { Download, FileText } from 'lucide-react';

/**
 * Renders one message attachment according to its type — shared by
 * MessageBubble (1-to-1) and GroupMessageBubble so image/video/audio/other
 * files look identical in both chat contexts. Every type carries a `download`
 * link (not just "open"), since browsers otherwise navigate to or stream
 * media in-place instead of saving it — documents, apps, archives etc. need
 * to be downloadable just as much as photos.
 */
export default function AttachmentPreview({ attachment: a }) {
    if (a.file_type === 'image') {
        return (
            <a href={`/storage/${a.path}`} download={a.original_name} className="mt-1 block">
                <img src={`/storage/${a.path}`} alt="" className="max-h-48 rounded-lg" />
            </a>
        );
    }

    if (a.file_type === 'video') {
        return (
            <div className="mt-1">
                <video src={`/storage/${a.path}`} controls className="max-h-48 rounded-lg" />
                <a href={`/storage/${a.path}`} download={a.original_name} className="mt-1 flex items-center gap-1 text-[11px] font-medium text-isstm-navy dark:text-white underline">
                    <Download className="h-3 w-3" aria-hidden="true" />
                    {a.original_name}
                </a>
            </div>
        );
    }

    if (a.file_type === 'audio') {
        return (
            <div className="mt-1">
                <audio src={`/storage/${a.path}`} controls className="h-10 w-56 max-w-full" />
                <a href={`/storage/${a.path}`} download={a.original_name} className="mt-1 flex items-center gap-1 text-[11px] font-medium text-isstm-navy dark:text-white underline">
                    <Download className="h-3 w-3" aria-hidden="true" />
                    {a.original_name}
                </a>
            </div>
        );
    }

    return (
        <a href={`/storage/${a.path}`} download={a.original_name} className="mt-1 flex items-center gap-1 text-xs font-medium text-isstm-navy dark:text-white underline">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {a.original_name}
        </a>
    );
}
