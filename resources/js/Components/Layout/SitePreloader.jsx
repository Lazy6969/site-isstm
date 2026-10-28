import { createPortal } from 'react-dom';
import { useTranslations } from '../../lib/useTranslations';

/**
 * Same splash screen as the one shown once per tab on first load
 * (resources/views/app.blade.php, .site-preloader rules in app.css) — this
 * React version reuses the identical classes so the two stay visually
 * identical, rendered wherever a page wants that same branded loading
 * moment again (see Communaute/Index.jsx). Portaled to document.body so a
 * post Card's own hover `transform` (see app.css, .community-shell cards)
 * can never trap this `position: fixed` overlay inside a card's box — the
 * same issue MediaLightbox works around.
 */
export default function SitePreloader({ hidden = false, logo = '/images/logo-isstm.svg' }) {
    const { t } = useTranslations();

    return createPortal(
        <div className={`site-preloader${hidden ? ' is-hidden' : ''}`} aria-hidden="true">
            <div className="site-preloader-visual">
                <div className="site-preloader-ring" />
                <img src={logo} alt="ISSTM" className="site-preloader-logo" />
            </div>
            <p className="site-preloader-text">
                {t('preloader.chargement', 'Chargement')}
                <span className="site-preloader-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </span>
            </p>
            <div className="site-preloader-bar">
                <div className="site-preloader-bar-fill" />
            </div>
        </div>,
        document.body,
    );
}
