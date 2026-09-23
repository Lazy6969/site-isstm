<?php

namespace App;

/**
 * The public header/nav bar's own background — independent of the site's
 * primary brand color (SitePrimaryColor), the same separation the admin panel
 * already has between AppearancePalette (accent) and AppearanceChromeColor
 * (sidebar). Overrides --color-isstm-menu / --color-isstm-menu-text
 * (resources/css/app.css) via app.blade.php. Default means "no override" —
 * the menu keeps following --color-isstm-navy, today's behavior.
 */
enum SiteMenuColor: string
{
    case Default = 'default';
    case White = 'white';
    case Black = 'black';
    case Slate = 'slate';
    case Blue = 'blue';
    case Emerald = 'emerald';
    case Violet = 'violet';
    case Amber = 'amber';
    case Rose = 'rose';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Défaut (couleur principale)',
            self::White => 'Blanc',
            self::Black => 'Noir',
            self::Slate => 'Ardoise',
            self::Blue => 'Bleu',
            self::Emerald => 'Émeraude',
            self::Violet => 'Violet',
            self::Amber => 'Ambre',
            self::Rose => 'Rose',
        };
    }

    /**
     * [background, text]. Default is never rendered (app.blade.php skips the
     * override for it), so its pair here is only a harmless placeholder.
     *
     * @return array{0: string, 1: string}
     */
    public function colors(): array
    {
        return match ($this) {
            self::Default => ['', ''],
            self::White => ['#ffffff', '#0f172a'],
            self::Black => ['#0b0e14', '#ffffff'],
            self::Slate => ['#1e293b', '#ffffff'],
            self::Blue => ['#1d4ed8', '#ffffff'],
            self::Emerald => ['#047857', '#ffffff'],
            self::Violet => ['#6d28d9', '#ffffff'],
            self::Amber => ['#b45309', '#ffffff'],
            self::Rose => ['#be123c', '#ffffff'],
        };
    }

    /**
     * @return array<int, array{value: string, label: string, swatch: ?string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $color) => ['value' => $color->value, 'label' => $color->label(), 'swatch' => $color === self::Default ? null : $color->colors()[0]],
            self::cases(),
        );
    }
}
