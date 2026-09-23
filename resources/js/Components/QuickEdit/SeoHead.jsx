import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import EditSeoDialog from './EditSeoDialog';

/**
 * Drop-in replacement for a page's <Head title="..." /> that also lets a
 * super admin edit the page's meta title/description in place. Both are
 * plain Text site_contents rows (`{seoKey}_seo_titre` / `_seo_description`),
 * so they reuse EditTextDialog's underlying endpoint and permission — no new
 * backend surface for this feature. Falls back to defaultTitle/defaultDescription
 * when nothing's been set yet (mirrors every other EditableText usage).
 */
export default function SeoHead({ seoKey, defaultTitle, defaultDescription = '' }) {
    const { canEdit, active } = useQuickEdit();
    const { content } = usePage().props;
    const [open, setOpen] = useState(false);

    const titleKey = `${seoKey}_seo_titre`;
    const descriptionKey = `${seoKey}_seo_description`;
    const title = content[titleKey] || defaultTitle;
    const description = content[descriptionKey] || defaultDescription;

    return (
        <>
            <Head title={title}>{description && <meta name="description" content={description} />}</Head>
            {canEdit && active && (
                <>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="fixed right-5 bottom-5 z-40 hidden items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-xs font-semibold text-amber-950 shadow-lg ring-2 ring-white transition hover:scale-105 md:flex"
                        aria-label="Modifier le référencement (SEO) de cette page"
                        title="Modifier le référencement (SEO) de cette page"
                    >
                        <Globe className="h-4 w-4" aria-hidden="true" />
                        SEO
                    </button>
                    <EditSeoDialog
                        open={open}
                        onClose={() => setOpen(false)}
                        titleKey={titleKey}
                        descriptionKey={descriptionKey}
                        initialTitle={title}
                        initialDescription={description}
                    />
                </>
            )}
        </>
    );
}
