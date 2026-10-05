<?php

namespace App;

enum SiteContentType: string
{
    case Text = 'text';
    case Icon = 'icon';
    case Image = 'image';
    case Url = 'url';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Texte',
            self::Icon => 'Icône',
            self::Image => 'Image',
            self::Url => 'Lien',
        };
    }

    /**
     * Icon, image and url values aren't translations — they're the same
     * across every locale, unlike Text which has its own value per locale.
     * A url in particular must never go through machine translation (see
     * QuickEditController), which would otherwise mangle it.
     */
    public function isSharedAcrossLocales(): bool
    {
        return $this !== self::Text;
    }

    /**
     * The quick-edit permission gating both editing and restoring this type.
     * Url reuses the text permission — there's no dedicated "link" role, and
     * whoever may edit plain text may as well set a link target.
     */
    public function permission(): string
    {
        return match ($this) {
            self::Text => 'quick-edit.text',
            self::Icon => 'quick-edit.icon',
            self::Image => 'quick-edit.image',
            self::Url => 'quick-edit.text',
        };
    }
}
