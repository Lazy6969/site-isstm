import { FileText } from 'lucide-react';

/**
 * Renders one message attachment according to its type — shared by
 * MessageBubble (1-to-1) and GroupMessageBubble so image/video/audio/other
 * files look identical in both chat contexts.
 */
export default function AttachmentPreview({ attachment: a }) {
    if (a.file_type === 'image') {
        return (
            <a href={`/storage/${a.path}`} target="_blank" rel="noopener" className="mt-1 block">
                <img src={`/storage/${a.path}`} alt="" className="max-h-48 rounded-lg" />
            </a>
        );
    }

    if (a.file_type === 'video') {
        return (
            <video src={`/storage/${a.path}`} controls className="mt-1 max-h-48 rounded-lg" />
        );
    }

    if (a.file_type === 'audio') {
        return <audio src={`/storage/${a.path}`} controls className="mt-1 h-10 w-56 max-w-full" />;
    }

    return (
        <a href={`/storage/${a.path}`} target="_blank" rel="noopener" className="mt-1 flex items-center gap-1 text-xs font-medium text-isstm-navy dark:text-white underline">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {a.original_name}
        </a>
    );
}
