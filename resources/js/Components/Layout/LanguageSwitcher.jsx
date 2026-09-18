import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTranslations } from '../../lib/useTranslations';

const locales = [
    { code: 'fr', key: 'langue.fr' },
    { code: 'en', key: 'langue.en' },
    { code: 'mg', key: 'langue.mg' },
];

export default function LanguageSwitcher({ className = '' }) {
    const { t, locale } = useTranslations();

    function switchTo(code) {
        if (code === locale) return;
        router.post(`/locale/${code}`, {}, { preserveScroll: true, preserveState: false });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={`flex h-9 items-center gap-1.5 rounded-full border border-white/25 px-3 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:border-isstm-gold hover:text-isstm-gold focus:outline-none ${className}`}
                aria-label="Changer de langue"
            >
                <Languages className="h-3.5 w-3.5" />
                {locale}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((item) => (
                    <DropdownMenuItem
                        key={item.code}
                        onSelect={() => switchTo(item.code)}
                        className={item.code === locale ? 'font-semibold text-isstm-navy' : ''}
                    >
                        {t(item.key, item.code.toUpperCase())}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
