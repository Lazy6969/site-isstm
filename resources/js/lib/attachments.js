/**
 * What the chat composers accept as an attachment. Mirrors the server-side
 * rule (App\Http\Requests\Concerns\ValidatesAttachmentMimes + max:10240 and
 * max:5 files) so a refused file is explained at once instead of failing
 * silently after the send.
 */
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const ATTACHMENT_GROUPS = {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    video: ['mp4', 'webm', 'mov'],
    audio: ['ogg', 'mp3', 'wav', 'm4a', 'weba'],
    pdf: ['pdf'],
    word: ['doc', 'docx'],
    excel: ['xls', 'xlsx', 'csv'],
    powerpoint: ['ppt', 'pptx'],
    texte: ['txt', 'xml', 'json'],
    archive: ['zip', 'rar', '7z'],
    autre: ['apk', 'exe', 'msi', 'dmg', 'iso', 'deb', 'dll', 'bin'],
};

const ALLOWED = new Set(Object.values(ATTACHMENT_GROUPS).flat());

/** Value for the file input's `accept` attribute. */
export const ATTACHMENT_ACCEPT = [...ALLOWED].map((extension) => `.${extension}`).join(',');

export function extensionOf(name) {
    const dot = String(name ?? '').lastIndexOf('.');

    return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

export function groupOf(name) {
    const extension = extensionOf(name);

    return Object.entries(ATTACHMENT_GROUPS).find(([, extensions]) => extensions.includes(extension))?.[0] ?? 'autre';
}

export function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Splits the picked files into the ones that can be attached and the reasons
 * the others were refused.
 *
 * @returns {{ accepted: File[], problems: string[] }}
 */
export function checkAttachments(existing, incoming) {
    const accepted = [];
    const problems = [];

    for (const file of incoming) {
        if (!ALLOWED.has(extensionOf(file.name))) {
            problems.push(`« ${file.name} » : ce type de fichier n’est pas accepté.`);
        } else if (file.size > MAX_ATTACHMENT_BYTES) {
            problems.push(`« ${file.name} » dépasse ${formatSize(MAX_ATTACHMENT_BYTES)} (${formatSize(file.size)}).`);
        } else if (file.size === 0) {
            problems.push(`« ${file.name} » est vide.`);
        } else if (existing.length + accepted.length >= MAX_ATTACHMENTS) {
            problems.push(`Maximum ${MAX_ATTACHMENTS} fichiers par message.`);
            break;
        } else {
            accepted.push(file);
        }
    }

    return { accepted, problems };
}
