import { usePage } from '@inertiajs/react';
import ExternalPencil from './ExternalPencil';
import EditLinkDialog from './EditLinkDialog';

/**
 * An external-link CTA whose target URL (a SiteContentType::Url content key)
 * only a super admin can set, via the pencil — everyone else just sees the
 * button, disabled until a link has actually been configured. Unlike
 * EditableButton, the label here is static (passed as `children`): only the
 * href is content-driven.
 */
export default function EditableLinkButton({ contentKey, className, disabledClassName, children }) {
    const { content } = usePage().props;
    const href = content?.[contentKey];

    const button = href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    ) : (
        <span className={disabledClassName ?? className} aria-disabled="true">
            {children}
        </span>
    );

    return (
        <span className="relative inline-flex">
            {button}
            <ExternalPencil
                label="Modifier ce lien"
                dialog={EditLinkDialog}
                dialogProps={{ contentKey, initialValue: href ?? '' }}
            />
        </span>
    );
}
