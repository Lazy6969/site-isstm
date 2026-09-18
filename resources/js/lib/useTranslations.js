import { usePage } from '@inertiajs/react';

export function useTranslations() {
    const { translations, locale } = usePage().props;

    function t(key, fallback = key) {
        return translations?.[key] ?? fallback;
    }

    return { t, locale: locale ?? 'fr' };
}
