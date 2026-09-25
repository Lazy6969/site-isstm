import { Smile } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';

const EMOJIS = [
    '😀', '😂', '🥰', '😍', '😎', '🤔', '😅', '😭',
    '😢', '😡', '😮', '👍', '👎', '👏', '🙏', '💪',
    '❤️', '🔥', '🎉', '✅', '👋', '🙂', '😉', '🤗',
];

export default function EmojiPickerButton({ onSelect }) {
    const { t } = useTranslations();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex-shrink-0 text-slate-400 dark:text-slate-500" aria-label={t('messages.emoji', 'Emoji')}>
                <Smile className="h-4 w-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="grid w-64 grid-cols-8 gap-0.5 p-2">
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => onSelect(emoji)}
                        className="flex h-7 w-7 items-center justify-center rounded text-lg transition hover:scale-125"
                    >
                        {emoji}
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
