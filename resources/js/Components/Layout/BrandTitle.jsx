import { router, usePage } from '@inertiajs/react';
import EditableText from '../QuickEdit/EditableText';

/**
 * The establishment's name/motto next to the logo — kept as a sibling of the
 * logo's own <a>/<Link> (see Header.jsx / SiteHeader.jsx) rather than nested
 * inside it, so each line's quick-edit pencil doesn't end up nested inside
 * (and fighting the click target of) the home link.
 *
 * Still navigates home on click, like the logo does — just via a click
 * handler on the wrapping <div> rather than a real <a>, since an <a> can't
 * contain the pencils' own <button>s without the invalid-HTML/double-click
 * problem described above. The handler bails out when the click actually
 * landed on a pencil, so editing still works normally.
 */
export default function BrandTitle({ className = '', href = '/' }) {
    const { content } = usePage().props;

    function handleClick(e) {
        if (e.target.closest('button')) {
            return;
        }
        if (href.startsWith('#')) {
            window.location.hash = href;
        } else {
            router.visit(href);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
    }

    return (
        <div
            className={`min-w-0 cursor-pointer border-l border-white/25 pl-2.5 sm:pl-3.5 ${className}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="link"
            tabIndex={0}
            aria-label="Retour à l'accueil"
        >
            <EditableText
                as="span"
                contentKey="header_titre_ligne1"
                className="block truncate text-[0.65rem] leading-tight font-bold tracking-tight text-white sm:text-[0.95rem]"
            >
                {content?.header_titre_ligne1 ?? 'Institut Supérieur des Sciences'}
            </EditableText>
            <EditableText
                as="span"
                contentKey="header_titre_ligne2"
                className="block truncate text-[0.65rem] leading-tight font-bold tracking-tight text-white sm:text-[0.95rem]"
            >
                {content?.header_titre_ligne2 ?? 'et Technologies de Mahajanga'}
            </EditableText>
            <EditableText
                as="span"
                contentKey="header_devise"
                className="mt-0.5 hidden text-[0.65rem] font-bold tracking-[0.14em] text-isstm-gold uppercase sm:mt-1 sm:block"
            >
                {content?.header_devise ?? 'Honnêteté - Discipline - Excellence'}
            </EditableText>
        </div>
    );
}
