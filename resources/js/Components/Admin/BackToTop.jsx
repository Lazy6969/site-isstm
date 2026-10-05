import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const SHOW_AFTER = 300;

/** Floating button that scrolls the page back to the top; appears once the page has been scrolled. */
export default function BackToTop() {
    const { t } = useTranslations();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > SHOW_AFTER);
        }

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function scrollToTop() {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label={t('admin.footer.back_to_top', 'Retour en haut')}
            title={t('admin.footer.back_to_top', 'Retour en haut')}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-admin-accent to-admin-accent/80 text-admin-accent-foreground shadow-lg shadow-admin-accent/30 transition-all duration-300 hover:-translate-y-1 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-admin-accent/30 ${
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
            }`}
        >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
    );
}
