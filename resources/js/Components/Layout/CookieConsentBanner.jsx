import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

const DISMISS_KEY = 'cookieNoticeAcknowledged';

// Hidden on /console: the admin backend has its own chrome, same reasoning
// as FloatingAccountGroup/QuickEditToggle excluding it elsewhere in app.jsx.
function isHidden(url) {
    return url === '/console' || url.startsWith('/console/') || url.startsWith('/console?');
}

/**
 * One-time notice, not a cookie-category consent form: this site only ever
 * sets strictly-necessary cookies (session, CSRF, locale, theme — see
 * Confidentialite.jsx's "Cookies et session" section) and no tracking or
 * advertising cookies, so GDPR doesn't require an accept/reject choice here,
 * only disclosure. Dismissing it is permanent (no re-show after N days,
 * unlike InstallPwaPrompt) since this is a one-time legal notice, not
 * recurring marketing.
 */
export default function CookieConsentBanner() {
    const { url } = usePage();
    const { t } = useTranslations();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem(DISMISS_KEY) === 'true') {
                return;
            }
        } catch {
            // localStorage unavailable — show the notice; dismissing it just
            // won't persist, which is an acceptable degradation.
        }
        setVisible(true);
    }, []);

    function acknowledge() {
        setVisible(false);
        try {
            localStorage.setItem(DISMISS_KEY, 'true');
        } catch {
            // Nothing to persist to — the notice will simply reappear next visit.
        }
    }

    if (!visible || isHidden(url)) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] px-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
            <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl bg-isstm-navy px-4 py-3 text-center shadow-xl sm:flex-row sm:text-left">
                <p className="flex-1 text-sm text-white/90">
                    {t(
                        'cookies.message',
                        "Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement (connexion, langue, thème) — aucun cookie publicitaire ou de traçage.",
                    )}{' '}
                    <Link href="/confidentialite" className="underline hover:text-isstm-gold">
                        {t('cookies.en_savoir_plus', 'En savoir plus')}
                    </Link>
                </p>
                <button
                    type="button"
                    onClick={acknowledge}
                    className="flex-shrink-0 rounded-full bg-isstm-gold px-4 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                >
                    {t('cookies.jai_compris', "J'ai compris")}
                </button>
            </div>
        </div>
    );
}
