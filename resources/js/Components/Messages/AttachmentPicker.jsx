import { useRef, useState } from 'react';
import { AlertCircle, File, FileArchive, FileAudio, FileSpreadsheet, FileText, FileVideo, Image as ImageIcon, Paperclip, Presentation, X } from 'lucide-react';
import { ATTACHMENT_ACCEPT, checkAttachments, formatSize, groupOf, MAX_ATTACHMENTS } from '../../lib/attachments';
import { useTranslations } from '../../lib/useTranslations';

const GROUP_ICONS = {
    image: ImageIcon,
    video: FileVideo,
    audio: FileAudio,
    pdf: FileText,
    word: FileText,
    excel: FileSpreadsheet,
    powerpoint: Presentation,
    texte: FileText,
    archive: FileArchive,
    autre: File,
};

/**
 * Picker state shared by the paperclip button and the list of chosen files.
 * `files` / `setFiles` are the form's own `attachments` value; the hook adds the
 * new picks (checked against the server's rules), remembers why a file was
 * refused, and also surfaces the server's own validation messages.
 */
export function useAttachmentPicker(files, setFiles, serverErrors = {}) {
    const [problems, setProblems] = useState([]);

    function add(incoming) {
        const { accepted, problems: refused } = checkAttachments(files, incoming);
        setProblems(refused);
        if (accepted.length > 0) setFiles([...files, ...accepted]);
    }

    function remove(index) {
        setProblems([]);
        setFiles(files.filter((_, i) => i !== index));
    }

    const fromServer = Object.entries(serverErrors)
        .filter(([key]) => key === 'attachments' || key.startsWith('attachments.'))
        .map(([, message]) => message);

    return { add, remove, errors: [...problems, ...fromServer], clearErrors: () => setProblems([]) };
}

/** The paperclip: opens the file chooser and hands the picked files to the hook. */
export function AttachmentButton({ picker, disabled = false }) {
    const { t } = useTranslations();
    const input = useRef(null);

    return (
        <>
            <button
                type="button"
                onClick={() => input.current?.click()}
                disabled={disabled}
                title={t('groupes.piece_jointe', 'Pièce jointe')}
                aria-label={t('groupes.piece_jointe', 'Pièce jointe')}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-isstm-navy disabled:opacity-40 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"
            >
                <Paperclip className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
                ref={input}
                type="file"
                multiple
                accept={ATTACHMENT_ACCEPT}
                className="hidden"
                onChange={(event) => {
                    picker.add(Array.from(event.target.files ?? []));
                    // Lets the same file be picked again after removing it.
                    event.target.value = '';
                }}
            />
        </>
    );
}

/** Chips for the chosen files (with an image thumbnail when it is one) and any refusal message. */
export function SelectedAttachments({ files, picker }) {
    const { t } = useTranslations();

    if (files.length === 0 && picker.errors.length === 0) return null;

    return (
        <div className="border-t border-slate-100 px-3 pt-2 dark:border-slate-700">
            {files.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                    {files.map((file, index) => {
                        const group = groupOf(file.name);
                        const Icon = GROUP_ICONS[group] ?? File;

                        return (
                            <li key={`${file.name}-${index}`} className="flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1.5 pr-2 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {group === 'image' ? (
                                    <img src={URL.createObjectURL(file)} alt="" className="h-5 w-5 rounded-full object-cover" onLoad={(event) => URL.revokeObjectURL(event.currentTarget.src)} />
                                ) : (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-isstm-navy/10 text-isstm-navy dark:bg-white/10 dark:text-white">
                                        <Icon className="h-3 w-3" aria-hidden="true" />
                                    </span>
                                )}
                                <span className="max-w-[10rem] truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-400">{formatSize(file.size)}</span>
                                <button type="button" onClick={() => picker.remove(index)} aria-label={t('nav.annuler', 'Annuler')} className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600">
                                    <X className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </li>
                        );
                    })}
                    {files.length >= MAX_ATTACHMENTS && <li className="self-center text-[10px] text-slate-400">{t('messages.max_fichiers', 'Maximum atteint')}</li>}
                </ul>
            )}
            {picker.errors.map((message) => (
                <p key={message} className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    {message}
                </p>
            ))}
        </div>
    );
}
