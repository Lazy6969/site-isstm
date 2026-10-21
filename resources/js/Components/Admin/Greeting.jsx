import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '../../lib/useTranslations';
import { greetingPeriod } from '../../lib/greeting';

function useNow() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    return now;
}

export default function Greeting({ overview }) {
    const { t, locale } = useTranslations();
    const user = usePage().props.auth?.user;
    const now = useNow();
    const dateLocale = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-FR' }[locale] ?? 'fr-FR';
    const date = new Intl.DateTimeFormat(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const time = new Intl.DateTimeFormat(dateLocale, { hour: '2-digit', minute: '2-digit' }).format(now);
    // Follows the clock: bonjour until noon, bonne après-midi until 18h, bonsoir after.
    const greeting = {
        matin: t('admin.dashboard.hello_matin', 'Bonjour,'),
        apresmidi: t('admin.dashboard.hello_apresmidi', 'Bonne après-midi,'),
        soir: t('admin.dashboard.hello_soir', 'Bonsoir,'),
    }[greetingPeriod(now.getHours())];

    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-light tracking-tight text-admin-text">
                    {greeting} <span className="font-bold">{user?.name}</span>
                </h1>
                <p className="mt-1 text-sm text-admin-text-secondary">{overview ?? t('admin.dashboard.overview', 'Voici un aperçu général de votre administration ISSTM.')}</p>
            </div>
            <div className="text-right">
                <p className="text-sm capitalize text-admin-text-secondary">{date}</p>
                <p className="text-3xl font-bold tabular-nums text-admin-text">{time}</p>
            </div>
        </div>
    );
}
