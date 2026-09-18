import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../lib/useDarkMode';
import { useTranslations } from '../../lib/useTranslations';

export default function DarkModeToggle({ className = '' }) {
    const [dark, setDark] = useDarkMode();
    const { t } = useTranslations();
    const label = dark ? t('theme.mode_clair', 'Mode clair') : t('theme.mode_sombre', 'Mode sombre');

    return (
        <button
            type="button"
            onClick={() => setDark((value) => !value)}
            title={label}
            aria-label={label}
            className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 ${className}`}
        >
            {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
        </button>
    );
}
