<?php

namespace App;

enum SiteContentType: string
{
    case Text = 'text';
    case Icon = 'icon';
    case Image = 'image';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Texte',
            self::Icon => 'Icône',
            self::Image => 'Image',
        };
    }

    /**
     * Icon and image values aren't translations — they're the same across
     * every locale, unlike Text which has its own value per locale.
     */
    public function isSharedAcrossLocales(): bool
    {
        return $this !== self::Text;
    }

    /**
     * The quick-edit permission gating both editing and restoring this type.
     */
    public function permission(): string
    {
        return match ($this) {
            self::Text => 'quick-edit.text',
            self::Icon => 'quick-edit.icon',
            self::Image => 'quick-edit.image',
        };
    }
}
